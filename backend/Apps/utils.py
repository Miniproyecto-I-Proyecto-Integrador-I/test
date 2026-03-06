from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    # Primero, deja que DRF intente manejar la excepción
    response = exception_handler(exc, context)

    # Si la respuesta existe (errores 404, 403, 401 de DRF)
    if response is not None:
        custom_data = {
            "status": "error",
            "code": response.status_code,
            "message": "Ha ocurrido un problema con tu solicitud.",
            "details": response.data
        }
        
        # Personalizar mensaje según el código
        if response.status_code == 404:
            custom_data["message"] = "Lo sentimos, el recurso solicitado no existe."
        elif response.status_code == 403:
            custom_data["message"] = "No tienes permisos para realizar esta acción."
            
        response.data = custom_data

    # Si es un error 500 (el servidor explotó y response es None)
    else:
        return Response({
            "status": "critical",
            "code": 500,
            "message": "Error interno del servidor. Nuestro equipo está trabajando en ello.",
            "error_log": str(exc) # Solo para desarrollo, quítalo en producción
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response