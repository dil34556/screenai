from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from appscreenai.models import Employee
from .models import JobPosting

class JobIsolationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create Employees
        self.emp1 = Employee.objects.create(email="emp1@test.com", password="pass")
        self.emp2 = Employee.objects.create(email="emp2@test.com", password="pass")
        
        # Create Jobs
        self.job1 = JobPosting.objects.create(
            title="Job 1 (Emp 1)", 
            location="Remote", 
            recruiter=self.emp1,
            is_active=True
        )
        self.job2 = JobPosting.objects.create(
            title="Job 2 (Emp 2)", 
            location="Remote", 
            recruiter=self.emp2,
            is_active=True
        )
        
        self.url = reverse('job-list')

    def test_list_jobs_with_employee_id_header(self):
        """
        When X-Employee-Id is present, should only return that employee's jobs.
        """
        # Simulate Employee 1 Request
        self.client.credentials(HTTP_X_EMPLOYEE_ID=str(self.emp1.id))
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results'] if 'results' in response.data else response.data
        
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], self.job1.title)
        
        # Simulate Employee 2 Request
        self.client.credentials(HTTP_X_EMPLOYEE_ID=str(self.emp2.id))
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results'] if 'results' in response.data else response.data
        
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], self.job2.title)

    def test_list_jobs_without_employee_id_header(self):
        """
        When NO header is present (Admin flow), should return ALL jobs.
        """
        self.client.credentials() # Clear headers
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results'] if 'results' in response.data else response.data
        
        # Should see both jobs
        self.assertEqual(len(results), 2)
