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
    "code": "token_not_valid"
  }
  ```

---
