import React from 'react';
import { FileText, Plus } from 'lucide-react';
import type { EditableSubtask } from '../Hooks/useSubtaskEdit';
import type { SubtaskFormData } from '../../ManageCreatePage/Types/subtask.types';
import SubtaskItem from './SubtaskItem';

interface SubtaskItemEditData {
  description: string;
  planification_date: string;
  needed_hours: number | string;
}

interface SubtaskItemErrors {
  description?: string;
  planification_date?: string;
  needed_hours?: string;
}

interface SubtaskListProps {
  subtasks: EditableSubtask[];
  editingId: string | number | null;
  editData: SubtaskItemEditData;
  errors: SubtaskItemErrors;
  conflictWarning: boolean;
  isCheckingConflict: boolean;
  isSaving: boolean;
  hasSaveChangesHandler: boolean;
  onAddNewSubtask?: () => void;
  onStartEditing: (subtask: EditableSubtask) => void;
  onDeleteClick: (subtask: EditableSubtask) => void;
  onFieldChange: (field: keyof SubtaskFormData, value: string | number) => void;
  onOpenDatePicker: () => void;
  onCancelEditing: () => void;
  onSaveSubtask: () => void;
  onResolveConflict: () => void;
  onHoursChange: (value: number) => void;
  onSaveChanges: () => void;
}

const SubtaskList: React.FC<SubtaskListProps> = ({
  subtasks,
  editingId,
  editData,
  errors,
  conflictWarning,
  isCheckingConflict,
  isSaving,
  hasSaveChangesHandler,
  onAddNewSubtask,
  onStartEditing,
  onDeleteClick,
  onFieldChange,
  onOpenDatePicker,
  onCancelEditing,
  onSaveSubtask,
  onResolveConflict,
  onHoursChange,
  onSaveChanges,
}) => (
  <div className="subtask-edit-subtasks-card">
    <section className="subtask-edit-list-section">
      <h3 className="subtask-edit-section-title">Actividades de la tarea</h3>

      <div className="subtask-edit-list">
        {subtasks.length === 0 ? (
          <div className="subtask-edit-empty-state">
            <FileText
              size={56}
              className="subtask-edit-empty-icon"
              strokeWidth={1.5}
            />
            <p className="subtask-edit-empty-text">No hay subtareas creadas</p>
            <p className="subtask-edit-empty-hint">
              Agrega un nuevo paso para comenzar a organizar tu tarea
            </p>
          </div>
        ) : (
          subtasks.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              isEditing={editingId === subtask.id}
              editData={editData}
              errors={errors}
              conflictWarning={conflictWarning}
              isCheckingConflict={isCheckingConflict}
              onStartEditing={onStartEditing}
              onDeleteClick={onDeleteClick}
              onFieldChange={onFieldChange}
              onOpenDatePicker={onOpenDatePicker}
              onCancel={onCancelEditing}
              onSave={onSaveSubtask}
              onResolveConflict={onResolveConflict}
              onHoursChange={onHoursChange}
            />
          ))
        )}
      </div>
    </section>

    {onAddNewSubtask && (
      <div className="subtask-edit-add-actions">
        <button
          type="button"
          className="subtask-edit-add-footer"
          onClick={onAddNewSubtask}
        >
          <Plus size={16} />
          Agregar pasos
        </button>
      </div>
    )}

    <footer className="subtask-edit-footer">
      <button
        type="button"
        className="subtask-edit-save"
        onClick={onSaveChanges}
        disabled={isSaving || !hasSaveChangesHandler}
      >
        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </footer>
  </div>
);

export default SubtaskList;
