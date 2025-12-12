from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Count, Q
import datetime
from .models import Candidate, Application
from jobs.models import JobPosting
from .serializers import ApplicationSerializer, CandidateSerializer


class ApplicationCreateView(views.APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        # 1. Extract Candidate Data
        candidate_data = {
            "name": request.data.get("name"),
            "email": request.data.get("email"),
            "phone": request.data.get("phone"),
        }
        
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

        # Extract additional fields
        import json
        answers_str = request.data.get("answers")
        answers_data = []
        if answers_str:
            try:
                answers_data = json.loads(answers_str)
            except ValueError:
                pass
        
        experience_years = request.data.get("experience_years")
        current_ctc = request.data.get("current_ctc")
        expected_ctc = request.data.get("expected_ctc")
        notice_period = request.data.get("notice_period")

        def safe_float(val):
            try: return float(val) if val else None
            except: return None
        
        def safe_int(val):
            try: return int(val) if val else None
            except: return None

        try:
            application = Application.objects.create(
                job=job,
                candidate=candidate,
                resume=resume_file,
                experience_years=safe_int(experience_years),
                current_ctc=safe_float(current_ctc),
                expected_ctc=safe_float(expected_ctc),
                notice_period=safe_int(notice_period),
                answers=answers_data
            )
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        serializer = ApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ApplicationListView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    # filterset_fields = ['status', 'job'] # Requires django-filter, manually filtering below instead

    def get_queryset(self):
        queryset = Application.objects.select_related('candidate', 'job').all().order_by('-applied_at')
        job_id = self.request.query_params.get('job')
        if job_id:
            queryset = queryset.filter(job_id=job_id)
        
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset

class ApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer

from .models import ApplicationComment
from .serializers import ApplicationCommentSerializer

class AddCommentView(generics.CreateAPIView):
    queryset = ApplicationComment.objects.all()
    serializer_class = ApplicationCommentSerializer

    def post(self, request, *args, **kwargs):
        app_id = self.kwargs.get('pk')
        try:
            application = Application.objects.get(id=app_id)
        except Application.DoesNotExist:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if comment exists
        comment = ApplicationComment.objects.filter(application=application).first()
        
        if comment:
            # Update existing
            serializer = self.get_serializer(comment, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Create new
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                serializer.save(application=application)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DashboardStatsView(views.APIView):
    def get(self, request):
        total = Application.objects.count()
        today = Application.objects.filter(applied_at__date__gte=datetime.date.today()).count()
        
        # Status counts
        status_counts = Application.objects.values('status').annotate(count=Count('status'))
        
        return Response({
            "total_candidates": total,
            "today_candidates": today,
            "status_breakdown": status_counts
        })
