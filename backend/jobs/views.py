from rest_framework import generics
from .models import JobPosting
from .serializers import JobPostingSerializer

class JobListView(generics.ListCreateAPIView):
    queryset = JobPosting.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = JobPostingSerializer

class JobDetailView(generics.RetrieveAPIView):
    queryset = JobPosting.objects.filter(is_active=True)
    serializer_class = JobPostingSerializer
