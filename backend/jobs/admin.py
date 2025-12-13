from django.contrib import admin
from .models import JobPosting

@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'job_type', 'is_active', 'created_at')
    list_filter = ('job_type', 'is_active', 'location')
    search_fields = ('title', 'description')
