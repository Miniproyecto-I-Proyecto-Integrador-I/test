# 🎯 Estructura del Componente AddSubtask

## 📊 Diagram de la Arquitectura

```
AddSubtask Component
│
├── 🎨 AddSubtask.tsx (Componente Principal)
│   ├── Props
│   │   ├── taskTitle: string
│   │   ├── taskDescription?: string
│   │   ├── totalTaskHours?: number
│   │   ├── onSubmit: (subtasks) => Promise<void>
│   │   └── isLoading?: boolean
│   │
│   └── Estructura JSX
│       ├── Header (Información de la tarea)
│       ├── Form (Formulario dinámico)
│       │   ├── Campo: Descripción
│       │   ├── Campo: Fecha
│       │   ├── Campo: Horas
│       │   └── Botón: Agregar
│       ├── List (Lista de subtareas)
│       │   └── Items (Cada subtarea con opciones)
│       └── Footer (Botón finalizar)
│
├── 🎣 useSubtaskForm.ts (Hook Personalizado)
│   ├── State Management
│   │   ├── currentForm: SubtaskFormField
│   │   ├── subtasks: SubtaskListItem[]
│   │   └── errors: Record<string, string>
│   │
│   └── Actions
│       ├── updateFormField()
│       ├── addSubtask()
│       ├── removeSubtask()
│       ├── clearForm()
│       └── getTotalHours()
│
├── 🔧 subtaskUtils.ts (Funciones Utilitarias)
│   ├── validateSubtaskForm()      → Validación de datos
│   ├── formatDate()                → Formato de fechas
│   ├── formatHours()               → Formato de horas
│   └── generateTempId()            → Generación de IDs
│
├── 📝 subtaskFormTypes.ts (Types/Interfaces)
│   ├── SubtaskFormField            → Campos del formulario
│   ├── SubtaskListItem             → Item en la lista
│   ├── SubtaskFormState            → Estado del componente
│   └── ValidationErrors            → Errores de validación
│
└── 🎨 AddSubtask.css (Estilos)
    ├── .subtask-container          → Contenedor principal
    ├── .subtask-header             → Encabezado
    ├── .subtask-content            → Contenido principal
    ├── .subtask-form               → Formulario dinámico
    ├── .subtask-list               → Lista de subtareas
    ├── .subtask-item               → Item individual
    ├── .subtask-footer             → Pie de página
    └── Media Queries               → Responsive design
```

---

## 📦 Archivos Creados

### 1. **Components/AddSubtask.tsx** (180 líneas)
Componente principal de React con toda la UI y lógica.

**Características:**
- Formulario dinámico con validación en tiempo real
- Un campo de descripción (textarea)
- Dos campos lado a lado: fecha y horas
- Botón para agregar subtareas
- Lista dinámica de subtareas agregadas
- Resumen de total de horas
- Botón final para guardar todo

---

### 2. **Components/AddSubtask.css** (500+ líneas)
Estilos organizados por secciones.

**Secciones:**
- Header (con icono, título y tiempo total de la tarea)
- Form (campos, validaciones, errores)
- List (items, badges, botones)
- Responsive (mobile, tablet, desktop)
- Estados (hover, focus, disabled)

---

### 3. **Hooks/useSubtaskForm.ts** (120 líneas)
Hook personalizado con toda la lógica del estado.

**Funcionalidades:**
- Gestión de estado del formulario
- Validación automática
- CRUD de subtareas
- Cálculo de total de horas
- Manejo de errores

---

### 4. **Utils/subtaskUtils.ts** (70 líneas)
Funciones auxiliares reutilizables.

**Funciones:**
- `validateSubtaskForm()` - Validación con mensajes en español
- `formatDate()` - Formateo de fechas a dd/mm/yyyy
- `formatHours()` - Formateo de horas con sufijo
- `generateTempId()` - Generación de IDs únicos

---

### 5. **Types/subtaskFormTypes.ts** (30 líneas)
Interfaces TypeScript para todo el componente.

**Interfaces:**
- `SubtaskFormField` - Estructura de cada subtarea
- `SubtaskListItem` - Item con ID temporal
- `SubtaskFormState` - Estado completo
- `ValidationErrors` - Errores de validación

---

## 🎯 Flujo de Uso

```
Usuario completa formulario
    ↓
Valida campos (sin enviar)
    ↓
Hace clic en "Añadir este paso"
    ↓
Validación completa
    ↓
Se agrega a la lista
    ↓
Se recalcula total de horas
    ↓
Usuario continúa agregando más...
    ↓
Hace clic en "Finalizar planificación"
    ↓
onSubmit callback ejecuta
    ↓
Envía al backend
    ↓
Muestra confirmación
```

---

## 🔐 Características de Seguridad & UX

### Validaciones
- ✅ Descripción: 5-300 caracteres
- ✅ Fecha: No puede ser anterior a hoy
- ✅ Horas: 0.5 a 24 horas

### Experiencia del Usuario
- ✅ Mensajes de error en tiempo real
- ✅ Contador de caracteres en descripción
- ✅ Botones deshabilitados hasta completar validación
- ✅ Confirmación antes de eliminar
- ✅ Resumen visual de total de horas
- ✅ Estado de carga durante envío

### Accesibilidad
- ✅ Labels asociados a inputs
- ✅ Navegación por teclado
- ✅ Mensajes de error claros
- ✅ Atributos ARIA listos

---

## 📱 Responsive Design

| Pantalla | Ancho | Cambios |
|----------|-------|---------|
| **Desktop** | >820px | Layout original de 800px |
| **Tablet** | 480-820px | Header en columna, form adaptado |
| **Mobile** | <480px | Una columna, botones fullwidth |

---

## 💾 Integración con Backend

El componente espera una función `onSubmit` que reciba:

```typescript
[
  {
    id: "temp_1234_abc",
    description: "Buscar referencias",
    planification_date: "2026-03-01",
    needed_hours: 1.5
  },
  ...
]
```

Antes de enviar tu backend, limpia los IDs temporales:

```typescript
const cleanSubtasks = subtasks.map(st => ({
  description: st.description,
  planification_date: st.planification_date,
  needed_hours: Number(st.needed_hours)
}));
```

---

## 🎨 Personalización

### Cambiar colores
Busca en `AddSubtask.css`:
- `#10b981` - Verde primario (acciones)
- `#111827` - Gris oscuro (texto principal)
- `#e5e7eb` - Gris claro (bordes)

### Cambiar textos
Busca en `AddSubtask.tsx`:
- "Desglose de Subtareas" → Título principal
- "Divide tu tarea..." → Descripción
- "Añadir este paso" → Botón agregar

### Cambiar validaciones
Edita en `subtaskUtils.ts`:
- Función `validateSubtaskForm()`
- Ajusta límites de caracteres, horas, etc.

---

## 📚 Documentación Adicional

- **Guía completa**: [COMPONENTE_ADDSUBTASK_GUIA.md](./COMPONENTE_ADDSUBTASK_GUIA.md)
- **Ejemplos de uso**: [Pages/AddSubtaskExamples.tsx](./frontend/src/Pages/AddSubtaskExamples.tsx)

---

## ✨ Características Presentes

- ✅ Formulario dinámico funcionalmente completo
- ✅ Validación en tiempo real con mensajes en español
- ✅ Gestión de estado con hook personalizado
- ✅ Estilos CSS modularizado y organizado
- ✅ TypeScript con tipos seguros
- ✅ Responsive design completo
- ✅ Accesibilidad considerada
- ✅ Ejemplos de integración incluidos
- ✅ Documentación completa
- ✅ Coincide con la imagen del diseño proporcionado

---

## 🚀 Próximos Pasos

1. **Integrar con tu API**: Actualiza la función `onSubmit` en tus páginas
2. **Adaptación de estilos**: Personaliza colores según tu brand
3. **Drageable**: Optionalmente implementa reordenamiento de subtareas
4. **Persistencia**: Guarda en localStorage si lo necesitas
5. **Internacionalización**: Extrae textos a archivos de traducción
