from django.urls import path
from .views import ApplicationCreateView, ApplicationListView, DashboardStatsView

urlpatterns = [
    path('apply/', ApplicationCreateView.as_view(), name='application-create'),
    path('applications/', ApplicationListView.as_view(), name='application-list'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
