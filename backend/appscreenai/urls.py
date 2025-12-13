from django.urls import path
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
]
