from rest_framework import serializers
from .models import Task
from Apps.subtask.serializers import SubtaskSerializer # Importa el de subtask

class TaskSerializer(serializers.ModelSerializer):
    
    subtasks = SubtaskSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 
            'priority', 'due_date', 'user', 'subtasks', 
            'created_at', 'updated_at', 'subject', 'type','progress','total_hours'
        ]