from rest_framework import serializers
from .models import Candidate, Application
import json

class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    candidate_details = CandidateSerializer(source='candidate', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ['ai_match_score', 'ai_summary', 'ai_missing_skills', 'ai_red_flags']

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
