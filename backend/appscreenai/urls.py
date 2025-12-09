from django.urls import path
from . import views

urlpatterns = [
    # UI Route
    path('employee-manager/', views.employee_manager, name='employee_manager'),
    
    # API Routes
    path('api/employees/create/', views.create_employee_api, name='create_employee_api'),
    path('api/employees/', views.view_employees_api, name='view_employees_api'),
]