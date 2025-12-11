from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import json
from .models import Employee, Applicant


# ================= EMPLOYEE APIs (Your existing code) ====================

@csrf_exempt
def create_employee_api(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
        except:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"error": "email and password are required"}, status=400)

        employee = Employee.objects.create(email=email, password=password)

        return JsonResponse({
            "message": "Employee created successfully",
            "employee": {
                "id": employee.id,
                "email": employee.email,
                "password": employee.password
            }
        }, status=201)

    return JsonResponse({"error": "Only POST method allowed"}, status=405)


def view_employees_api(request):
    if request.method == "GET":
        employees = Employee.objects.all()
        data = [
            {
                "id": emp.id,
                "email": emp.email,
                "password": emp.password
            }
            for emp in employees
        ]
        return JsonResponse({"employees": data}, status=200)

    return JsonResponse({"error": "Only GET method allowed"}, status=405)


# ================= APPLICANT FORM API (New Code) ====================

@csrf_exempt
def submit_application_api(request):
    if request.method == "POST":
        # multipart/form-data → no json.loads()
        full_name = request.POST.get("full_name")
        email = request.POST.get("email")
        phone = request.POST.get("phone")
        years_of_experience = request.POST.get("years_of_experience")
        motivation = request.POST.get("motivation")
        preferred_schedule = request.POST.get("preferred_schedule")

        resume_file = request.FILES.get("resume")

        if not resume_file:
            return JsonResponse({"error": "Resume is required"}, status=400)

        # Save file
        file_path = default_storage.save(
            "resumes/" + resume_file.name,
            ContentFile(resume_file.read())
        )

        applicant = Applicant.objects.create(
            full_name=full_name,
            email=email,
            phone=phone,
            resume=file_path,
            years_of_experience=years_of_experience,
            motivation=motivation,
            preferred_schedule=preferred_schedule,
        )

        return JsonResponse({
            "message": "Application submitted successfully",
            "applicant_id": applicant.id
        }, status=201)

    return JsonResponse({"error": "Only POST method allowed"}, status=405)


def view_applicants_api(request):
    if request.method == "GET":
        applicants = Applicant.objects.all().order_by("-created_at")
        data = []
        for a in applicants:
            data.append({
                "id": a.id,
                "full_name": a.full_name,
                "email": a.email,
                "phone": a.phone,
                "resume_url": a.resume.url,
                "years_of_experience": a.years_of_experience,
                "motivation": a.motivation,
                "preferred_schedule": a.preferred_schedule,
                "created_at": a.created_at,
            })
        return JsonResponse({"applicants": data}, status=200)

    return JsonResponse({"error": "Only GET allowed"}, status=405)
