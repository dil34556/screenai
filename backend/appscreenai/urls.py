from django.urls import path
<<<<<<< HEAD
from . import views
from django.urls import path
from .views import parse_resume_api

urlpatterns = [
    # ... your existing routes
    path("parse/<int:application_id>/", parse_resume_api),
]


urlpatterns = [
    # ---------------- UI ROUTES ----------------
    path('employee-manager/', views.employee_manager, name='employee_manager'),
    
    # ---------------- EMPLOYEE API ROUTES (Your existing code) ----------------
    path('api/employees/create/', views.create_employee_api, name='create_employee_api'),
    path('api/employees/', views.view_employees_api, name='view_employees_api'),

    # ---------------- NEW APPLICANT FORM API ROUTES ----------------
    path('api/applicants/submit/', views.submit_application_api, name='submit_application_api'),
    path('api/applicants/', views.view_applicants_api, name='view_applicants_api'),
=======
from . import api_views

urlpatterns = [

    # ==========================
    # EMPLOYEES
    # ==========================
    path("employees/", api_views.employees_list),

    # ==========================
    # ANALYTICS API ENDPOINTS
    # ==========================
    path("analytics/overview/", api_views.analytics_overview),
    path("analytics/weekly/", api_views.weekly_trend),
    path("analytics/pipeline/", api_views.pipeline_distribution),
    path("analytics/daily/", api_views.daily_applications),
    path("analytics/platforms/", api_views.platform_performance),
    path("analytics/hr_team/", api_views.hr_team_performance),

    # ==========================
    # APPLICATION SUBMISSION (Candidate Apply)
    # must include job_id
    # ==========================
    path("apply/<int:job_id>/", api_views.create_application_api),
    # path('', include(router.urls)),
>>>>>>> 7885fd4af6c61c3dd0271b0ca3549411252d6cfb
]
