from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncWeek
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from datetime import date, timedelta
import json

from .models import Employee, Application
from candidates.models import Application as CandidateApplication
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
    hired = CandidateApplication.objects.filter(status="OFFER").count()
    # 'calls' not yet available in new model, setting to 0 or legacy
    total_calls = 0 
    conversion = round((hired / total_apps * 100), 1) if total_apps else 0

    return Response({
        "total_applications": total_apps,
        "hired_this_month": hired,
        "total_calls_today": total_calls,
        "conversion_rate": conversion,
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
        .annotate(count=Count("id"))
        .order_by("week")
    )

    result = []
    for i in range(4):
        week_start = start + timedelta(days=7 * i)

        match = next((x for x in qs if x["week"].date() == week_start), None)

        result.append({
            "week": f"Week {i + 1}",
            "count": match["count"] if match else 0
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
        # Using __date to compare datetime field with date object
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
    qs = CandidateApplication.objects.values("platform").annotate(count=Count("id"))
    total = CandidateApplication.objects.count() or 1

    result = [
        {
            "platform": x["platform"] or "Unknown",
            "count": x["count"],
            "conversion": round((x["count"] / total) * 100, 1),
        }
        for x in qs
    ]

    return Response(result)


# ===========================
# 📌 HR TEAM PERFORMANCE
# ===========================
@api_view(["GET"])
def hr_team_performance(request):
    queryset = (
        Application.objects.values(
            "employee__id",
            "employee__first_name",
            "employee__last_name",
        )
        .annotate(
            calls=Sum("calls"),
            shortlisted=Count("id", filter=Q(status="shortlisted")),
            rejected=Count("id", filter=Q(status="rejected")),
            hired=Count("id", filter=Q(status="hired")),
        )
    )

    result = []
    for row in queryset:
        total = (row["shortlisted"] + row["rejected"] + row["hired"]) or 1
        conversion = round((row["hired"] / total) * 100, 1)

        name = f"{row['employee__first_name'] or ''} {row['employee__last_name'] or ''}".strip()
        if not name:
            name = "—"

        result.append({
            "hr_id": row["employee__id"],
            "name": name,
            "calls_today": row["calls"] or 0,
            "shortlisted": row["shortlisted"],
            "rejected": row["rejected"],
            "hired": row["hired"],
            "conversion": conversion,
        })

    return Response(result)


# ===========================
# 📌 APPLICATION SUBMISSION API (CONNECTS CANDIDATE → ANALYTICS)
# ===========================
@csrf_exempt
def create_application_api(request, job_id):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST method allowed"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    email = data.get("email")
    first = data.get("first_name", "")
    last = data.get("last_name", "")
    source = data.get("source", "Website")

    if not email:
        return JsonResponse({"error": "Email is required"}, status=400)

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

    return JsonResponse({
        "message": "Application submitted successfully",
        "application_id": application.id
    }, status=201)
