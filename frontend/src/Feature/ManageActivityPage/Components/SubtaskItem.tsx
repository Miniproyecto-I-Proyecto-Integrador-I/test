import React, { useEffect, useRef, useState } from 'react';
import { Edit2, Trash2, Calendar, X, Check, StickyNote } from 'lucide-react';
import type { EditableSubtask } from '../Hooks/useSubtaskEdit';
import type { SubtaskFormData } from '../../ManageCreatePage/Types/subtask.types';
import type { Subtask } from '../../ManageTodayPage/Types/models';
import PostponeModal from '../../ManageTodayPage/Components/PostponeModal';
import {
  formatShortDate,
  formatHours,
  isDateBeforeToday,
} from '../Utils/subtaskEditUtils';

interface SubtaskItemErrors {
  description?: string;
  planification_date?: string;
  needed_hours?: string;
}

interface SubtaskItemEditData {
  description: string;
  planification_date: string;
  needed_hours: number | string;
}

interface SubtaskItemProps {
  subtask: EditableSubtask;
  isEditing: boolean;
  editData: SubtaskItemEditData;
  errors: SubtaskItemErrors;
  conflictWarning: boolean;
  isCheckingConflict: boolean;
  maxHours: number;
  onStartEditing: (subtask: EditableSubtask) => void;
  onDeleteClick: (subtask: EditableSubtask) => void;
  onFieldChange: (field: keyof SubtaskFormData, value: string | number) => void;
  onOpenDatePicker: () => void;
  onCancel: () => void;
  onSave: () => void;
  onResolveConflict: () => void;
  onHoursChange: (value: number) => void;
  onToggleComplete?: () => void;
  taskDueDate?: string;
}

const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  isEditing,
  editData,
  errors,
  conflictWarning,
  isCheckingConflict,
  maxHours,
  onStartEditing,
  onDeleteClick,
  onFieldChange,
  onOpenDatePicker,
  onCancel,
  onSave,
  onResolveConflict,
  onHoursChange,
  onToggleComplete,
  taskDueDate,
}) => {
  const [isReadNoteModalOpen, setIsReadNoteModalOpen] = useState(false);
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const isCompleted = subtask.status === 'completed';
  const isPostponed = subtask.status === 'postponed';
  const hasNote = Boolean(subtask.note && subtask.note.trim() !== '');
  const noteText = subtask.note?.trim() || '';
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const subtaskDate = new Date(subtask.planification_date + 'T00:00:00');
  const isUpcoming = !isPostponed && !isCompleted && subtaskDate > todayDate;
  const modalSubtask: Subtask = {
    id: Number(subtask.id) || 0,
    description: subtask.description,
    status: subtask.status || (subtask.is_completed ? 'completed' : 'pending'),
    planification_date: subtask.planification_date,
    needed_hours: Number(subtask.needed_hours) || 0,
    note: subtask.note ?? null,
  };
  const isOverdue =
    isDateBeforeToday(subtask.planification_date) &&
    !isCompleted &&
    !subtask.is_completed &&
    !isPostponed;
  const noteToneClass = isPostponed
    ? 'subtask-edit-note-btn--postponed'
    : isOverdue
      ? 'subtask-edit-note-btn--overdue'
      : isUpcoming
        ? 'subtask-edit-note-btn--upcoming'
        : 'subtask-edit-note-btn--today';

  const handleOpenReadNoteModal = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    if (!hasNote) {
      return;
    }
    setIsReadNoteModalOpen(true);
  };

  useEffect(() => {
    if (isEditing) {
      descriptionInputRef.current?.focus();
    }
  }, [isEditing]);

  return (
    <>
      <div
        className={`subtask-edit-item ${isEditing ? 'is-editing' : ''} ${conflictWarning ? 'has-conflict' : ''}`}
      >
        {!isEditing ? (
          <>
            <div className="subtask-edit-item-left">
              <button
                type="button"
                className={`subtask-edit-item-circle ${isCompleted ? 'completed' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete?.();
                }}
                title={
                  isCompleted
                    ? 'Marcar como pendiente'
                    : 'Marcar como completada'
                }
                aria-label={
                  isCompleted
                    ? 'Marcar como pendiente'
                    : 'Marcar como completada'
                }
              >
                {isCompleted ? (
                  <Check size={12} strokeWidth={3} aria-hidden="true" />
                ) : (
                  <Check
                    size={12}
                    strokeWidth={3}
                    className="hover-check"
                    aria-hidden="true"
                  />
                )}
              </button>

              <div className="subtask-edit-item-content">
                <div className="subtask-edit-item-title-row">
                  <p
                    className="subtask-edit-item-title"
                    style={{
                      textDecoration: isCompleted ? 'line-through' : 'none',
                      color: isCompleted ? '#9ca3af' : 'inherit',
                    }}
                  >
                    {subtask.description}
                  </p>
                  {hasNote && (
                    <button
                      type="button"
                      className={`subtask-edit-note-btn ${noteToneClass}`}
                      onClick={handleOpenReadNoteModal}
                      title={noteText}
                      aria-label="Ver nota de subtarea"
                    >
                      <StickyNote size={14} aria-hidden="true" />
                    </button>
                  )}
                  {isPostponed && (
                    <span className="subtask-edit-postponed-badge">
                      Pospuesta
                    </span>
                  )}
                  {isOverdue && (
                    <span className="subtask-edit-overdue-badge">Vencida</span>
                  )}
                </div>
                <p className="subtask-edit-item-meta">
                  Fecha: {formatShortDate(subtask.planification_date)} •{' '}
                  {formatHours(subtask.needed_hours)}
                </p>
              </div>
            </div>
            <div className="subtask-edit-item-actions">
              <button
                type="button"
                className="subtask-edit-icon-btn"
                onClick={() => onStartEditing(subtask)}
                aria-label="Editar subtarea"
              >
                <Edit2 size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="subtask-edit-icon-btn danger"
                onClick={() => onDeleteClick(subtask)}
                aria-label="Eliminar subtarea"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </>
        ) : (
          <div
            className="subtask-edit-inline-form"
            role="group"
            aria-label="Editar subtarea"
          >
            {/* Banner de conflicto eliminado según solicitud - ahora se usa Toast persistente */}

            <div className="subtask-edit-input-group grow">
              <label htmlFor={`subtask-edit-description-${subtask.id}`}>
                Descripción de actividad
              </label>
              <input
                ref={descriptionInputRef}
                id={`subtask-edit-description-${subtask.id}`}
                type="text"
                value={editData.description}
                onChange={(e) => onFieldChange('description', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSave()}
                className={errors.description ? 'error' : ''}
                maxLength={300}
              />
              {errors.description && (
                <span className="subtask-edit-error">{errors.description}</span>
              )}
            </div>

            <div className="subtask-edit-input-group small">
              <label htmlFor={`subtask-edit-hours-${subtask.id}`}>
                Tiempo (horas)
              </label>
              <div className="subtask-edit-input-wrapper">
                <input
                  id={`subtask-edit-hours-${subtask.id}`}
                  type="number"
                  min="0.1"
                  max={maxHours}
                  step="0.5"
                  value={editData.needed_hours || ''}
                  onChange={(e) => onHoursChange(parseFloat(e.target.value) || 0)}
                  onKeyDown={(e) => e.key === 'Enter' && onSave()}
                  className={errors.needed_hours ? 'error' : ''}
                />
                <span className="subtask-edit-input-suffix">hs</span>
              </div>
              {errors.needed_hours && (
                <span className="subtask-edit-error">
                  {errors.needed_hours}
                </span>
              )}
            </div>

            <div className="subtask-edit-input-group">
              <label htmlFor={`subtask-edit-date-${subtask.id}`}>
                Día de realización
              </label>
              <button
                type="button"
                className={`subtask-edit-date-btn${errors.planification_date ? ' error' : ''}${isDateBeforeToday(taskDueDate) ? ' disabled' : ''}`}
                onClick={isDateBeforeToday(taskDueDate) ? undefined : onOpenDatePicker}
                id={`subtask-edit-date-${subtask.id}`}
                disabled={isDateBeforeToday(taskDueDate)}
                title={isDateBeforeToday(taskDueDate) ? "Primero debes actualizar la fecha de la tarea" : ""}
              >
                <Calendar size={14} aria-hidden="true" />
                {editData.planification_date
                  ? formatShortDate(editData.planification_date)
                  : 'Elegir fecha'}
              </button>
              {errors.planification_date && (
                <span className="subtask-edit-error">
                  {errors.planification_date}
                </span>
              )}
            </div>

            <div className="subtask-edit-inline-actions">
              <button
                type="button"
                className="subtask-edit-round-btn"
                onClick={onCancel}
                aria-label="Cancelar edición"
              >
                <X size={14} aria-hidden="true" />
              </button>
              {conflictWarning ? (
                <button
                  type="button"
                  className="subtask-edit-round-btn conflict"
                  onClick={onResolveConflict}
                  aria-label="Resolver conflicto"
                >
                  Resolver conflicto
                </button>
              ) : (
                <button
                  type="button"
                  className="subtask-edit-round-btn success"
                  onClick={onSave}
                  disabled={isCheckingConflict || !!errors.needed_hours}
                  aria-label="Guardar edición"
                >
                  {isCheckingConflict ? (
                    '…'
                  ) : (
                    <Check size={14} aria-hidden="true" />
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <PostponeModal
        isOpen={isReadNoteModalOpen}
        mode="read"
        subtask={modalSubtask}
        noteValue={noteText}
        onClose={() => setIsReadNoteModalOpen(false)}
      />
    </>
  );
};

export default SubtaskItem;
