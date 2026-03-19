import React from 'react';
import { Edit2, Trash2, Calendar, X, Check } from 'lucide-react';
import type { EditableSubtask } from '../Hooks/useSubtaskEdit';
import type { SubtaskFormData } from '../../ManageCreatePage/Types/subtask.types';
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
}) => {
  const isCompleted = subtask.status === 'completed';
  const isOverdue =
    isDateBeforeToday(subtask.planification_date) && !isCompleted && !subtask.is_completed;

  return (
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
              title={isCompleted ? "Marcar como pendiente" : "Marcar como completada"}
              aria-label={isCompleted ? "Marcar como pendiente" : "Marcar como completada"}
            >
              {isCompleted ? (
                <Check size={12} strokeWidth={3} />
              ) : (
                <Check size={12} strokeWidth={3} className="hover-check" />
              )}
            </button>

            <div className="subtask-edit-item-content">
              <div className="subtask-edit-item-title-row">
                <p className="subtask-edit-item-title" style={{ textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? '#9ca3af' : 'inherit' }}>
                  {subtask.description}
                </p>
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
              <Edit2 size={16} />
            </button>
            <button
              type="button"
              className="subtask-edit-icon-btn danger"
              onClick={() => onDeleteClick(subtask)}
              aria-label="Eliminar subtarea"
            >
              <Trash2 size={16} />
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
            <label>Descripción de actividad</label>
            <input
              type="text"
              value={editData.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
              className={errors.description ? 'error' : ''}
              maxLength={300}
            />
            {errors.description && (
              <span className="subtask-edit-error">{errors.description}</span>
            )}
          </div>

          <div className="subtask-edit-input-group small">
            <label>Tiempo a invertir</label>
            <input
              type="number"
              min="1"
              max={maxHours}
              step="1"
              value={editData.needed_hours || ''}
              onChange={(e) => onHoursChange(parseFloat(e.target.value) || 0)}
              className={errors.needed_hours ? 'error' : ''}
            />
            {errors.needed_hours && (
              <span className="subtask-edit-error">{errors.needed_hours}</span>
            )}
          </div>

          <div className="subtask-edit-input-group">
            <label>Día de realización</label>
            <button
              type="button"
              className={`subtask-edit-date-btn${errors.planification_date ? ' error' : ''}`}
              onClick={onOpenDatePicker}
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
              <X size={14} />
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
                {isCheckingConflict ? '…' : <Check size={14} />}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubtaskItem;
