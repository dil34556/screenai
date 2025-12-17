from django.http import JsonResponse
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import json
<<<<<<< HEAD
from .models import Employee, Applicant


# ================= EMPLOYEE APIs (Your existing code) ====================

=======
from datetime import date
from .models import Employee, Application


# ---------------------------
# CREATE EMPLOYEE
# ---------------------------
>>>>>>> 7885fd4af6c61c3dd0271b0ca3549411252d6cfb
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

        try:
            employee = Employee.objects.create(email=email, password=password)
        except IntegrityError:
            return JsonResponse({"error": "Employee with this email already exists"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=500)

        return JsonResponse({
            "message": "Employee created successfully",
            "employee": {
                "id": employee.id,
                "email": employee.email,
                "password": employee.password
            }
        }, status=201)

    return JsonResponse({"error": "Only POST method allowed"}, status=405)


# ---------------------------
# VIEW EMPLOYEES
# ---------------------------
def view_employees_api(request):
    if request.method == "GET":
        # Filter out admins so they don't appear in the list
        employees = Employee.objects.filter(is_admin=False)
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


<<<<<<< HEAD
=======
# ---------------------------
# LOGIN EMPLOYEE
# ---------------------------
>>>>>>> 7885fd4af6c61c3dd0271b0ca3549411252d6cfb
@csrf_exempt
def login_employee_api(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return JsonResponse(
                    {"error": "Email and password are required"},
                    status=400
                )

            try:
<<<<<<< HEAD
                employee = Employee.objects.get(
                    email=email,
                    password=password  # ⚠️ plain-text only for now
                )

=======
                employee = Employee.objects.get(email=email, password=password)
                
>>>>>>> 7885fd4af6c61c3dd0271b0ca3549411252d6cfb
                return JsonResponse({
                    "message": "Login successful",
                    "user": {
                        "id": employee.id,
                        "email": employee.email,
                        "is_admin": employee.is_admin
                    }
                }, status=200)

            except Employee.DoesNotExist:
                return JsonResponse(
                    {"error": "Invalid email or password"},
                    status=401
                )

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

<<<<<<< HEAD
    return JsonResponse(
        {"error": "Only POST method allowed"},
        status=405
    )
=======
    return JsonResponse({"error": "Only POST method allowed"}, status=405)



# ---------------------------
# REAL-TIME ANALYTICS:
# CREATE APPLICATION (CANDIDATE APPLY)
# ---------------------------
@csrf_exempt
def create_application_api(request, job_id):
    """
    Called when a candidate applies for a job.
    This automatically creates an Application record for analytics.
    """
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
        except:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        email = data.get("email")
        first = data.get("first_name", "")
        last = data.get("last_name", "")
        source = data.get("source", "Website")

        if not email:
            return JsonResponse({"error": "Email required"}, status=400)

        # Find or create employee
        employee, _ = Employee.objects.get_or_create(
            email=email,
            defaults={"first_name": first, "last_name": last}
        )

        # Create Application entry
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

    return JsonResponse({"error": "Only POST method allowed"}, status=405)
>>>>>>> 7885fd4af6c61c3dd0271b0ca3549411252d6cfb
