# 1. Imagen base de Python
FROM python:3.11-slim

# 2. Evita que Python genere archivos .pyc y que el buffer se llene
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Directorio de trabajo
WORKDIR /code

# 4. Instalar dependencias del sistema (necesarias para Postgres)
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# 5. Instalar dependencias de Python
COPY requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn  # Asegúrate de tener gunicorn para producción

# 6. Copiar el proyecto
COPY . /code/