from django.contrib import admin
from django.urls import path, include, re_path
from appscreenai.views import (
    create_employee_api, 
    view_employees_api, 
    login_employee_api,
    delete_employee_api,
    update_employee_password_api
)
from django.conf import settings
from django.conf.urls.static import static

# Try importing debug_views, if not found (local env diff), we skip it or mock it
try:
    from screenai.debug_views import serve_media_inline
except ImportError:
    serve_media_inline = None


urlpatterns = [
    path('admin/', admin.site.urls),

    # API Routes (v1) - MATCHING FRONTEND api.js
    path('api/v1/employees/create/', create_employee_api),
    path('api/v1/employees/', view_employees_api),
    path('api/v1/auth/login/', login_employee_api),
    
    # Employee Actions
    path('api/v1/employees/<int:pk>/', delete_employee_api),
    path('api/v1/employees/<int:pk>/password/', update_employee_password_api),

    # Job & Candidate Routes
    path('api/v1/', include('jobs.urls')),
    path('api/v1/', include('candidates.urls')),
    path('api/v1/auth/login/', login_employee_api),
    
    # Map Legacy routes to v1 as well so frontend works
    path('api/v1/employees/create/', create_employee_api),
    path('api/v1/employees/', view_employees_api),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
