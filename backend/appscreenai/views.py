from django.http import JsonResponse
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Employee, Applicant

# ================= EMPLOYEE APIs ====================
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
                        "email": employee.email,
                        "is_admin": getattr(employee, "is_admin", False)
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


@csrf_exempt
def delete_employee_api(request, pk):
    if request.method == "DELETE":
        try:
            employee = Employee.objects.get(pk=pk)
            employee.delete()
            return JsonResponse({"message": "Employee deleted successfully"}, status=200)
        except Employee.DoesNotExist:
            return JsonResponse({"error": "Employee not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Only DELETE method allowed"}, status=405)


@csrf_exempt
def update_employee_password_api(request, pk):
    if request.method == "PUT":
        try:
            data = json.loads(request.body.decode("utf-8"))
            new_password = data.get("password")
            if not new_password:
                return JsonResponse({"error": "Password required"}, status=400)

            employee = Employee.objects.get(pk=pk)
            employee.password = new_password
            employee.save()
            return JsonResponse({"message": "Password updated successfully"}, status=200)

        except Employee.DoesNotExist:
            return JsonResponse({"error": "Employee not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Only PUT method allowed"}, status=405)
