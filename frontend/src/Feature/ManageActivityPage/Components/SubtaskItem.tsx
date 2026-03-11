import React from 'react';
import {
  Edit2,
  Trash2,
  Calendar,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import type { EditableSubtask } from '../Hooks/useSubtaskEdit';
import type { SubtaskFormData } from '../../ManageCreatePage/Types/subtask.types';
import { formatShortDate, formatHours } from '../Utils/subtaskEditUtils';

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
  onStartEditing: (subtask: EditableSubtask) => void;
  onDeleteClick: (subtask: EditableSubtask) => void;
  onFieldChange: (field: keyof SubtaskFormData, value: string | number) => void;
  onOpenDatePicker: () => void;
  onCancel: () => void;
  onSave: () => void;
  onResolveConflict: () => void;
  onHoursChange: (value: number) => void;
}

const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  isEditing,
  editData,
  errors,
  conflictWarning,
  isCheckingConflict,
  onStartEditing,
  onDeleteClick,
  onFieldChange,
  onOpenDatePicker,
  onCancel,
  onSave,
  onResolveConflict,
  onHoursChange,
}) => (
  <div className={`subtask-edit-item ${isEditing ? 'is-editing' : ''}`}>
    {!isEditing ? (
      <>
        <div className="subtask-edit-item-left">
          <span className="subtask-edit-item-circle" aria-hidden="true" />
          <div className="subtask-edit-item-content">
            <p className="subtask-edit-item-title">{subtask.description}</p>
            <p className="subtask-edit-item-meta">
              Fecha: {formatShortDate(subtask.planification_date)}{' '}
              • {formatHours(subtask.needed_hours)}
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
        {conflictWarning && (
          <div className="subtask-edit-conflict-warning">
            <AlertTriangle size={14} />
            <span>
              Conflicto de horas: este día supera tu límite diario
            </span>
          </div>
        )}

        <div className="subtask-edit-input-group grow">
          <label>Descripción</label>
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

        <div className="subtask-edit-input-group">
          <label>Fecha</label>
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

        <div className="subtask-edit-input-group small">
          <label>Horas</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={editData.needed_hours || ''}
            onChange={(e) => onHoursChange(parseFloat(e.target.value) || 0)}
            className={errors.needed_hours ? 'error' : ''}
          />
          {errors.needed_hours && (
            <span className="subtask-edit-error">{errors.needed_hours}</span>
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
              disabled={isCheckingConflict}
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

export default SubtaskItem;
