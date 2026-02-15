# README.md

# Organizacion Test - Monorepo de Desarrollo

Este es el repositorio central de desarrollo para la organizacion. Contiene tanto el backend como el frontend para asegurar la integracion continua y pruebas de compatibilidad en un solo lugar antes del despliegue.

## Estructura del Repositorio

/test (Monorepo)
├── backend/     # API construida con Django
├── frontend/    # Aplicacion SPA construida con React
├── .github/     # Configuraciones de flujos y plantillas
└── README.md    # Documentacion principal

---

## Requisitos Previos

* Python 3.10 o superior
* Node.js 18 o superior
* Virtualenv (recomendado para el backend)
* Administrador de paquetes npm

---

## Configuracion y Ejecucion Local

Siga estos pasos para levantar el proyecto completo en su maquina local.

### 1. Servidor Backend (Django)

Desde la raiz del monorepo:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

```

El servidor estara disponible en: http://localhost:8000


### 2. Cliente Frontend (React)

En una nueva terminal, desde la raiz del monorepo:

```bash
cd frontend
npm install
npm run dev

```

## Calidad de Codigo y Estandares

Para mantener un codigo limpio y consistente, utilizamos ESLint en el frontend.

### Ejecutar Linters

npm run lint

La aplicacion estara disponible en: http://localhost:5173

---

## Flujo de Trabajo (Git Flow)

Este repositorio utiliza la metodologia Git Flow para organizar el desarrollo. Se prohibe el push directo a las ramas principales.

### Ramas Permanentes

* main: Contiene el codigo estable que refleja lo que esta en produccion.
* develop: Rama principal de integracion donde se agrupan las nuevas funcionalidades.

### Ramas Temporales

* feature/: Ramas para nuevas funcionalidades. Se crean desde develop y se mezclan de vuelta a develop.
* release/: Ramas para preparacion de lanzamientos. Se crean desde develop y se mezclan en main y develop.
* hotfix/: Ramas para corregir errores criticos en produccion. Se crean desde main y se mezclan en main y develop.

---

## Convenciones de Pull Request (PR)

1. El titulo del PR debe ser descriptivo (ej: "feature: agregar autenticacion JWT").
2. Todo PR debe pasar las pruebas locales y el linting antes de ser solicitado.
3. Se requiere al menos una aprobacion de un par para integrar cambios a develop o main.

---

## Sincronizacion para Despliegue

Aunque el desarrollo ocurre en este monorepo, el despliegue se realiza a traves de los repositorios independientes de la organizacion:

* Repositorio Backend: organizacion/backend
* Repositorio Frontend: organizacion/frontend

El proceso de actualizacion hacia estos repositorios de despliegue se realiza mediante el flujo de integracion definido tras el merge en la rama main de este repositorio.
