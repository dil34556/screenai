from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Count, Q
import datetime
from .models import Candidate, Application
from jobs.models import JobPosting
from .serializers import ApplicationSerializer, CandidateSerializer
from screenai.services.ai_screener import AIScreener

class ApplicationCreateView(views.APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        # 1. Extract Candidate Data
        candidate_data = {
            "name": request.data.get("name"),
            "email": request.data.get("email"),
            "phone": request.data.get("phone"),
            "linkedin_url": request.data.get("linkedin_url"),
        }
        platform = request.data.get("platform", "Website")
        
        job_id = request.data.get("job")
        resume_file = request.FILES.get("resume")

        if not job_id or not resume_file:
            return Response({"error": "Job ID and Resume are required."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Get or Create Candidate
        candidate, created = Candidate.objects.get_or_create(email=candidate_data['email'], defaults=candidate_data)
        
        # 3. Create Application (Initial)
        try:
            job = JobPosting.objects.get(id=job_id)
        except JobPosting.DoesNotExist:
             return Response({"error": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        application = Application.objects.create(
            job=job,
            candidate=candidate,
            resume=resume_file,
            platform=platform
        )

        # 4. Trigger AI Screening (Synchronous for MVP)
        # Note: In production, offload this to Celery/background task
        screener = AIScreener()
        # We need the file path. After save, it's on disk (because default storage is filesystem)
        if application.resume and hasattr(application.resume, 'path'):
            resume_text = screener.extract_text_from_pdf(application.resume.path)
            
            # Combine Title + Description + Questions for context
            jd_text = f"Title: {job.title}\n\nDescription: {job.description}\n\nRequired Skills: {job.required_skills}"
            
            ai_results = screener.analyze_application(resume_text, jd_text)
            
            # 5. Update Application with AI Results
            application.ai_match_score = ai_results.get("match_score")
            application.ai_summary = ai_results.get("summary")
            application.ai_missing_skills = ai_results.get("missing_skills")
            application.status = 'SCREENED'
            application.save()

        serializer = ApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ApplicationListView(generics.ListAPIView):
    queryset = Application.objects.select_related('candidate', 'job').all().order_by('-ai_match_score')
    serializer_class = ApplicationSerializer
    filterset_fields = ['status', 'job', 'platform']

class DashboardStatsView(views.APIView):
    def get(self, request):
        total = Application.objects.count()
        today = Application.objects.filter(applied_at__date__gte=datetime.date.today()).count() if hasattr('datetime', 'date') else 0 
        # Fix: need datetime import
        
        # Status counts
        status_counts = Application.objects.values('status').annotate(count=Count('status'))
        
        return Response({
            "total_candidates": total,
            "today_candidates": today,
            "status_breakdown": status_counts
        })
