from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Count, Q
from django.db.models.functions import TruncDate, TruncWeek
from django.db.models import F
import datetime
from .models import Candidate, Application, ApplicationComment
from jobs.models import JobPosting
from .serializers import ApplicationSerializer, CandidateSerializer, ApplicationCommentSerializer
from screenai.services.resume_parser.parser import parse_resume
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.http import JsonResponse
import os
import json

from screenai.services.resume_parser.parser import parse_resume



class ApplicationListCreateView(generics.ListAPIView):
    # Standard ListAPIView settings
    serializer_class = ApplicationSerializer
    
    # Settings from ApplicationCreateView
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        queryset = Application.objects.select_related('candidate', 'job').all().order_by('-applied_at')
        
        # 1. Multi-tenant Filter
        # employee_id = self.request.headers.get('X-Employee-Id')
        # if employee_id:
        #     queryset = queryset.filter(job__recruiter_id=employee_id)
            
        job_id = self.request.query_params.get('job')
        if job_id:
            queryset = queryset.filter(job_id=job_id)
        
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset

    def post(self, request, *args, **kwargs):
        # 1. Extract Candidate Data
        candidate_data = {
            "name": request.data.get("name"),
            "email": request.data.get("email"),
            "phone": request.data.get("phone"),
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

        # Extract additional fields

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
            # Extract skills and experiences
            skills_input = request.data.get("skills", "")
            skills_list = []
            if isinstance(skills_input, str):
                if skills_input.strip():
                     skills_list = [s.strip() for s in skills_input.split(',')]
            elif isinstance(skills_input, list):
                skills_list = skills_input

            experiences_str = request.data.get("experiences")
            experiences_data = []
            if experiences_str:
                try:
                    if isinstance(experiences_str, str):
                        experiences_data = json.loads(experiences_str)
                    else:
                        experiences_data = experiences_str
                except ValueError:
                    pass

            application = Application.objects.create(
                job=job,
                candidate=candidate,
                resume=resume_file,
                platform=platform,
                experience_years=safe_int(experience_years),
                current_ctc=safe_float(current_ctc),
                expected_ctc=safe_float(expected_ctc),
                notice_period=safe_int(notice_period),
                answers=answers_data,
                skills=skills_list
            )

            # 👇 Non-blocking Parsing (Threaded)
            def run_background_parsing(app_id, file_path):
                import json
                from screenai.services.resume_parser.parser import parse_resume
                try:
                    # Re-fetch because threads might have race conditions if we pass obj
                    app = Application.objects.get(id=app_id)
                    
                    # Get Screening Questions from Job
                    questions_list = []
                    if app.job.screening_questions:
                         questions_list = [q.get('question') for q in app.job.screening_questions if isinstance(q, dict) and q.get('question')]

                    parsed_data = parse_resume(file_path, custom_questions=questions_list)

                    # Update fields (Merge skills)
                    app.total_years_experience = parsed_data["data"]["total_years_experience"]
                    
                    # Merge existing skills with parsed skills to prevent data loss
                    current_skills = set(app.skills or [])
                    new_skills = set(parsed_data["data"]["skills"] or [])
                    app.skills = list(current_skills.union(new_skills))
                    
                    app.education = parsed_data["data"]["education"]
                    app.certifications = parsed_data["data"]["certifications"]
                    
                    # Save Answers (Only if not already answered manually?)
                    # Strategy: If manual answers exist, keep them. If parsed answers exist, append/merge?
                    # For now: If manual answers are empty, fill with parsed.
                    if not app.answers and parsed_data["data"].get("screening_answers"):
                         app.answers = parsed_data["data"]["screening_answers"]

                    app.resume_text = json.dumps(parsed_data, indent=2)
                    app.save()
                    print(f"Background parsing complete for App {app_id}")
                except Exception as e:
                    print(f"WARNING: Background parsing failed for App ID {app_id}: {e}")

            # Start Thread
            import threading
            threading.Thread(target=run_background_parsing, args=(application.id, application.resume.path)).start()
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        serializer = ApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer

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

class ParseApplicationResumeView(views.APIView):
    def post(self, request, pk):
        try:
            application = Application.objects.get(pk=pk)
        except Application.DoesNotExist:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if not application.resume:
            return Response({"error": "No resume file to parse"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Re-run parser
            questions_list = []
            if application.job.screening_questions:
                    questions_list = [q.get('question') for q in application.job.screening_questions if isinstance(q, dict) and q.get('question')]
            
            parsed_data = parse_resume(application.resume.path, custom_questions=questions_list)
            
            # Update fields
            application.total_years_experience = parsed_data["data"]["total_years_experience"]
            application.skills = parsed_data["data"]["skills"]
            application.education = parsed_data["data"]["education"]
            application.certifications = parsed_data["data"]["certifications"]
            
            # Update answers (Overwrite on reparse?) - YES, explicitly requested action
            if parsed_data["data"].get("screening_answers"):
                application.answers = parsed_data["data"]["screening_answers"]
            
            application.resume_text = json.dumps(parsed_data, indent=2)
            
            application.save()
            
            return Response({
                "message": "Resume parsed successfully",
                "data": parsed_data["data"]
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DashboardStatsView(views.APIView):
    def get(self, request):
        employee_id = request.headers.get('X-Employee-Id')
        
        apps_query = Application.objects.all()
        # if employee_id:
        #     apps_query = apps_query.filter(job__recruiter_id=employee_id)
            
        total = apps_query.count()
        today = apps_query.filter(applied_at__date__gte=datetime.date.today()).count()
        
        # Status counts
        status_counts = apps_query.values('status').annotate(count=Count('status'))
        
        return Response({
            "total_candidates": total,
            "today_candidates": today,
            "status_breakdown": status_counts
        })

class PreviewResumeView(views.APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        resume_file = request.FILES.get("resume")
        if not resume_file:
            return Response({"error": "No resume file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        # Save temporarily
        temp_path = default_storage.save(f"temp/{resume_file.name}", resume_file)
        full_path = default_storage.path(temp_path)

        try:
            parsed_data = parse_resume(full_path)
            
            # Cleanup
            default_storage.delete(temp_path)
            if os.path.exists(full_path):
                os.remove(full_path)

            return Response({
                "message": "Resume parsed successfully",
                "data": parsed_data["data"]
            }, status=status.HTTP_200_OK)

            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            # Cleanup on error
            if os.path.exists(full_path):
                try: os.remove(full_path)
                except: pass
            
            error_msg = str(e).lower()
            
            # LOGGING
            with open("server_error.log", "a") as f:
                f.write(f"[{datetime.datetime.now()}] Error parsing resume: {str(e)}\n")

            if "quota" in error_msg or "429" in error_msg or "404" in error_msg or "valid api key" in error_msg or "403" in error_msg or "permission" in error_msg:
                 # Soft fail: Return empty data so user can enter manually
                return Response({
                    "message": "Autofill unavailable (API Error). Please enter details manually.",
                    "data": {
                        "candidate_name": "",
                        "email": "",
                        "phone": "",
                        "total_years_experience": 0,
                        "skills": [],
                        "education": [],
                        "certifications": [],
                        "work_experience": []
                    }
                }, status=status.HTTP_200_OK)

            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AnalyticsView(views.APIView):
    def get(self, request):
        try:
            employee_id = request.headers.get('X-Employee-Id')
            
            # Base query
            apps_query = Application.objects.all()
            if employee_id:
                apps_query = apps_query.filter(job__recruiter_id=employee_id)
            
            # 1. Summary Stats
            total_applications = apps_query.count()
            
            # Fix: "Hired This Month" - Count applications from this month that are HIRED/OFFER
            # Note: Ideally we'd use updated_at, but applied_at is our best proxy without schema changes.
            this_month_hired = apps_query.filter(
                applied_at__month=datetime.date.today().month,
                status__in=['OFFER', 'HIRED']
            ).count()
            
            # Fix: "Applications Today" (formerly calls)
            today_applications = apps_query.filter(applied_at__date=datetime.date.today()).count()
            
            # Conversion rate (OFFER/HIRED / total)
            hired_total_count = apps_query.filter(status__in=['OFFER', 'HIRED']).count()
            conversion_rate = round((hired_total_count / total_applications * 100), 1) if total_applications > 0 else 0
            
            # 2. Weekly Application Trend (last 4 weeks)
            today = datetime.date.today()
            four_weeks_ago = today - datetime.timedelta(weeks=4)
            
            weekly_data = apps_query.filter(applied_at__date__gte=four_weeks_ago).annotate(
                week=TruncWeek('applied_at')
            ).values('week').annotate(
                applications=Count('id'),
                hired=Count('id', filter=Q(status__in=['OFFER', 'HIRED']))
            ).order_by('week')
            
            # Format weekly data
            weekly_trend = []
            for i, week in enumerate(weekly_data, 1):
                weekly_trend.append({
                    'week': f"Week {week['week'].strftime('%W')}",
                    'applications': week['applications'],
                    'hired': week['hired']
                })
            
            # Fill in missing weeks if needed (simplified)
            # 3. Pipeline Status Distribution
            pipeline_distribution = list(apps_query.values('status').annotate(count=Count('status')))
            
            # 4. Daily Applications (last 7 days)
            seven_days_ago = today - datetime.timedelta(days=7)
            daily_data = apps_query.filter(applied_at__date__gte=seven_days_ago).annotate(
                day=TruncDate('applied_at')
            ).values('day').annotate(
                count=Count('id')
            ).order_by('day')
            
            # Fill in missing days
            daily_applications = []
            for i in range(7):
                date = seven_days_ago + datetime.timedelta(days=i)
                day_name = date.strftime('%a')
                count = next((d['count'] for d in daily_data if d['day'] == date), 0)
                daily_applications.append({
                    'day': day_name,
                    'count': count
                })
            
            # 5. Platform Performance
            platform_stats = apps_query.values('platform').annotate(
                count=Count('id'),
                hired=Count('id', filter=Q(status__in=['OFFER', 'HIRED']))
            )
            
            platform_performance = []
            for platform in platform_stats:
                count = platform['count']
                hired = platform['hired']
                percentage = round((hired / count * 100), 1) if count > 0 else 0
                platform_performance.append({
                    'platform': platform['platform'] or 'Website',
                    'count': count,
                    'percentage': percentage # This is conversion rate
                })

            # 6. HR Team Performance
            hr_stats = apps_query.values(
                'job__recruiter__id',
                'job__recruiter__email'
            ).annotate(
                shortlisted=Count('id', filter=Q(status__in=['INTERVIEW', 'SCREENED'])),
                rejected=Count('id', filter=Q(status='REJECTED')),
                hired=Count('id', filter=Q(status__in=['OFFER', 'HIRED']))
            )

            hr_team_performance = []
            for hr in hr_stats:
                total_decisions = hr['shortlisted'] + hr['rejected'] + hr['hired']
                total_local = total_decisions if total_decisions > 0 else 1
                conversion = round((hr['hired'] / total_local * 100), 1)

                # Employee model only has email
                name = hr['job__recruiter__email'] or 'Unknown Recruiter'

                hr_team_performance.append({
                    'name': name,
                    'email': hr['job__recruiter__email'],
                    'calls_today': 0, 
                    'shortlisted': hr['shortlisted'],
                    'rejected': hr['rejected'],
                    'hired': hr['hired'],
                    'conversion': conversion
                })

            return Response({
                'summary': {
                    'total_applications': total_applications,
                    'hired_this_month': this_month_hired,
                    'total_calls_today': today_applications, # Actually New Apps Today
                    'conversion_rate': conversion_rate
                },
                'weekly_trend': weekly_trend,
                'pipeline_distribution': pipeline_distribution,
                'daily_applications': daily_applications,
                'platform_performance': platform_performance,
                'hr_team_performance': hr_team_performance
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'error': str(e),
                'summary': {
                    'total_applications': 0,
                    'hired_this_month': 0,
                    'total_calls_today': 0,
                    'conversion_rate': 0
                },
                'weekly_trend': [],
                'pipeline_distribution': [],
                'daily_applications': [],
                'platform_performance': [],
                'hr_team_performance': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class QuickScanResumeView(views.APIView):
    def post(self, request):
        try:
            if 'resume' not in request.FILES:
                return Response({"error": "No resume file provided"}, status=status.HTTP_400_BAD_REQUEST)
            
            resume_file = request.FILES['resume']
            
            # Save temporarily
            file_name = default_storage.save(f"temp/quick_{resume_file.name}", resume_file)
            full_path = default_storage.path(file_name)
            
            try:
                # Extract Text Only
                from screenai.services.resume_parser.parser import extract_pdf_text, extract_docx_text, scan_resume_regex
                
                ext = os.path.splitext(full_path)[1].lower()
                text = ""
                if ext == '.pdf':
                    text = extract_pdf_text(full_path)
                elif ext in ['.docx', '.doc']:
                    text = extract_docx_text(full_path)
                
                # Regex Scan
                data = scan_resume_regex(text)
                
                # Cleanup
                default_storage.delete(file_name)
                if os.path.exists(full_path):
                    os.remove(full_path)
                    
                return Response({"data": data}, status=status.HTTP_200_OK)

            except Exception as e:
                # Cleanup
                if os.path.exists(full_path):
                    try: os.remove(full_path) 
                    except: pass
                raise e

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

