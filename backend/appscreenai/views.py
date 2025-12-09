from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Employee


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
