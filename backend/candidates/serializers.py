from rest_framework import serializers
from .models import Candidate, Application, ApplicationComment
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

class ApplicationSerializer(serializers.ModelSerializer):
    candidate_details = CandidateSerializer(source='candidate', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    comments = ApplicationCommentSerializer(many=True, read_only=True)

    work_experience = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = []

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

    def to_internal_value(self, data):
        # Handle multipart/form-data where JSON fields might come as strings
        if 'answers' in data and isinstance(data['answers'], str):
            mutable_data = data.copy()
            try:
                mutable_data['answers'] = json.loads(data['answers'])
                data = mutable_data
            except ValueError:
                pass
        return super().to_internal_value(data)
