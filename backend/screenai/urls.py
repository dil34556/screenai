from django.contrib import admin
from django.urls import path, include
from appscreenai import views
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),

    # Old API Routes (Legacy)
    path('api/employees/create/', views.create_employee_api),
    path('api/employees/', views.view_employees_api),

    # New API Routes (v1)
    path('api/v1/', include('jobs.urls')),
    path('api/v1/', include('candidates.urls')),
    path('api/v1/auth/login/', views.login_employee_api),
    
    # Map Legacy routes to v1 as well so frontend works
    path('api/v1/employees/create/', views.create_employee_api),
    path('api/v1/employees/', views.view_employees_api),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )