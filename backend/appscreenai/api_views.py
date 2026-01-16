from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncWeek
from django.http import JsonResponse
from datetime import date, timedelta
import json
from datetime import date, timedelta
import json

from .models import Employee
from candidates.models import Application
from candidates.models import Application as CandidateApplication
from jobs.models import JobPosting
from .serializers import EmployeeSerializer


# ===========================
# 📌 EMPLOYEE LIST API
# ===========================
@api_view(["GET"])
def employees_list(request):
    qs = Employee.objects.all()
    return Response(EmployeeSerializer(qs, many=True).data)


# ===========================
# 📌 ANALYTICS OVERVIEW
# ===========================
@api_view(["GET"])
def analytics_overview(request):
    total_apps = CandidateApplication.objects.count()
    hired = CandidateApplication.objects.filter(status__in=["OFFER", "HIRED"]).count()
    rejected = CandidateApplication.objects.filter(status="REJECTED").count()
    
    # Job Stats
    total_jobs = JobPosting.objects.count()
    active_jobs = JobPosting.objects.filter(is_active=True).count()

    # 'calls' not yet available in new model, setting to 0 or legacy
    total_calls = 0 
    conversion = round((hired / total_apps * 100), 1) if total_apps else 0

    return Response({
        "total_applications": total_apps,
        "total_hired": hired,
        "rejected_count": rejected,
        "hired_this_month": hired, # Keep for backward compatibility
        "total_calls_today": total_calls,
        "conversion_rate": conversion,
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
    })


# ===========================
# 📌 WEEKLY TREND (LAST 4 WEEKS)
# ===========================
@api_view(["GET"])
def weekly_trend(request):
    today = date.today()
    start = today - timedelta(days=28)

    qs = (
        CandidateApplication.objects
        .filter(applied_at__gte=start)
        .annotate(week=TruncWeek("applied_at"))
        .values("week")
        .annotate(
            count=Count("id"),
            hired=Count("id", filter=Q(status="OFFER") | Q(status="HIRED"))
        )
        .order_by("week")
    )

    result = []
    for i in range(4):
        week_start = start + timedelta(days=7 * i)

        match = next((x for x in qs if x["week"].date() == week_start), None)

        result.append({
            "week": f"Week {i + 1}",
            "applications": match["count"] if match else 0,
            "hired": match["hired"] if match else 0
        })

    return Response(result)


# ===========================
# 📌 PIPELINE STATUS DISTRIBUTION
# ===========================
@api_view(["GET"])
def pipeline_distribution(request):
    qs = CandidateApplication.objects.values("status").annotate(count=Count("id"))
    return Response({item["status"]: item["count"] for item in qs})


# ===========================
# 📌 DAILY APPLICATION COUNT (LAST 7 DAYS)
# ===========================
@api_view(["GET"])
def daily_applications(request):
    today = date.today()
    output = []

    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        count = CandidateApplication.objects.filter(applied_at__date=d).count()
        output.append({
            "day": d.strftime("%a"),
            "count": count
        })

    return Response(output)


# ===========================
# 📌 PLATFORM PERFORMANCE (LinkedIn / Indeed / Website etc.)
# ===========================
@api_view(["GET"])
def platform_performance(request):
    qs = (
        CandidateApplication.objects
        .values("platform")
        .annotate(
            count=Count("id"),
            hired=Count("id", filter=Q(status="OFFER") | Q(status="HIRED"))
        )
    )

    result = []
    for x in qs:
        count = x["count"] or 0
        hired = x["hired"] or 0
        conversion = round((hired / count) * 100, 1) if count > 0 else 0

        result.append({
            "platform": x["platform"] or "Unknown",
            "count": count,
            "conversion": conversion,
        })

    return Response(result)


# ===========================
# 📌 HR TEAM PERFORMANCE
# ===========================
@api_view(["GET"])
def hr_team_performance(request):
    # Using CandidateApplication linked to JobPosting -> Recruiter (Employee)
    queryset = (
        CandidateApplication.objects
        .values(
            "job__recruiter__id",
            "job__recruiter__first_name",
            "job__recruiter__last_name",
            "job__recruiter__email"
        )
        .annotate(
            shortlisted=Count("id", filter=Q(status__in=["INTERVIEW", "SCREENED"])),
            rejected=Count("id", filter=Q(status="REJECTED")),
            hired=Count("id", filter=Q(status__in=["OFFER", "HIRED"])),
        )
    )

    result = []
    for row in queryset:
        # Avoid division by zero
        total_decisions = row["shortlisted"] + row["rejected"] + row["hired"]
        total = total_decisions if total_decisions > 0 else 1
        
        conversion = round((row["hired"] / total) * 100, 1)

        first_name = row['job__recruiter__first_name'] or ''
        last_name = row['job__recruiter__last_name'] or ''
        name = f"{first_name} {last_name}".strip()
        
        if not name:
            name = row['job__recruiter__email'] or "Unknown Recruiter"

        result.append({
            "hr_id": row["job__recruiter__id"],
            "name": name,
            "email": row["job__recruiter__email"],
            "calls_today": 0, # Metric not currently tracked
            "shortlisted": row["shortlisted"],
            "rejected": row["rejected"],
            "hired": row["hired"],
            "conversion": conversion,
        })

    return Response(result)


# ===========================
# 📌 APPLICATION SUBMISSION API (CONNECTS CANDIDATE → ANALYTICS)
# ===========================
@api_view(['POST'])
@permission_classes([AllowAny])
def create_application_api(request, job_id):
    try:
        data = request.data
    except:
        return Response({"error": "Invalid JSON"}, status=status.HTTP_400_BAD_REQUEST)

    email = data.get("email")
    first = data.get("first_name", "")
    last = data.get("last_name", "")
    source = data.get("source", "Website")

    if not email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Create or fetch employee
    employee, _ = Employee.objects.get_or_create(
        email=email,
        defaults={"first_name": first, "last_name": last}
    )

    # Create application entry
    application = Application.objects.create(
        employee=employee,
        job_id=job_id,
        date_applied=date.today(),
        status="new",
        source=source,
        calls=0
    )

    return Response({
        "message": "Application submitted successfully",
        "application_id": application.id
    }, status=status.HTTP_201_CREATED)
