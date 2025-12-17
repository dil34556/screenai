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
<<<<<<< HEAD
    path('api/v1/auth/login/', views.login_employee_api),
    
    # Map Legacy routes to v1 as well so frontend works
    path('api/v1/employees/create/', views.create_employee_api),
    path('api/v1/employees/', views.view_employees_api),
=======
    path("api/", include("appscreenai.urls")),
>>>>>>> 7885fd4af6c61c3dd0271b0ca3549411252d6cfb
]

if settings.DEBUG:
<<<<<<< HEAD
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
=======
    from django.urls import re_path
    from screenai.debug_views import serve_media_inline
    # Manually map the media URL using our custom view that forces inline content-disposition
    # This prevents the browser from downloading PDFs and allows them to be viewed in a new tab.
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve_media_inline, {
            'document_root': settings.MEDIA_ROOT,
        }),
    ]
>>>>>>> 7885fd4af6c61c3dd0271b0ca3549411252d6cfb
