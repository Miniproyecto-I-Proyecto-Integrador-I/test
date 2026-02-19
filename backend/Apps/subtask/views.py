from rest_framework import viewsets
from .models import Subtask
from .serializers import SubtaskSerializer

class SubtaskViewSet(viewsets.ModelViewSet):
    serializer_class = SubtaskSerializer
    # Quitamos queryset = Subtask.objects.all() de aquí arriba 
    # para que solo use el que definimos abajo

    def get_queryset(self):
        queryset = Subtask.objects.all()
        fecha_param = self.request.query_params.get('fecha', None)
        status_param = self.request.query_params.get('status', None)
        usuario_param = self.request.query_params.get('usuario', None) 
        
        if fecha_param:
            queryset = queryset.filter(planification_date=fecha_param)

        if status_param:
            queryset = queryset.filter(status=status_param)

        if usuario_param:
            
            queryset = queryset.filter(task__user_id=usuario_param)

        return queryset