from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters import rest_framework as filters
from .models import Subtask
from .serializers import SubtaskSerializer


class SubtaskFilter(filters.FilterSet):
    """Filtros personalizados para Subtask"""
    # Filtros propios de Subtask
    planification_date = filters.DateFilter(field_name='planification_date', lookup_expr='exact')
    planification_date_gte = filters.DateFilter(field_name='planification_date', lookup_expr='gte', label='Plan. date desde')
    planification_date_lte = filters.DateFilter(field_name='planification_date', lookup_expr='lte', label='Plan. date hasta')
    status = filters.ChoiceFilter(choices=Subtask.Status.choices)
    needed_hours = filters.NumberFilter()
    needed_hours_min = filters.NumberFilter(field_name='needed_hours', lookup_expr='gte')
    needed_hours_max = filters.NumberFilter(field_name='needed_hours', lookup_expr='lte')
    
    # Filtros de la tarea asociada (usando lookup con __)
    task = filters.NumberFilter(field_name='task__id', lookup_expr='exact')
    task_title = filters.CharFilter(field_name='task__title', lookup_expr='icontains')
    subject = filters.CharFilter(field_name='task__subject', lookup_expr='icontains')
    type = filters.CharFilter(field_name='task__type', lookup_expr='iexact')
    priority = filters.CharFilter(field_name='task__priority', lookup_expr='iexact')
    # Permite excluir subtareas por id: ?exclude_ids=1,2,3
    exclude_ids = filters.CharFilter(method='filter_exclude_ids', label='Exclude IDs (csv)')

    def filter_exclude_ids(self, queryset, name, value):
        """Excluye los ids provistos en una lista CSV."""
        if not value:
            return queryset

        ids = []
        for token in value.split(','):
            token = token.strip()
            if not token:
                continue
            try:
                ids.append(int(token))
            except ValueError:
                continue

        if ids:
            return queryset.exclude(id__in=ids)
        return queryset
    
    class Meta:
        model = Subtask
        fields = ['planification_date', 'planification_date_gte', 'planification_date_lte', 'status', 'needed_hours', 'subject', 'type', 'priority', 'task', 'task_title', 'exclude_ids']


class SubtaskViewSet(viewsets.ModelViewSet):
    serializer_class = SubtaskSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = SubtaskFilter

    def get_queryset(self):
        return Subtask.objects.select_related('task').filter(task__user=self.request.user).order_by('planification_date', 'created_at')
        