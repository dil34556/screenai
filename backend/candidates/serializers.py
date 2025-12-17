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
<<<<<<< HEAD

    def get_work_experience(self, obj):
        if not obj.resume_text:
            return []
        try:
            data = json.loads(obj.resume_text)
            # views.py saves: json.dumps(parsed_data) where parsed_data = {"data": {...}, "text": ...}
            # So we look for data['data']['work_experience']
            
            # Check structure (it might vary if saved differently in versions)
            resume_data = data.get('data', {})
            if not resume_data and 'work_experience' in data:
                 # Fallback if saved directly
                 resume_data = data
            
            return resume_data.get('work_experience', [])
        except:
            return []

=======
    
>>>>>>> 7885fd4af6c61c3dd0271b0ca3549411252d6cfb
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
