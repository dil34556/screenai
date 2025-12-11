from django.urls import path
from . import views

urlpatterns = [
    # ---------------- UI ROUTES ----------------
    path('employee-manager/', views.employee_manager, name='employee_manager'),
    
    # ---------------- EMPLOYEE API ROUTES (Your existing code) ----------------
    path('api/employees/create/', views.create_employee_api, name='create_employee_api'),
    path('api/employees/', views.view_employees_api, name='view_employees_api'),

    # ---------------- NEW APPLICANT FORM API ROUTES ----------------
    path('api/applicants/submit/', views.submit_application_api, name='submit_application_api'),
    path('api/applicants/', views.view_applicants_api, name='view_applicants_api'),
]
