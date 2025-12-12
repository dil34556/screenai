from rest_framework import generics
from .models import JobPosting
from .serializers import JobPostingSerializer

class JobListView(generics.ListCreateAPIView):
    serializer_class = JobPostingSerializer

    def get_queryset(self):
        queryset = JobPosting.objects.all().order_by('-created_at')
        # If 'active_only' param is present and 'true', filter by active. 
        # Default behavior: if no param, maybe we show all? 
        # The original code filtered is_active=True.
        # Let's check for a param 'include_closed' to show all. 
        # Otherwise default to active only to preserve public API behavior?
        # Actually, if this is for the 'Manage Jobs' page, we might want all by default if authenticated?
        # For simplicity and backward compatibility:
        include_closed = self.request.query_params.get('include_closed', 'false')
        if include_closed.lower() == 'true':
            return queryset
        return queryset.filter(is_active=True)

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer
