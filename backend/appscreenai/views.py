from django.http import JsonResponse
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Employee
from screenai.services.parser.parser import parse_resume
from django.core.files.storage import default_storage


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
                return JsonResponse({"error": "Email and password are required"}, status=400)

            try:
                # SIMPLE AUTH: Check if employee exists with these credentials
                # In a real app, use Django Auth & Hashers
                employee = Employee.objects.get(email=email, password=password)
                
                return JsonResponse({
                    "message": "Login successful",
                    "user": {
                        "id": employee.id,
                        "email": employee.email
                    }
                }, status=200)
                
            except Employee.DoesNotExist:
                return JsonResponse({"error": "Invalid email or password"}, status=401)
                
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Only POST method allowed"}, status=405)

@csrf_exempt
def parse_resume_api(request, application_id):
    """
    Returns the parsed JSON output for a given application.
    """
    from candidates.models import Application  # import inside to avoid circular import

    try:
        # Get the application entry using the ID
        app = Application.objects.get(id=application_id)

        # Get file path stored in DB
        pdf_path = app.resume.path  

        # Run your parser function
        parsed_output = parse_resume(pdf_path)

        return JsonResponse({
            "application_id": application_id,
            "parsed": parsed_output
        }, status=200)

    except Application.DoesNotExist:
        return JsonResponse({"error": "Application not found"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


