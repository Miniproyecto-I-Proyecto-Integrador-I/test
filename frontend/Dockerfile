# Etapa 1: Compilación
FROM node:18-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:stable-alpine
# Copiamos los archivos compilados de la etapa anterior a la carpeta de Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copiamos una configuración personalizada de Nginx si la tienes (opcional)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
