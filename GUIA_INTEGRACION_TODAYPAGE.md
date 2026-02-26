# 📋 Guía de Integración del Componente AddSubtask en TodayPage

Este documento te muestra cómo integrar el componente `AddSubtask` en tu página `TodayPage.tsx` o en cualquier página de detalle de tarea.

---

## 📍 Paso 1: Importar el Componente

```typescript
// TodayPage.tsx
import AddSubtask from '@/shared/Components/AddSubtask';
import { SubtaskListItem } from '@/shared/Types/subtaskFormTypes';
```

---

## 📍 Paso 2: Agregar Estado y Funciones

```typescript
import React, { useState } from 'react';
import AddSubtask from '@/shared/Components/AddSubtask';
import { SubtaskListItem } from '@/shared/Types/subtaskFormTypes';
import { ApiClient } from '@/Services/ApiClient';

export const TodayPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Información de la tarea (puedes obtenerla del estado o props)
  const currentTask = {
    id: 1,
    title: 'Ensayo sobre la Revolución Francesa',
    description: 'Escribir un ensayo completo',
    total_hours: 5.0,
  };

  // Manejador para guardar subtareas
  const handleSubmitSubtasks = async (subtasks: SubtaskListItem[]) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Preparar datos para enviar
      const payload = {
        task_id: currentTask.id,
        subtasks: subtasks.map((st) => ({
          description: st.description,
          planification_date: st.planification_date,
          needed_hours: Number(st.needed_hours),
        })),
      };

      // Llamar a tu API
      const response = await ApiClient.post(
        `/tasks/${currentTask.id}/subtasks/`,
        payload
      );

      setSuccessMessage('¡Subtareas agregadas correctamente!');
      
      // Aquí puedes actualizar el estado global si lo necesitas
      // dispatch(updateTask(response.data));

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      const message = 
        error instanceof Error 
          ? error.message 
          : 'Error al guardar las subtareas';
      
      setErrorMessage(message);
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="today-page">
      <div className="today-page__container">
        {/* Mensajes de estado */}
        {successMessage && (
          <div className="alert alert--success">
            ✅ {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="alert alert--error">
            ❌ {errorMessage}
          </div>
        )}

        {/* Componente AddSubtask */}
        <AddSubtask
          taskTitle={currentTask.title}
          taskDescription={currentTask.description}
          totalTaskHours={currentTask.total_hours}
          onSubmit={handleSubmitSubtasks}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default TodayPage;
```

---

## 📍 Paso 3: Agregar Estilos (Opcional)

Crea o actualiza `TodayPage.css`:

```css
.today-page {
  width: 100%;
  min-height: 100vh;
  background: #f9fafb;
  padding: 24px;
}

.today-page__container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Mensajes de alerta */
.alert {
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  animation: slideIn 0.3s ease-out;
}

.alert--success {
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}

.alert--error {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #7f1d1d;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 🔄 Paso 4: Integración con Tu API Backend

### En tu servicio ApiClient.ts:

```typescript
// Services/ApiClient.ts
export const createSubtasks = async (taskId: number, subtasks: any[]) => {
  return ApiClient.post(`/tasks/${taskId}/subtasks/`, {
    subtasks,
  });
};

export const updateSubtask = async (subtaskId: number, data: any) => {
  return ApiClient.patch(`/subtasks/${subtaskId}/`, data);
};

export const deleteSubtask = async (subtaskId: number) => {
  return ApiClient.delete(`/subtasks/${subtaskId}/`);
};
```

### Endpoints esperados en tu backend Django:

```python
# Django URLs
POST   /api/tasks/<id>/subtasks/      # Crear subtareas
GET    /api/tasks/<id>/subtasks/      # Listar subtareas
PATCH  /api/subtasks/<id>/            # Actualizar subtarea
DELETE /api/subtasks/<id>/            # Eliminar subtarea
```

---

## 🎯 Paso 5: Ejemplo Completo con React Hook Form (Opcional)

Si prefieres usar React Hook Form para validación más avanzada:

```typescript
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import AddSubtask from '@/shared/Components/AddSubtask';

export const TodayPageAdvanced: React.FC = () => {
  const { handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = useCallback(
    async (subtasks) => {
      try {
        // Tu lógica aquí
        console.log('Guardando subtareas:', subtasks);
      } catch (error) {
        console.error('Error:', error);
      }
    },
    []
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AddSubtask
        taskTitle="Mi Tarea"
        totalTaskHours={5.0}
        onSubmit={onSubmit}
        isLoading={isSubmitting}
      />
    </form>
  );
};
```

---

## 📡 Paso 6: Cargar Subtareas Existentes

Si necesitas mostrar subtareas ya guardadas:

```typescript
import React, { useState, useEffect } from 'react';
import AddSubtask from '@/shared/Components/AddSubtask';

export const TodayPageWithExisting: React.FC<{ taskId: number }> = ({
  taskId,
}) => {
  const [existingSubtasks, setExistingSubtasks] = useState([]);
  const [isLoadingSubtasks, setIsLoadingSubtasks] = useState(true);

  // Cargar subtareas existentes al montar
  useEffect(() => {
    const loadSubtasks = async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}/subtasks/`);
        const data = await response.json();
        setExistingSubtasks(data.subtasks || []);
      } finally {
        setIsLoadingSubtasks(false);
      }
    };

    loadSubtasks();
  }, [taskId]);

  if (isLoadingSubtasks) return <div>Cargando...</div>;

  return (
    <div>
      {existingSubtasks.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3>Subtareas Existentes</h3>
          <ul>
            {existingSubtasks.map((st) => (
              <li key={st.id}>
                {st.description} - {st.planification_date}
              </li>
            ))}
          </ul>
        </div>
      )}

      <AddSubtask
        taskTitle="Mi Tarea"
        totalTaskHours={5.0}
        onSubmit={async (subtasks) => {
          // Manejar nuevas subtareas
        }}
      />
    </div>
  );
};
```

---

## 🧪 Paso 7: Testing

Ejemplo con React Testing Library:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodayPage from './TodayPage';

describe('TodayPage with AddSubtask', () => {
  it('should render AddSubtask component', () => {
    render(<TodayPage />);
    expect(screen.getByText('Desglose de Subtareas')).toBeInTheDocument();
  });

  it('should enable submit button when subtask is added', async () => {
    const user = userEvent.setup();
    render(<TodayPage />);

    // Llenar formulario
    const descriptionInput = screen.getByPlaceholderText(/Buscar 3 referencias/i);
    await user.type(descriptionInput, 'Nueva subtarea');

    const dateInput = screen.getByLabelText(/¿Qué día planeas/i);
    await user.type(dateInput, '2026-03-01');

    const hoursInput = screen.getByLabelText(/Tiempo estimado/i);
    await user.type(hoursInput, '2');

    // Agregar subtarea
    const addButton = screen.getByText('Añadir este paso');
    await user.click(addButton);

    // Verificar que se agregó
    expect(screen.getByText('Nueva subtarea')).toBeInTheDocument();

    // Enviar formulario
    const submitButton = screen.getByText('Finalizar planificación');
    await user.click(submitButton);

    // Esperar respuesta
    await waitFor(() => {
      expect(screen.getByText(/correctamente/i)).toBeInTheDocument();
    });
  });
});
```

---

## 🎯 Checklist de Integración

- [ ] Importar componente `AddSubtask`
- [ ] Importar tipos `SubtaskListItem`
- [ ] Crear función `handleSubmitSubtasks`
- [ ] Pasar props correctamente al componente
- [ ] Implementar endpoint en backend
- [ ] Manejar errores y mensajes de éxito
- [ ] Agregar estilos de alertas (opcional)
- [ ] Probar en diferentes pantallas (responsive)
- [ ] Escribir tests unitarios
- [ ] Actualizar documentación del proyecto

---

## 🔗 Referencias Rápidas

| Archivo | Ubicación | Propósito |
|---------|-----------|----------|
| AddSubtask.tsx | shared/Components/ | Componente principal |
| AddSubtask.css | shared/Components/ | Estilos |
| useSubtaskForm.ts | shared/Hooks/ | Lógica del formulario |
| subtaskFormTypes.ts | shared/Types/ | Interfaces TypeScript |
| subtaskUtils.ts | shared/Utils/ | Funciones auxiliares |

---

## 💡 Tips Importantes

1. **Manejo de errores**: Siempre captura errores en `handleSubmitSubtasks`
2. **Loading state**: Usa la prop `isLoading` para deshabilitar botones
3. **Mensajes de usuario**: Muestra confirmaciones y errores claros
4. **Limpieza de datos**: Remover IDs temporales antes de enviar al backend
5. **Responsive**: El componente es responsive, pero verifica en mobile
6. **Accesibilidad**: Mantén los labels asociados a los inputs

---

## ❓ Troubleshooting

### El componente no aparece
```typescript
// Verifica que el import sea correcto
import AddSubtask from '@/shared/Components/AddSubtask';

// Y que el archivo CSS se importe también
// (debe estar en el mismo archivo o en un archivo CSS global)
```

### Los estilos no se aplican
```css
/* Asegúrate que el CSS esté en la ruta correcta */
/* d:\DOCUMENTOS\GitHub\test\frontend\src\shared\Components\AddSubtask.css */

/* O importa en el componente */
import './AddSubtask.css';
```

### Las validaciones no funcionan
```typescript
// Verifica que el hook useSubtaskForm esté importado correctamente
import { useSubtaskForm } from '@/shared/Hooks/useSubtaskForm';
```

---

## 📚 Documentación Relacionada

- [Guía Completa del Componente](./COMPONENTE_ADDSUBTASK_GUIA.md)
- [Estructura del Componente](./ESTRUCTURA_COMPONENTE.md)
- [Ejemplos de Uso](./frontend/src/Pages/AddSubtaskExamples.tsx)
