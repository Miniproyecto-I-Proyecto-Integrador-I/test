import { useState, useCallback } from 'react';
import type { SubtaskFormData, ValidationErrors } from '../../ManageCreatePage/Types/subtask.types';
import { hasValidationErrors, validateSubtaskForm } from '../../ManageCreatePage/Utils/subtaskValidator';
import { deleteTask } from '../../ManageCreatePage/Services/subtaskService';

// Re-defining interface here for use throughout the local hooks, or imports from types.
export interface EditableSubtask {
  id: string | number;
  description: string;
  planification_date: string;
  needed_hours: number;
  status?: string;
  is_completed?: boolean;
}

export type DeleteTarget = { type: 'main-task' } | { type: 'subtask'; subtask: EditableSubtask };

interface UseSubtaskEditProps {
  initialSubtasks: EditableSubtask[];
  onSubtasksChange?: (subtasks: EditableSubtask[]) => void;
  onDeleteSubtask?: (subtask: EditableSubtask) => Promise<void> | void;
  onTaskDeleted?: () => void;
  onClose?: () => void;
  taskId: number;
}

export function useSubtaskEdit({
  initialSubtasks,
  onSubtasksChange,
  onDeleteSubtask,
  onTaskDeleted,
  onClose,
  taskId,
}: UseSubtaskEditProps) {
  const [subtasks, setSubtasks] = useState<EditableSubtask[]>(initialSubtasks ?? []);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editData, setEditData] = useState<SubtaskFormData>({
    description: '',
    planification_date: '',
    needed_hours: 0,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync back to parent if subtasks change
  const reportChange = useCallback(
    (newSubtasks: EditableSubtask[]) => {
      setSubtasks(newSubtasks);
      if (onSubtasksChange) {
        onSubtasksChange(newSubtasks);
      }
    },
    [onSubtasksChange]
  );

  const startEditing = useCallback((subtask: EditableSubtask) => {
    setEditingId(subtask.id);
    setEditData({
      description: subtask.description,
      planification_date: subtask.planification_date,
      needed_hours: subtask.needed_hours,
    });
    setErrors({});
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setErrors({});
    setEditData({
      description: '',
      planification_date: '',
      needed_hours: 0,
    });
  }, []);

  const handleEditFieldChange = useCallback((field: keyof SubtaskFormData, value: string | number) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (prev[field]) {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      }
      return prev;
    });
  }, []);

  const saveEditedSubtask = useCallback(() => {
    if (editingId === null) return;

    const validationErrors = validateSubtaskForm(editData);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    const newSubtasks = subtasks.map((item) =>
      item.id === editingId
        ? {
            ...item,
            description: editData.description.trim(),
            planification_date: editData.planification_date,
            needed_hours: Number(editData.needed_hours),
          }
        : item
    );
    reportChange(newSubtasks);
    cancelEditing();
  }, [editingId, editData, subtasks, reportChange, cancelEditing]);

  const openDeleteSubtaskModal = useCallback((subtask: EditableSubtask) => {
    setDeleteTarget({ type: 'subtask', subtask });
  }, []);

  const openDeleteMainTaskModal = useCallback(() => {
    setDeleteTarget({ type: 'main-task' });
  }, []);

  const closeDeleteModal = useCallback(() => {
    if (isDeleting) return;
    setDeleteTarget(null);
  }, [isDeleting]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'main-task') {
        await deleteTask(taskId);
        if (onTaskDeleted) onTaskDeleted();
        if (onClose) onClose();
      } else {
        if (onDeleteSubtask) {
          await onDeleteSubtask(deleteTarget.subtask);
        }
        const newSubtasks = subtasks.filter((item) => item.id !== deleteTarget.subtask.id);
        reportChange(newSubtasks);
        if (editingId === deleteTarget.subtask.id) {
          cancelEditing();
        }
      }
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, taskId, onTaskDeleted, onClose, onDeleteSubtask, subtasks, reportChange, editingId, cancelEditing]);

  return {
    subtasks,
    setSubtasks: reportChange,
    editingId,
    editData,
    errors,
    isDeleting,
    deleteTarget,
    startEditing,
    cancelEditing,
    handleEditFieldChange,
    saveEditedSubtask,
    openDeleteSubtaskModal,
    openDeleteMainTaskModal,
    closeDeleteModal,
    confirmDelete,
  };
}
