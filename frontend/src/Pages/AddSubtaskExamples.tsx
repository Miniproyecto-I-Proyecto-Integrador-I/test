/**
 * Ejemplo de uso del componente AddSubtask en una página de detalle de actividad
 * Este archivo muestra cómo integrar el componente en tu aplicación
 */

import React, { useState } from 'react';
import type { SubtaskListItem } from '@/shared/Types/subtaskFormTypes';
import AddSubtask from '@/shared/Components/AddSubtask';

/**
 * Ejemplo 1: Uso básico en una página de crear actividad
 */
export const CreateActivityPageExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmitSubtasks = async (subtasks: SubtaskListItem[]) => {
    try {
      setIsLoading(true);
      setSuccessMessage('');

      // Llamar a tu API o servicio
      const response = await fetch('/api/tasks/123/subtasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: 123,
          subtasks: subtasks.map((st) => ({
            description: st.description,
            planification_date: st.planification_date,
            needed_hours: Number(st.needed_hours),
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar las subtareas');
      }

      setSuccessMessage('¡Subtareas agregadas correctamente!');

      // Aquí puedes hacer más cosas, como redireccionar o actualizar el estado
    } catch (error) {
      console.error('Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Crear Nueva Actividad</h1>

      {successMessage && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #a7f3d0',
          }}
        >
          {successMessage}
        </div>
      )}

      <AddSubtask
        taskTitle="Ensayo sobre la Revolución Francesa"
        taskDescription="Escribir un ensayo completo analizando los eventos principales de la Revolución Francesa"
        totalTaskHours={5.0}
        onSubmit={handleSubmitSubtasks}
        isLoading={isLoading}
      />
    </div>
  );
};

/**
 * Ejemplo 2: Con datos dinámicos desde props
 */
interface ActivityDetailPageProps {
  taskId: number;
  taskTitle: string;
  taskDescription: string;
  totalHours: number;
}

export const ActivityDetailPageWithDynamicData: React.FC<
  ActivityDetailPageProps
> = ({ taskId, taskTitle, taskDescription, totalHours }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [savedSubtasks, setSavedSubtasks] = useState<SubtaskListItem[]>([]);

  const handleSubmitSubtasks = async (subtasks: SubtaskListItem[]) => {
    try {
      setIsLoading(true);

      // Enviar al backend
      const cleanedSubtasks = subtasks.map((st) => ({
        description: st.description,
        planification_date: st.planification_date,
        needed_hours: Number(st.needed_hours),
      }));

      const response = await fetch(`/api/tasks/${taskId}/subtasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cleanedSubtasks }),
      });

      if (!response.ok) throw new Error('Error en la solicitud');

      const data = await response.json();
      setSavedSubtasks(data.subtasks);

      // Mostrar notificación de éxito
      console.log('Subtareas guardadas exitosamente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <AddSubtask
        taskTitle={taskTitle}
        taskDescription={taskDescription}
        totalTaskHours={totalHours}
        onSubmit={handleSubmitSubtasks}
        isLoading={isLoading}
      />

      {savedSubtasks.length > 0 && (
        <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
          <h3>Subtareas Guardadas</h3>
          <ul>
            {savedSubtasks.map((subtask) => (
              <li key={subtask.id}>
                {subtask.description} - {subtask.planification_date} ({subtask.needed_hours}h)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Ejemplo 3: Integración con servicio de API personalizado
 */
import { ApiClient } from '@/Services/ApiClient';

export const ActivityDetailPageWithService: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitSubtasks = async (subtasks: SubtaskListItem[]) => {
    try {
      setIsLoading(true);

      // Usando tu servicio ApiClient
      const response = await ApiClient.post('/tasks/123/subtasks/', {
        subtasks: subtasks.map((st) => ({
          description: st.description,
          planification_date: st.planification_date,
          needed_hours: Number(st.needed_hours),
        })),
      });

      console.log('Subtareas guardadas:', response);
    } catch (error) {
      console.error('Error al guardar subtareas:', error);
      throw error;
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

/**
 * Ejemplo 4: Con manejo de errores avanzado
 */
export const ActivityDetailPageWithErrorHandling: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmitSubtasks = async (subtasks: SubtaskListItem[]) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      // Validar antes de enviar
      if (subtasks.length === 0) {
        throw new Error('Debes agregar al menos una subtarea');
      }

      const response = await fetch('/api/tasks/123/subtasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subtasks: subtasks.map((st) => ({
            description: st.description,
            planification_date: st.planification_date,
            needed_hours: Number(st.needed_hours),
          })),
        }),
      });

      if (response.status === 400) {
        const data = await response.json();
        throw new Error(data.message || 'Error en los datos enviados');
      }

      if (!response.ok) {
        throw new Error('Error al guardar las subtareas en el servidor');
      }

      setSuccess('Subtareas guardadas correctamente!');

      // Aquí podrías redireccionar o hacer algo más
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      {error && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#fee2e2',
            color: '#7f1d1d',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #fecaca',
          }}
        >
          ❌ {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #a7f3d0',
          }}
        >
          ✅ {success}
        </div>
      )}

      <AddSubtask
        taskTitle="Ensayo sobre la Revolución Francesa"
        totalTaskHours={5.0}
        onSubmit={handleSubmitSubtasks}
        isLoading={isLoading}
      />
    </div>
  );
};
