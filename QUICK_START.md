# ⚡ Quick Start - AddSubtask Component

**Versión corta para empezar en 5 minutos**

---

## 🚀 Paso 1: Importar

```typescript
import AddSubtask from '@/shared/Components/AddSubtask';
import { SubtaskListItem } from '@/shared/Types/subtaskFormTypes';
```

---

## 🎯 Paso 2: Usar en tu página

```typescript
export const MyPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitSubtasks = async (subtasks: SubtaskListItem[]) => {
    try {
      setIsLoading(true);
      
      // Aquí haces la llamada a tu API
      await fetch('/api/subtasks', {
        method: 'POST',
        body: JSON.stringify({ subtasks }),
      });
      
      alert('¡Listo!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AddSubtask
      taskTitle="Mi Tarea"
      totalTaskHours={5.0}
      onSubmit={handleSubmitSubtasks}
      isLoading={isLoading}
    />
  );
};
```

---

## 📋 Props Necesarias

| Prop | Tipo | Requerido |
|------|------|-----------|
| taskTitle | string | ✅ |
| onSubmit | function | ✅ |
| taskDescription | string | ❌ |
| totalTaskHours | number | ❌ |
| isLoading | boolean | ❌ |

---

## 🎨 Qué incluye

✅ Formulario dinámico  
✅ Validación automática  
✅ Lista de subtareas  
✅ Estilos hermosos  
✅ Responsive design  
✅ Colores verdes (#10b981)  

---

## 📁 Archivos Creados

```
shared/
├── Components/AddSubtask.tsx
├── Components/AddSubtask.css
├── Hooks/useSubtaskForm.ts
├── Types/subtaskFormTypes.ts
└── Utils/subtaskUtils.ts
```

---

## ✨ Funcionalidades

👤 Usuario llena formulario  
✅ Validación en tiempo real  
➕ Agrega subtareas a una lista  
📊 Ve total de horas  
💾 Envía todo de una vez  

---

## 🔧 Configuración

El componente espera recibir subtareas así:

```typescript
[
  {
    description: "Tarea 1",
    planification_date: "2026-03-01",
    needed_hours: 2
  }
]
```

Antes de enviar a tu API, limpia los datos:

```typescript
subtasks.map(s => ({
  description: s.description,
  planification_date: s.planification_date,
  needed_hours: Number(s.needed_hours)
}))
```

---

## 📚 Documentación Completa

- [Guía Completa](./COMPONENTE_ADDSUBTASK_GUIA.md)
- [Estructura](./ESTRUCTURA_COMPONENTE.md)
- [Integración](./GUIA_INTEGRACION_TODAYPAGE.md)
- [Distribución CSS](./DISTRIBUCION_CSS.md)
- [Ejemplos](./frontend/src/Pages/AddSubtaskExamples.tsx)

---

## 🎁 Bonificación: Customización

Cambiar color verde #10b981 por otro:
1. Abre `AddSubtask.css`
2. Busca `#10b981`
3. Reemplaza con tu color

---

## ❓ Preguntas Frecuentes

**P: ¿Es responsive?**  
R: Sí, funciona en mobile, tablet y desktop.

**P: ¿Incluye validación?**  
R: Sí, automática con mensajes en español.

**P: ¿Necesito cambiar algo?**  
R: Solo integrar con tu API en `onSubmit`.

**P: ¿Puedo personalizar estilos?**  
R: Sí, el CSS está bien organizado, fácil de editar.

**P: ¿Funciona sin backend?**  
R: Sí, pero necesitarás uno para guardar datos.

---

**¡Listo para usar! 🎉**
