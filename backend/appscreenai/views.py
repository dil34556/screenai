from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError
import json
from .models import Employee, Applicant
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Employee, Applicant
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

# ================= EMPLOYEE APIs ====================
@api_view(['POST'])
@permission_classes([AllowAny])
def create_employee_api(request):
    try:
        data = request.data # DRF handles JSON parsing
    except:
        return Response({"error": "Invalid JSON"}, status=status.HTTP_400_BAD_REQUEST)

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return Response({"error": "email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        employee = Employee.objects.create(email=email, password=password)
    except IntegrityError:
        return Response({"error": "Employee with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        "message": "Employee created successfully",
        "employee": {
            "id": employee.id,
            "email": employee.email,
            "password": employee.password
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_employees_api(request):
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
    return Response({"employees": data}, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_employee_api(request):
    try:
        data = request.data
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            employee = Employee.objects.get(
                email=email,
                password=password  # ⚠️ plain-text only for now
            )

            # Get or Create Django User for Token Auth
            user, _ = User.objects.get_or_create(username=email, defaults={'email': email})
            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                "message": "Login successful",
                "token": token.key,
                "user": {
                    "id": employee.id,
                    "email": employee.email,
                    "is_admin": getattr(employee, "is_admin", False)
                }
            }, status=status.HTTP_200_OK)

        except Employee.DoesNotExist:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_employee_api(request, pk):
    try:
        employee = Employee.objects.get(pk=pk)
        employee.delete()
        return Response({"message": "Employee deleted successfully"}, status=status.HTTP_200_OK)
    except Employee.DoesNotExist:
        return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated])
def update_employee_password_api(request, pk):
    try:
        data = request.data
        # Frontend sends "new_password", so checking both for compatibility
        new_password = data.get("new_password") or data.get("password")
        
        if not new_password:
            return Response({"error": "Password required"}, status=status.HTTP_400_BAD_REQUEST)

        employee = Employee.objects.get(pk=pk)
        employee.password = new_password
        employee.save()
        return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

    except Employee.DoesNotExist:
        return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
