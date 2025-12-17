from django.contrib import admin
from django.urls import path, include, re_path
from appscreenai import views
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
    path('api/v1/employees/create/', views.create_employee_api),
    path('api/v1/employees/', views.view_employees_api),
    path('api/v1/auth/login/', views.login_employee_api),
    
    # Employee Actions
    path('api/v1/employees/<int:pk>/', views.delete_employee_api),
    path('api/v1/employees/<int:pk>/password/', views.update_employee_password_api),

    # Job & Candidate Routes
    path('api/v1/', include('jobs.urls')),
    path('api/v1/', include('candidates.urls')),

    # Legacy / Fallback Routes (If appscreenai.urls is used)
    path("api/", include("appscreenai.urls")),
]

if settings.DEBUG:
    if serve_media_inline:
        # Manually map the media URL using custom view that forces inline content-disposition
        urlpatterns += [
            re_path(r'^media/(?P<path>.*)$', serve_media_inline, {
                'document_root': settings.MEDIA_ROOT,
            }),
        ]
    else:
        # Standard static serving if debug view missing
        urlpatterns += static(
            settings.MEDIA_URL,
            document_root=settings.MEDIA_ROOT
        )
