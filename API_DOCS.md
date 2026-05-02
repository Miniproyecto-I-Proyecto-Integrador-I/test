# Documentación de Autenticación de la API

Este documento describe los endpoints mínimos requeridos para la autenticación en el backend de la aplicación, implementados usando JWT (`djangorestframework-simplejwt`).

## Endpoints

### 1. Iniciar Sesión (Obtener Tokens)

Genera un par de tokens JWT (access token y refresh token) al proporcionar credenciales válidas.

- **URL:** `/api/auth/login/`
- **Método:** `POST`
- **Body Request:**
  ```json
  {
    "username": "tu_usuario",
    "password": "tu_password"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "refresh": "eyJhbG... (string largo)",
    "access": "eyJhbG... (string largo)"
  }
  ```
- **Response (401 Unauthorized):**
  ```json
  {
    "detail": "No active account found with the given credentials"
  }
  ```

### 2. Refrescar Token

Genera un nuevo *access token* una vez que el actual ha vencido y envía el `refresh` token válido.

- **URL:** `/api/auth/refresh/`
- **Método:** `POST`
- **Body Request:**
  ```json
  {
    "refresh": "eyJhbG... (tu_refresh_token_válido)"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access": "eyJhbG... (nuevo_access_token)"
  }
  ```
- **Response (401 Unauthorized):** Si el token de refresh ha expirado o no es válido.

### 3. Verificar Token

Verifica si un *access token* aún es válido (no ha expirado y no ha sido alterado). No retorna cuerpo adicional si es exitoso.

- **URL:** `/api/auth/verify/`
- **Método:** `POST`
- **Body Request:**
  ```json
  {
    "token": "eyJhbG... (tu_access_token)"
  }
  ```
- **Response (200 OK):**
  ```json
  {}
  ```
- **Response (401 Unauthorized):**
  ```json
  {
    "detail": "Token is invalid or expired",
  }
  ```

---

## Usuarios

### 1. Registrarse como usuario

Crea una nueva cuenta de usuario en el sistema.

- **URL:** `/api/user/register/`
- **Método:** `POST`
- **Body Request:**
  ```json
  {
    "username": "Tu Nombre Completo",
    "email": "tu_correo@ejemplo.com",
    "password": "Password123!"
  }
  ```
- **Response (201 Created):**
  Retorna los datos del usuario recién creado.
  ```json
  {
    "id": 1,
    "username": "Tu Nombre Completo",
    "email": "tu_correo@ejemplo.com",
    "daily_hours": 8,
    "bio": ""
  }
  ```
- **Response (400 Bad Request):**
  Ocurre cuando hay errores de validación. La API retornará un objeto indicando el o los campos que fallaron, junto a un arreglo con los mensajes de error.
  
  Ejemplo de validación Regex fallida:
  ```json
  {
    "email": [
      "Formato de correo electrónico inválido."
    ],
    "password": [
      "La contraseña debe contener al menos un número."
    ]
  }
  ```
  Ejemplo de campos duplicados:
  ```json
  {
    "username": [
      "A user with that username already exists."
    ],
    "email": [
      "custom user with this email already exists."
    ]
  }
  ```

---

## Vista Hoy (Mi Día) - Prioridades y Actividades

Esta sección detalla los endpoints y reglas de negocio para determinar qué actividades (Subtareas) se muestran en la vista "Hoy" y en qué orden de prioridad/urgencia.

### Reglas de Negocio Implementadas (Prioridades)

La vista "Hoy" determina la importancia de una tarea mediante dos reglas principales que se procesan al solicitar la lista de actividades:

1. **Regla de Ordenamiento Cronológico (Urgente vs Próximo):**
   Las subtareas no manejan una "urgencia" estática manual, sino que se ordenan dinámicamente según su fecha agendada (`planification_date`).
   - El backend retorna la respuesta ordenada de forma ascendente: `order_by('planification_date', 'created_at')`.
   - **Resultado:** Las actividades agendadas para fechas pasadas (atrasadas) o exactamente para el día actual aparecen siempre *de primero* en la lista, catalogadas implícitamente como **Urgentes**. Las actividades agendadas para días futuros se agrupan al final de la lista, vistas como **Próximas**.

2. **Regla de Herencia de Prioridad:**
   Las subtareas heredan la etiqueta de prioridad (Alta, Media, Baja) de la `Task` (Tarea Padre) a la que pertenecen. Al procesar una subtarea, el frontend expone `subtask.task.priority` para brindar contexto visual sobre la relevancia del bloque general padre.

---

### 1. Obtener Prioridades de Hoy (Subtareas)

Retorna la lista de actividades delegadas para el usuario actual. El orden predeterminado dicta la urgencia (Primeras posiciones = Urgentes/Atrasadas).

- **URL:** `/api/subtasks/`
- **Método:** `GET`
- **Headers Requeridos:**
  ```json
  {
    "Authorization": "Bearer <tu_access_token>"
  }
  ```
- **Filtros Soportados (Query Parameters):**
  Se pueden añadir estos parámetros a la URL para recortar o definir exactamente qué es "Hoy" para la vista. Para la funcionalidad de **Filtros Básicos Hoy**, se destacan los siguientes:
  
  **Filtros de Tiempo (Obligatorios para la vista Hoy):**
  - `?planification_date=YYYY-MM-DD`: Actividades agendadas estrictamente para este día.
  - `?planification_date_gte=YYYY-MM-DD`: Actividades agendadas en o después de esta fecha.
  - `?planification_date_lte=YYYY-MM-DD`: Actividades agendadas en o antes de esta fecha.
  
  **Filtros Básicos (Por Curso y Estado):**
  - `?status=pending|in_progress|completed`: Filtrar por el estado progresivo de la actividad. Permite al estudiante enfocarse solo en lo que falta (`pending` / `in_progress`) o revisar lo terminado (`completed`).
  - `?subject=<materia>`: Filtrar si el nombre de la materia de la tarea padre coincide (búsqueda parcial/insensible a mayúsculas). Ideal para filtrar por curso.
  - `?task_title=<texto>`: Filtrar si el título de la tarea padre contiene este texto.

  **Otros Filtros Adicionales:**
  - `?priority=high|medium|low`: Filtrar subtareas buscando aquellas cuyo padre tenga esta prioridad.

- **Request Example para "Estrictamente Hoy":**
  `/api/subtasks/?planification_date_gte=2023-10-31&planification_date_lte=2023-10-31`

- **Response Exitosa (200 OK):**
  ```json
  [
    {
      "id": 15,
      "description": "Estudiar Álgebra Lineal",
      "status": "pending",
      "planification_date": "2023-10-31",
      "needed_hours": 2.5,
      "task": {
        "id": 3,
        "title": "Examen Final Matemáticas",
        "priority": "high",
        "subject": "Matemática Aplicada",
        "type": "Evaluación"
      }
    }
  ]
  ```

---

