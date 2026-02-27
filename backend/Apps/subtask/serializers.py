from rest_framework import serializers
from .models import Subtask
from Apps.task.models import Task


class TaskMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        # ajustar campos según lo que desees mostrar
        fields = ['id', 'title', 'status', 'due_date','description','priority','subject','type','total_hours']


class SubtaskSerializer(serializers.ModelSerializer):
    # incluir datos de la tarea padre
    task = TaskMiniSerializer(read_only=True)

    class Meta:
        model = Subtask
        fields = '__all__' 


