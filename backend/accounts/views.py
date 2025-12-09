from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Employee
from .serializers import EmployeeSerializer


# ------------------- LOGIN API -------------------
class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            })

        return Response({"error": "Invalid credentials"}, status=401)


# ------------------- CREATE EMPLOYEE -------------------
class CreateEmployeeView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Employee created successfully"})
        return Response(serializer.errors, status=400)


# ------------------- LIST EMPLOYEES -------------------
class ListEmployeesView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        employees = Employee.objects.all()
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)


# ------------------- DELETE EMPLOYEE -------------------
class DeleteEmployeeView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, employee_id):
        try:
            employee = Employee.objects.get(id=employee_id)
            employee.delete()
            return Response({"message": "Employee deleted"})
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=404)
