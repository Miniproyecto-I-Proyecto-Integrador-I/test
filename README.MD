# README.md

# Organizacion Test - Monorepo de Desarrollo

Este es el repositorio central de desarrollo para la organizacion. Contiene tanto el backend como el frontend para asegurar la integracion continua y pruebas de compatibilidad en un solo lugar antes del despliegue.

## Estructura del Repositorio

/test (Monorepo)
├── backend/     # API de Django
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

La aplicacion estara disponible en: http://localhost:5173

---

## Calidad de Codigo y Estandares

Para mantener un codigo limpio y consistente, utilizamos ESLint en el frontend.

### Ejecutar Linters

```bash
npm run lint

```

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


## Estructura del Proyecto (Frontend)

El proyecto sigue una arquitectura modular orientada a **Features** (Funcionalidades) para facilitar la escalabilidad y el mantenimiento.

### Directorios Principales

| Carpeta | Descripción |
| :--- | :--- |
| **`src/App`** | Configuración de las rutas principales de la aplicación (React Router). |
| **`src/Pages`** | Contiene las páginas de alto nivel. Su función es orquestar componentes; deben ser archivos ligeros con poca lógica. |
| **`src/Feature`** | Contiene la lógica de negocio dividida por módulos (ej. `ManageTodayPage`). |
| **`src/Services`** | Configuración global de **Axios** (instancia base, interceptores y URL del backend). |
| **`src/shared`** | Recursos globales reutilizables en todo el proyecto (Components, Hooks, Utils, Types). |
| **`src/assets`** | Archivos estáticos como imágenes, SVGs y fuentes. |

---

### Anatomía de una Feature (`Manage{NamePage}`)

Cada funcionalidad dentro de la carpeta `Feature` se divide en:

* **`Components`**: Componentes de React específicos y exclusivos de esta página.
* **`Hooks`**: Lógica de estado (`useState`, `useEffect`) y llamadas a servicios encapsuladas para mantener limpio el componente.
* **`Services`**: Funciones de **Axios** para peticiones específicas a la API REST.
* **`Types`**: Definiciones de interfaces y tipos de TypeScript.
* **`Utils`**: Funciones de ayuda (formateo de fechas, validaciones, lógica matemática).

---

###  Convenciones de Nomenclatura en Features

Para mantener la consistencia y facilitar la búsqueda de archivos, todas las carpetas dentro de `src/Feature` deben seguir este estándar:

* **Carpeta Raíz de la Feature:** Debe usar el prefijo **`Manage`** seguido del nombre de la página en *PascalCase* (ejemplo: `ManageTodayPage`, `ManageUserDashboard`).
* **Componentes:** Se nombran en *PascalCase* (ejemplo: `TableComponent.tsx`).
* **Hooks:** Deben empezar siempre con el prefijo **`use`** en *camelCase* (ejemplo: `useFetchTodayData.ts`).
* **Services / Utils / Types:** Se nombran en *camelCase* describiendo su función específica (ejemplo: `formatDate.ts`, `authService.ts`).

> [!IMPORTANT]
> **Regla de Oro:** Siempre que crees una nueva funcionalidad, asegúrate de que el nombre de la carpeta madre empiece con `Manage`. Esto agrupa visualmente todas las unidades de lógica de negocio en el explorador de archivos.

---

### Carpeta `shared` (Recursos Compartidos)

Se utiliza para elementos que se repiten en dos o más páginas:
* **Components**: Botones, Inputs, Modales comunes, Layouts.
* **Hooks / Utils / Types**: Lógica genérica y tipado global.

---

### Reglas de Desarrollo y Buenas Prácticas

1.  **Regla de las 200 líneas:** Ningún archivo debe exceder las **200 líneas de código**. Si un archivo es más grande, debe ser refactorizado o dividido en sub-componentes/hooks.
2.  **Lógica en Hooks:** Los componentes deben ser mayoritariamente visuales. La lógica compleja debe residir en hooks personalizados dentro de la carpeta de la Feature.
3.  **Tipado estricto:** Todo dato que viaje desde el Service o se use en un componente debe tener su interfaz definida en `Types`.

---

##  Estructura del Proyecto (Backend)

El backend está desarrollado con **Django** y **Django REST Framework**, siguiendo una arquitectura modular para mantener la lógica de negocio aislada y organizada.

###  Organización de Carpetas

| Carpeta / Archivo | Descripción |
| :--- | :--- |
| **`backend/config/`** | Directorio raíz del proyecto. Contiene la configuración global (`settings.py`), y el enrutamiento principal (`urls.py`). |
| **`backend/Apps/`** | Contenedor de todas las aplicaciones de Django. Ayuda a mantener la raíz del proyecto limpia. |
| **`backend/Apps/task/`** | Aplicación específica para la gestión de tareas. Contiene modelos, vistas y lógica propia. |
| **`backend/venv/`** | Entorno virtual de Python (excluido de Git). |
| **`manage.py`** | Utilidad de línea de comandos para interactuar con el proyecto Django. |
| **`requirements.txt`** | Lista de dependencias y librerías necesarias para ejecutar el proyecto. |

---

###  Anatomía de una Aplicación (`Apps/{app_name}`)

Dentro de cada aplicación (como `task`), respetamos la estructura estándar de Django para asegurar la escalabilidad:

* **`models.py`**: Definición de las tablas de la base de datos y sus relaciones.
* **`views.py`**: Lógica de respuesta a las peticiones (procesamiento de datos y retorno de JSON).
* **`urls.py`**: Rutas específicas de la aplicación (mapeo de endpoints).
* **`admin.py`**: Configuración del panel de administración de Django para esta app.
* **`migrations/`**: Historial de cambios realizados en la base de datos.
* **`tests.py`**: Pruebas unitarias para garantizar que la lógica de la app funcione correctamente.

---

###  Estándares de Desarrollo Backend

1.  **Entorno Virtual:** Siempre se debe trabajar dentro de `venv` para evitar conflictos de versiones.
2.  **Dependencias:** Cualquier librería nueva instalada debe registrarse inmediatamente con `pip freeze > requirements.txt`.
3.  **Base de Datos:** Los cambios en los modelos deben ir acompañados de sus respectivas migraciones (`makemigrations` y `migrate`).

> [!TIP]
> Al igual que en el Frontend, se recomienda mantener las funciones dentro de `views.py` lo más concisas posible, delegando lógica compleja a archivos de utilidad si es necesario.