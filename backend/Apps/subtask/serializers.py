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

    def update(self, instance, validated_data):
        note = validated_data.get('note', serializers.empty)
        incoming_status = validated_data.get('status', serializers.empty)

        if note is not serializers.empty and isinstance(note, str):
            normalized_note = note.strip()
            validated_data['note'] = normalized_note if normalized_note else None

        # Si se guarda una nota sin enviar status explícito,
        # interpretamos la acción como una posposición.
        if (
            note is not serializers.empty
            and validated_data.get('note')
            and incoming_status is serializers.empty
        ):
            validated_data['status'] = Subtask.Status.POSTPONED

        return super().update(instance, validated_data)

    # Agregamos esta función para modificar cómo se ENVÍAN los datos (GET)
    def to_representation(self, instance):
        # Obtenemos el diccionario original (donde 'task' es solo el ID)
        representation = super().to_representation(instance)
        
        # Si la subtarea tiene una tarea asociada, usamos tu TaskMiniSerializer
        # para empaquetar toda la info y sobreescribimos el campo 'task'
        if instance.task:
            representation['task'] = TaskMiniSerializer(instance.task).data
            
        return representation