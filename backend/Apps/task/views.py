from rest_framework import viewsets
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class=TaskSerializer
    
    def get_queryset(self):
        queryset=Task.objects.prefetch_related('subtasks').all()
        return queryset