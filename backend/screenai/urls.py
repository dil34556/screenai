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
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    from django.urls import re_path
    from screenai.debug_views import serve_media_inline
    # Manually map the media URL using our custom view that forces inline content-disposition
    # This prevents the browser from downloading PDFs and allows them to be viewed in a new tab.
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve_media_inline, {
            'document_root': settings.MEDIA_ROOT,
        }),
    ]
