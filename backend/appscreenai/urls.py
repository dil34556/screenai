from django.urls import path
from . import views
from django.urls import path
from .views import parse_resume_api

urlpatterns = [
    # ... your existing routes
    path("parse/<int:application_id>/", parse_resume_api),
]


urlpatterns = [
    # UI Route
    path('employee-manager/', views.employee_manager, name='employee_manager'),
    
    # API Routes
    path('api/employees/create/', views.create_employee_api, name='create_employee_api'),
    path('api/employees/', views.view_employees_api, name='view_employees_api'),
]