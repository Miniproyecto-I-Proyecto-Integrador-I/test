from rest_framework import serializers
from .models import Subtask
from Apps.task.models import Task

class TaskMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'status',
            'due_date',
            'description',
            'priority',
            'subject',
            'type',
            'total_hours'
        ]

class SubtaskSerializer(serializers.ModelSerializer):
    # El campo task no es requerido en la entrada porque se asigna en el backend
    # desde la URL del endpoint /api/task/{id}/subtasks/
    task = serializers.PrimaryKeyRelatedField(
        queryset=Task.objects.all(),
        required=False
    )

    class Meta:
        model = Subtask
        fields = '__all__'

    # Agregamos esta función para modificar cómo se ENVÍAN los datos (GET)
    def to_representation(self, instance):
        # Obtenemos el diccionario original (donde 'task' es solo el ID)
        representation = super().to_representation(instance)
        
        # Si la subtarea tiene una tarea asociada, usamos tu TaskMiniSerializer
        # para empaquetar toda la info y sobreescribimos el campo 'task'
        if instance.task:
            representation['task'] = TaskMiniSerializer(instance.task).data
            
        return representation