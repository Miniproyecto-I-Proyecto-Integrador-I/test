from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Prefetch
from Apps.subtask.models import Subtask
from Apps.subtask.serializers import SubtaskSerializer
from .models import Task
from .serializers import TaskSerializer
from rest_framework.permissions import IsAuthenticated


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Solo devuelve las tareas del usuario autenticado
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Asigna automáticamente el usuario autenticado al crear una tarea
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='subtasks')
    def crear_subtarea(self, request, pk=None):
        
        #Crea una subtarea vinculada a una actividad específica (ID en la URL).
        #POST /api/task/{id}/subtareas/
        
        task = self.get_object() # Obtiene la Task usando el ID de la URL
        
        # Pasamos los datos del cuerpo de la petición al serializer de subtareas
        serializer = SubtaskSerializer(data=request.data)
        
        # 1. VALIDACIÓN DE TIPOS DE DATOS (Requerimiento de tu tarea)
        if serializer.is_valid():
            # 2. LÓGICA DE INTEGRIDAD: Forzamos que la subtarea pertenezca a ESTA tarea
            serializer.save(task=task) 
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # Si los tipos de datos son erróneos (ej: texto en lugar de horas), DRF devuelve el error 400
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)