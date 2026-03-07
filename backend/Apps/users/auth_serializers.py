import re
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'daily_hours', 'bio']
        read_only_fields = ['id']

    def validate_email(self, value):
        # Regex básico para validar formato de correo electrónico
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_regex, value):
            raise serializers.ValidationError("Formato de correo electrónico inválido.")
        return value

    def validate_password(self, value):
        # Verificar que tenga al menos una mayúscula, una minúscula, un número y un carácter especial
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos una letra mayúscula.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos una letra minúscula.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("La contraseña debe contener al menos un número.")
        if not re.search(r'[@$!%*?&._-]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos un carácter especial (@, $, !, %, *, ?, &, ., _, -).")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Eliminar el campo username heredado
        self.fields.pop('username', None)
    
    def validate(self, attrs):
        # Obtener email y password del request
        email = attrs.get('email')
        password = attrs.get('password')
        
        # Buscar usuario por email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('No existe una cuenta con este correo electrónico.')
        
        # Verificar la contraseña
        if not user.check_password(password):
            raise serializers.ValidationError('Contraseña incorrecta.')
        
        # Crear el token para el usuario autenticado
        refresh = self.get_token(user)
        
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        
        return data
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        return token