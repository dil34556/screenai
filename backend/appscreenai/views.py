from django.http import JsonResponse
from django.db import IntegrityError
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

        try:
            employee = Employee.objects.create(email=email, password=password)
        except IntegrityError:
            return JsonResponse({"error": "Employee with this email already exists"}, status=400)
        except Exception as e:
            # Catch other potential errors (like database connection issues)
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
                employee = Employee.objects.get(
                    email=email,
                    password=password  # ⚠️ plain-text only for now
                )

                return JsonResponse({
                    "message": "Login successful",
                    "user": {
                        "id": employee.id,
                        "email": employee.email
                    }
                }, status=200)

            except Employee.DoesNotExist:
                return JsonResponse(
                    {"error": "Invalid email or password"},
                    status=401
                )

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse(
        {"error": "Only POST method allowed"},
        status=405
    )
