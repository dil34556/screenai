from django.contrib import admin
from django.urls import path, include
from appscreenai import views

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Routes
    path('api/employees/create/', views.create_employee_api), # Legacy
    path('api/employees/', views.view_employees_api),         # Legacy
    path('api/auth/login/', views.login_employee_api),        # Auth

    # ScreenAI V2 Routes
    path('api/v1/', include('jobs.urls')),
    path('api/v1/', include('candidates.urls')),
    path("api/", include("appscreenai.urls")),
]
