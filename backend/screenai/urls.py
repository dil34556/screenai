from django.contrib import admin
from django.urls import path, include
from appscreenai import views

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Routes (Moved to v1)
    path('api/v1/employees/create/', views.create_employee_api),
    path('api/v1/employees/', views.view_employees_api),
    path('api/v1/auth/login/', views.login_employee_api),

    # ScreenAI V2 Routes
    path('api/v1/', include('jobs.urls')),
    path('api/v1/', include('candidates.urls')),
    path("api/", include("appscreenai.urls")),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
