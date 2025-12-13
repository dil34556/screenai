from rest_framework import generics
from .models import JobPosting
from .serializers import JobPostingSerializer

class JobListView(generics.ListCreateAPIView):
    serializer_class = JobPostingSerializer

    def get_queryset(self):
        queryset = JobPosting.objects.all().order_by('-created_at')
        
        # 1. Multi-tenant Filter
        employee_id = self.request.headers.get('X-Employee-Id')
        if employee_id:
            queryset = queryset.filter(recruiter_id=employee_id)
        
        # 2. Check for closed filter
        include_closed = self.request.query_params.get('include_closed', 'false')
        if include_closed.lower() == 'true':
            return queryset
            
        return queryset.filter(is_active=True)

    def perform_create(self, serializer):
        employee_id = self.request.headers.get('X-Employee-Id')
        if employee_id:
            from appscreenai.models import Employee
            try:
                emp = Employee.objects.get(id=employee_id)
                serializer.save(recruiter=emp)
            except Employee.DoesNotExist:
                serializer.save()
        else:
            serializer.save()

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer
