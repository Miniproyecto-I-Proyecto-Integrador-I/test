from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Subtask
from .serializers import SubtaskSerializer

class SubtaskViewSet(viewsets.ModelViewSet):
    serializer_class = SubtaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Solo devuelve las subtareas del usuario autenticado
        queryset = Subtask.objects.filter(task__user=self.request.user)
        
        fecha_param = self.request.query_params.get('fecha', None)
        status_param = self.request.query_params.get('status', None)
        
        if fecha_param:
            queryset = queryset.filter(planification_date=fecha_param)

        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset