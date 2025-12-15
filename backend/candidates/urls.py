from django.urls import path
from .views import ApplicationCreateView, ApplicationListView, DashboardStatsView, ApplicationDetailView, AddCommentView, AnalyticsView

urlpatterns = [
    path('apply/', ApplicationCreateView.as_view(), name='application-create'),
    path('applications/', ApplicationListView.as_view(), name='application-list'),
    path('applications/<int:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
    path('applications/<int:pk>/comments/', AddCommentView.as_view(), name='add-comment'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
]

