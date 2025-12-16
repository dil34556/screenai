from django.contrib import admin
from django.urls import path, include
from appscreenai import views
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/login/', views.login_employee_api),

    # Employee APIs
    path('api/employees/create/', views.create_employee_api),
    path('api/employees/', views.view_employees_api),

    # V1 APIs
    path('api/v1/', include('jobs.urls')),
    path('api/v1/', include('candidates.urls')),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )