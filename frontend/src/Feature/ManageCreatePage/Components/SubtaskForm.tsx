import React, { useEffect, useState } from 'react';
import { useSubtaskForm } from '../Hooks/useSubtaskForm';
import type { SubtaskItem } from '../Types/subtask.types';
import '../Styles/SubtaskForm.css';
import { getTaskById } from '../Services/taskService';
import { ClipboardList, GripVertical, Calendar, Clock, Trash2 } from 'lucide-react';
import InfoTooltip from '../../../shared/Components/InfoTooltip';

const getTodayDateStr = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface SubtaskFormProps {
  onSubtasksChange?: (subtasks: any[]) => void;
  taskTitle?: string;
  initialSubtasks?: SubtaskItem[];
  onFinalize?: (subtasks: any[]) => Promise<void>;
  taskId?: number;
}

const SubtaskForm: React.FC<SubtaskFormProps> = ({
  onSubtasksChange,
  taskTitle = 'Ensayo sobre la Revolucion Francesa',
  initialSubtasks = [],
  onFinalize,
  taskId,
}) => {
  const {
    subtasks,
    formData,
    errors,
    totalNeededHours,
    handleFieldChange,
    addSubtask,
    removeSubtask,
    reorderSubtasks,
  } = useSubtaskForm(initialSubtasks);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalHours, setOriginalHours] = useState(0);
  const [maxDate, setMaxDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchOriginalHours = async () => {
      if (taskId) {
        try {
          const fetchedTask = await getTaskById(taskId);
          if (fetchedTask.subtasks) {
            const totalOriginal = fetchedTask.subtasks.reduce(
              (sum: number, st: any) => sum + (Number(st.needed_hours) || 0),
              0
            );
            setOriginalHours(totalOriginal);
          }
          if (fetchedTask.due_date) {
            setMaxDate(fetchedTask.due_date.split('T')[0]);
          }
        } catch (error) {
          console.error('Error fetching original task:', error);
        }
      }
    };
    fetchOriginalHours();
  }, [taskId]);

  useEffect(() => {
    if (onSubtasksChange) {
      onSubtasksChange(subtasks);
    }
  }, [subtasks, onSubtasksChange]);

  const handleAddSubtask = () => {
    if (maxDate && formData.planification_date > maxDate) {
      alert(`La fecha del paso no puede superar la fecha límite de la tarea (${formatDate(maxDate)}).`);
      return;
    }
    addSubtask();
  };

  const handleRemoveSubtask = (id: string) => {
    removeSubtask(id);
  };

  const handleDragStart = (id: string) => (event: React.DragEvent) => {
    event.dataTransfer.setData('text/plain', id);
    event.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  };

  const handleDragOver = (id: string) => (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDropTargetId(id);
  };

  const handleDrop = (id: string) => (event: React.DragEvent) => {
    event.preventDefault();
    const dragId = event.dataTransfer.getData('text/plain');
    if (dragId) {
      reorderSubtasks(dragId, id);
    }
    setDropTargetId(null);
    setDraggingId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTargetId(null);
  };

  const formatDate = (dateString: string) => {
    // Parsear la fecha manualmente para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day, 0, 0, 0, 0);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  };

  const formatHours = (hours: number) => {
    return `${hours}h`;
  };

  const handleFinalize = async () => {
    if (onFinalize) {
      setIsSubmitting(true);
      try {
        await onFinalize(subtasks);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="subtask-form-wrapper">
      <div className="task-summary-card">
        <div className="task-summary-left">
          <div className="task-summary-icon" aria-hidden="true">
            <ClipboardList size={24} />
          </div>
          <div>
            <span className="task-summary-label">Tarea principal</span>
            <span className="task-summary-title">{taskTitle}</span>
            {maxDate && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', display: 'block', marginTop: '4px' }}>
                Fecha de entrega: {formatDate(maxDate)}
              </span>
            )}
          </div>
        </div>
        <div className="task-summary-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span className="task-summary-label">Tiempo total:</span>
            <span className="task-summary-value">
              {(totalNeededHours + originalHours).toFixed(1)} horas
            </span>
          </div>
        </div>
      </div>

      <div className="subtask-form-container">
        <h2 className="subtask-form-title">Actividades de la Tarea</h2>
        <p className="subtask-form-subtitle">
          Divide tu tarea principal en pasos manejables. Asigna una fecha y el
          tiempo necesario a cada uno.
        </p>

        <div className="subtask-form-input-section">
          <div className="subtask-form-field">
            <label htmlFor="description">Descripción del paso a realizar</label>
            <input
              id="description"
              type="text"
              className={`subtask-form-input ${errors.description ? 'error' : ''}`}
              placeholder="Ej. Buscar 3 referencias bibliográficas en la biblioteca"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              maxLength={300}
            />
            <span className="subtask-form-char-count">
              {formData.description.length}/300 caracteres
            </span>
            {errors.description && (
              <span className="subtask-form-error">{errors.description}</span>
            )}
          </div>

          <div className="subtask-form-row">
            <div className="subtask-form-field">
              <label htmlFor="planification_date" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexDirection: 'row' }}>
                <span>¿Qué día planeas hacer esto?</span>
                {maxDate && (
                  <InfoTooltip content={`Limitado por la entrega de la tarea principal (${formatDate(maxDate)})`} />
                )}
              </label>
              <input
                id="planification_date"
                type="date"
                min={getTodayDateStr()}
                max={maxDate}
                className={`subtask-form-input ${errors.planification_date ? 'error' : ''}`}
                value={formData.planification_date}
                onChange={(e) =>
                  handleFieldChange('planification_date', e.target.value)
                }
              />
              {errors.planification_date && (
                <span className="subtask-form-error">
                  {errors.planification_date}
                </span>
              )}
            </div>

            <div className="subtask-form-field">
              <label htmlFor="needed_hours">Tiempo estimado (horas)</label>
              <input
                id="needed_hours"
                type="number"
                className={`subtask-form-input ${errors.needed_hours ? 'error' : ''}`}
                placeholder="0.0"
                min="0.1"
                step="0.1"
                value={formData.needed_hours || ''}
                onChange={(e) =>
                  handleFieldChange(
                    'needed_hours',
                    parseFloat(e.target.value) || 0,
                  )
                }
              />
              {errors.needed_hours && (
                <span className="subtask-form-error">
                  {errors.needed_hours}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="subtask-form-add-btn"
            onClick={handleAddSubtask}
          >
            Añadir esta actividad
          </button>
        </div>

        {subtasks.length > 0 && (
          <div className="subtask-form-list">
            {subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className={`subtask-form-item${
                  dropTargetId === subtask.id ? ' is-drop-target' : ''
                }${draggingId === subtask.id ? ' is-dragging' : ''}`}
                onDragOver={handleDragOver(subtask.id)}
                onDrop={handleDrop(subtask.id)}
              >
                <div className="subtask-form-item-left">
                  <button
                    type="button"
                    className="subtask-form-item-drag-handle"
                    aria-label="Reordenar subtarea"
                    draggable
                    onDragStart={handleDragStart(subtask.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <GripVertical size={16} aria-hidden="true" />
                  </button>
                  <p className="subtask-form-item-description">
                    {subtask.description}
                  </p>
                </div>
                <div className="subtask-form-item-right">
                  <div className="subtask-form-item-metadata">
                    <span className="subtask-form-item-date">
                      <Calendar size={16} aria-hidden="true" />
                      {formatDate(subtask.planification_date)}
                    </span>
                    <span className="subtask-form-item-hours">
                      <Clock size={16} aria-hidden="true" />
                      {formatHours(subtask.needed_hours)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="subtask-form-item-delete"
                    onClick={() => handleRemoveSubtask(subtask.id)}
                    aria-label="Eliminar subtarea"
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {subtasks.length > 0 && onFinalize && (
        <div className="subtask-form-actions">
          <button
            type="button"
            className="subtask-form-submit"
            onClick={handleFinalize}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Finalizar planificación'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SubtaskForm;
