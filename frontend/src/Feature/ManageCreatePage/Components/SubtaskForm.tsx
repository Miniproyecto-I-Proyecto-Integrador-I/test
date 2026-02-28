import React, { useEffect, useState } from 'react';
import { useSubtaskForm } from '../Hooks/useSubtaskForm';
import type { SubtaskItem } from '../Types/subtask.types';
import '../Styles/SubtaskForm.css';

interface SubtaskFormProps {
  onSubtasksChange?: (subtasks: any[]) => void;
  taskTitle?: string;
  initialSubtasks?: SubtaskItem[];
  onFinalize?: (subtasks: any[]) => Promise<void>;
  onBack?: () => void;
}

const SubtaskForm: React.FC<SubtaskFormProps> = ({
  onSubtasksChange,
  taskTitle = 'Ensayo sobre la Revolucion Francesa',
  initialSubtasks = [],
  onFinalize,
  onBack,
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

  useEffect(() => {
    if (onSubtasksChange) {
      onSubtasksChange(subtasks);
    }
  }, [subtasks, onSubtasksChange]);

  const handleAddSubtask = () => {
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
      {onBack && (
        <button
          type="button"
          className="subtask-form-back-btn"
          onClick={onBack}
          aria-label="Volver"
        >
          ← Volver
        </button>
      )}
      <div className="task-summary-card">
        <div className="task-summary-left">
          <div className="task-summary-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
              <path d="M14 3v5h5" />
            </svg>
          </div>
          <div>
            <span className="task-summary-label">Tarea principal</span>
            <span className="task-summary-title">{taskTitle}</span>
          </div>
        </div>
        <div className="task-summary-right">
          <span className="task-summary-label">Tiempo total</span>
          <span className="task-summary-value">
            {totalNeededHours.toFixed(1)} horas
          </span>
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
              <label htmlFor="planification_date">
                ¿Qué día planeas hacer esto?
              </label>
              <input
                id="planification_date"
                type="date"
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
            Añadir este paso
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
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <circle cx="5" cy="4" r="1.2" />
                      <circle cx="11" cy="4" r="1.2" />
                      <circle cx="5" cy="8" r="1.2" />
                      <circle cx="11" cy="8" r="1.2" />
                      <circle cx="5" cy="12" r="1.2" />
                      <circle cx="11" cy="12" r="1.2" />
                    </svg>
                  </button>
                  <p className="subtask-form-item-description">
                    {subtask.description}
                  </p>
                </div>
                <div className="subtask-form-item-right">
                  <div className="subtask-form-item-metadata">
                    <span className="subtask-form-item-date">
                      <svg viewBox="0 0 20 20" aria-hidden="true">
                        <rect x="3" y="5" width="14" height="12" rx="2" />
                        <path d="M3 8h14" />
                        <path d="M7 3v4M13 3v4" />
                      </svg>
                      {formatDate(subtask.planification_date)}
                    </span>
                    <span className="subtask-form-item-hours">
                      <svg viewBox="0 0 20 20" aria-hidden="true">
                        <circle cx="10" cy="10" r="7" />
                        <path d="M10 6v4l3 2" />
                      </svg>
                      {formatHours(subtask.needed_hours)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="subtask-form-item-delete"
                    onClick={() => handleRemoveSubtask(subtask.id)}
                    aria-label="Eliminar subtarea"
                  >
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M4 6h12" />
                      <path d="M7 6v9M10 6v9M13 6v9" />
                      <path d="M7 6l1-2h4l1 2" />
                      <rect x="5" y="6" width="10" height="11" rx="1.5" />
                    </svg>
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
