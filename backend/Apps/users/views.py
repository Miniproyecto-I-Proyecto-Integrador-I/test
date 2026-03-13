from django.contrib.auth import get_user_model
from django.db.models import Sum
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import UserSerializer
from .auth_serializers import RegisterSerializer, CustomTokenObtainPairSerializer
from Apps.subtask.models import Subtask

User = get_user_model()


class AuthTokenView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        # Cada usuario solo ve su propia info
        return User.objects.filter(id=self.request.user.id)

    def get_permissions(self):
        if self.action in ['create', 'register']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], url_path='register')
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='me')
    def me(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated], url_path='update')
    def update_me(self, request):
        new_daily_hours = request.data.get('daily_hours')
        
        if new_daily_hours is not None:
            try:
                new_daily_hours = int(new_daily_hours)
                old_daily_hours = request.user.daily_hours
                
                if new_daily_hours < old_daily_hours:
                    # Buscar subtareas pendientes o en progreso del usuario
                    subtasks_queryset = Subtask.objects.filter(
                        task__user=request.user,
                        status__in=[Subtask.Status.PENDING, Subtask.Status.IN_PROGRESS]
                    )
                    
                    # Agrupar por fecha y sumar horas
                    conflicts_dates = subtasks_queryset.values('planification_date').annotate(
                        total_day_hours=Sum('needed_hours')
                    ).filter(total_day_hours__gt=new_daily_hours)
                    
                    if conflicts_dates.exists():
                        # Obtener las subtareas específicas de esos días con conflicto
                        dates = [c['planification_date'] for c in conflicts_dates]
                        conflicting_subtasks = subtasks_queryset.filter(planification_date__in=dates).order_by('planification_date')
                        
                        # Serializar conflictos según formato solicitado: id, fecha, nombre, horas
                        conflicts_data = [
                            {
                                "id": s.id,
                                "fecha": s.planification_date,
                                "descripcion": s.description,
                                "horas": s.needed_hours
                            }
                            for s in conflicting_subtasks
                        ]
                        return Response(conflicts_data, status=status.HTTP_409_CONFLICT)
            except (ValueError, TypeError):
                pass

        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


        