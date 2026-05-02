from rest_framework import serializers
from .models import Task
from Apps.subtask.serializers import SubtaskSerializer

class TaskSerializer(serializers.ModelSerializer):
    
    subtasks = SubtaskSerializer(many=True, read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    progress_percentage = serializers.FloatField(source='progress', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 
            'priority', 'due_date', 'user', 'subtasks', 
            'created_at', 'updated_at', 'subject', 'type', 'progress_percentage', 'total_hours'
        ]
