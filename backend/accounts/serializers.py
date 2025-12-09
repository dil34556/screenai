from rest_framework import serializers
from .models import Employee

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ["id", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}
