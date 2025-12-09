from django.urls import path
from .views import AdminLoginView, CreateEmployeeView, ListEmployeesView, DeleteEmployeeView

urlpatterns = [
    path("login/", AdminLoginView.as_view()),  # <-- USE ONLY THIS LOGIN
    path("employee/create/", CreateEmployeeView.as_view()),
    path("employee/list/", ListEmployeesView.as_view()),
    path("employee/delete/<int:employee_id>/", DeleteEmployeeView.as_view()),
]
