from rest_framework import serializers
from .models import Candidate, Application, ApplicationComment, Experience
import json

class ApplicationCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationComment
        fields = '__all__'
        read_only_fields = ['application']

class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = '__all__'

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['company', 'role', 'duration']

class ApplicationSerializer(serializers.ModelSerializer):
    candidate_details = CandidateSerializer(source='candidate', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    comments = ApplicationCommentSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, required=False)

    work_experience = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = []

    def get_work_experience(self, obj):
        # 1. Get Manual Experience (from DB)
        manual_experience = []
        for exp in obj.experiences.all():
            manual_experience.append({
                "company_name": exp.company,
                "job_role": exp.role,
                "duration": exp.duration
            })
        
        # 2. Get Parsed Experience (from Resume Text)
        parsed_experience = []
        if obj.resume_text:
            try:
                data = json.loads(obj.resume_text)
                # Helper to handle both nested 'data' key or direct dict
                resume_data = data.get('data', data) if isinstance(data, dict) else {}
                
                raw_parsed = resume_data.get('work_experience', [])
                if not isinstance(raw_parsed, list):
                    raw_parsed = []

                # Normalize parsed data to match structure
                for item in raw_parsed:
                    if not isinstance(item, dict):
                        continue
                        
                    # Parse returns company_name, job_role. Ensure keys match.
                    # We use safe .get() and ensure we don't crash on missing keys
                    # We also fallback to empty strings instead of None to help frontend
                    company = item.get('company_name') or item.get('company') or "Unknown Company"
                    role = item.get('job_role') or item.get('role') or "Unknown Role"
                    duration = item.get('duration') or item.get('dates') or ""
                    
                    parsed_experience.append({
                        "company_name": str(company),
                        "job_role": str(role),
                        "duration": str(duration)
                    })
            except Exception as e:
                print(f"Error parsing work experience for App ID {obj.id}: {e}")
                # Don't crash, just return what we have (or empty parsed)
                pass

        # Return combined (Manual first)
        return manual_experience + parsed_experience

    def to_internal_value(self, data):
        # Handle multipart/form-data where JSON fields might come as strings
        # Convert QueryDict to standard dict to allow storing complex types (lists/dicts)
        if hasattr(data, 'dict'):
             mutable_data = data.dict()
        else:
             mutable_data = data.copy()
        
        if 'answers' in data and isinstance(data['answers'], str):
             try:
                 mutable_data['answers'] = json.loads(data['answers'])
             except ValueError:
                 pass

        if 'experiences' in data and isinstance(data['experiences'], str):
             try:
                 mutable_data['experiences'] = json.loads(data['experiences'])
             except ValueError:
                 pass
                 
        return super().to_internal_value(mutable_data)

    def create(self, validated_data):
        experiences_data = validated_data.pop('experiences', [])
        application = Application.objects.create(**validated_data)
        for exp_data in experiences_data:
            Experience.objects.create(application=application, **exp_data)
        return application
