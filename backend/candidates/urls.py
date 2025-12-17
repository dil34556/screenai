from django.urls import path
from .views import ApplicationListCreateView, ApplicationDetailView, AddCommentView, DashboardStatsView, ParseApplicationResumeView, PreviewResumeView, AnalyticsView

urlpatterns = [
    path('applications/', ApplicationListCreateView.as_view(), name='application-list'),
    path('applications/<int:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
    path('applications/<int:pk>/parse/', ParseApplicationResumeView.as_view(), name='application-parse'),
    path('applications/<int:pk>/comments/', AddCommentView.as_view(), name='add-comment'),
    path('applications/preview/', PreviewResumeView.as_view(), name='resume-preview'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
]

