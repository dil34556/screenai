from django.contrib import admin
from django.urls import path
from appscreenai import views

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Routes
    path('api/employees/create/', views.create_employee_api),
    path('api/employees/', views.view_employees_api),
]
