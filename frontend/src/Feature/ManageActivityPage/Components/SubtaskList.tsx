import React, { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import type { EditableSubtask } from '../Hooks/useSubtaskEdit';
import type { SubtaskFormData } from '../../ManageCreatePage/Types/subtask.types';
import SubtaskItem from './SubtaskItem';
import NewSubtaskInlineForm from './NewSubtaskInlineForm';
import { useToast } from '../../../shared/Hooks/useToast';
import ToastHost from '../../../shared/Components/ToastHost';

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
  taskTitle?: string;
  errors: SubtaskItemErrors;
  conflictWarning: boolean;
  isCheckingConflict: boolean;
  maxHours: number;
  taskDueDate?: string;
  onCreateSubtask: (data: SubtaskFormData) => Promise<void>;
  onStartEditing: (subtask: EditableSubtask) => void;
  onDeleteClick: (subtask: EditableSubtask) => void;
  onFieldChange: (field: keyof SubtaskFormData, value: string | number) => void;
  onOpenDatePicker: () => void;
  onCancelEditing: () => void;
  onSaveSubtask: () => void;
  onResolveConflict: () => void;
  onResolveConflictNew: (data: SubtaskFormData) => void;
  onHoursChange: (value: number) => void;
}

const SubtaskList: React.FC<SubtaskListProps> = ({
  subtasks,
  editingId,
  editData,
  taskTitle,
  errors,
  conflictWarning,
  isCheckingConflict,
  maxHours,
  taskDueDate,
  onCreateSubtask,
  onStartEditing,
  onDeleteClick,
  onFieldChange,
  onOpenDatePicker,
  onCancelEditing,
  onSaveSubtask,
  onResolveConflict,
  onResolveConflictNew,
  onHoursChange,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const {
    toasts,
    dismiss,
    loading: toastLoading,
    success: toastSuccess,
    error: toastError,
  } = useToast();

  const handleSaveNew = async (data: SubtaskFormData) => {
    const loadId = toastLoading(
      'Creando actividad…',
      'Guardando en la base de datos',
    );
    try {
      await onCreateSubtask(data);
      dismiss(loadId);
      toastSuccess(
        '¡Actividad creada!',
        'El nuevo paso se ha agregado correctamente.',
      );
      setIsAddingNew(false);
    } catch {
      dismiss(loadId);
      toastError('Error al crear', 'No se pudo guardar la nueva actividad.');
    }
  };

  return (
    <div className="subtask-edit-subtasks-card">
      <section className="subtask-edit-list-section">
        <h3 className="subtask-edit-section-title">Actividades de la tarea</h3>

        <div className="subtask-edit-list">
          {subtasks.length === 0 && !isAddingNew ? (
            <div className="subtask-edit-empty-state">
              <FileText
                size={56}
                className="subtask-edit-empty-icon"
                strokeWidth={1.5}
              />
              <p className="subtask-edit-empty-text">
                Aún no tienes subtareas...
              </p>
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
                maxHours={maxHours}
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

          {/* Formulario inline — al final de la lista con animación pop */}
          {isAddingNew && (
            <NewSubtaskInlineForm
              taskTitle={taskTitle}
              taskDueDate={taskDueDate}
              maxHours={maxHours}
              onSave={handleSaveNew}
              onCancel={() => setIsAddingNew(false)}
              onResolveConflict={onResolveConflictNew}
            />
          )}
        </div>
      </section>

      {!isAddingNew && (
        <div className="subtask-edit-add-actions">
          <button
            type="button"
            className="subtask-edit-add-footer"
            onClick={() => setIsAddingNew(true)}
          >
            <Plus size={16} />
            Agregar actividad
          </button>
        </div>
      )}

      <ToastHost toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};

export default SubtaskList;
