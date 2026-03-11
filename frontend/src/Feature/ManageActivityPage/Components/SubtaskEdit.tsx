import React, { useEffect, useMemo, useState } from 'react';
import DatePickerModal from '../../ManageCalendarPage/Components/DatePickerModal';
import { useSubtaskEdit, type EditableSubtask } from '../Hooks/useSubtaskEdit';
import BackButton from '../../ManageCreatePage/Components/BackButton';
import { useAuth } from '../../../Context/AuthContext';
import apiClient from '../../../Services/ApiClient';
import '../Styles/SubtaskEdit.css';

import TaskInfoCard from './TaskInfoCard';
import TaskEditForm from './TaskEditForm';
import SubtaskList from './SubtaskList';
import DeleteConfirmModal from './DeleteConfirmModal';
import type { SubtaskFormData } from '../../ManageCreatePage/Types/subtask.types';
import { validateSubtaskForm, hasValidationErrors } from '../../ManageCreatePage/Utils/subtaskValidator';
import { useToast } from '../../../shared/Hooks/useToast';
import ToastHost from '../../../shared/Components/ToastHost';

interface SubtaskEditProps {
  taskId: number;
  initialSubtasks: EditableSubtask[];
  onSubtasksChange?: (subtasks: EditableSubtask[]) => void;
  onSaveIndividualSubtask?: (subtask: EditableSubtask) => Promise<void>;
  onCreateSubtask?: (data: SubtaskFormData) => Promise<void>;
  onDeleteSubtask?: (subtask: EditableSubtask) => Promise<void> | void;
  onTaskDeleted?: () => void;
  onClose?: () => void;
  onSaveTask?: (taskData: any) => Promise<void> | void;
  taskTitle?: string;
  taskDueDate?: string;
  totalHours?: number;
  task?: {
    id: number;
    title: string;
    description?: string;
    subject?: string;
    type?: string;
    priority?: string;
    due_date?: string;
  };
}

const SubtaskEdit: React.FC<SubtaskEditProps> = ({
  taskId,
  initialSubtasks,
  onSubtasksChange,
  onSaveIndividualSubtask,
  onCreateSubtask,
  onDeleteSubtask,
  onTaskDeleted,
  onClose,
  onSaveTask,
  taskTitle = 'Ensayo sobre la Revolución Francesa',
  taskDueDate,
  totalHours,
  task,
}) => {
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [conflictWarning, setConflictWarning] = useState(false);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [hourLimitError, setHourLimitError] = useState('');

  const { user } = useAuth();
  const dailyHours = user?.daily_hours ?? 8;
  const { toasts, dismiss, success: toastSuccess, error: toastError, loading: toastLoading, show: toastShow } = useToast();
  const [conflictToastId, setConflictToastId] = useState<number | null>(null);

  const [taskEditData, setTaskEditData] = useState({
    title: task?.title || taskTitle || '',
    description: task?.description || '',
    subject: task?.subject || '',
    type: task?.type || '',
    priority: task?.priority || 'medium',
    due_date: (task?.due_date || taskDueDate || '').split('T')[0],
  });

  const {
    subtasks,
    setSubtasks,
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
    confirmDelete: originalConfirmDelete,
  } = useSubtaskEdit({
    taskId,
    initialSubtasks,
    onSubtasksChange,
    onDeleteSubtask,
    onTaskDeleted,
    onClose,
  });

  const initialSubtasksStr = useMemo(
    () => JSON.stringify(initialSubtasks ?? []),
    [initialSubtasks],
  );

  useEffect(() => {
    const parsed = JSON.parse(initialSubtasksStr);
    setSubtasks(parsed);
    cancelEditing();
  }, [initialSubtasksStr, setSubtasks, cancelEditing]);

  const computedTotalHours = useMemo(() => {
    if (typeof totalHours === 'number') return totalHours;
    return subtasks.reduce((acc, item) => acc + (Number(item.needed_hours) || 0), 0);
  }, [subtasks, totalHours]);

  const checkAndSaveSubtask = async () => {
    // Validar antes de procesar
    const validationErrors = validateSubtaskForm(editData);
    if (hasValidationErrors(validationErrors) || hourLimitError) {
      toastError('Datos incompletos', 'Por favor, llena la descripción y el tiempo correctamente.');
      return;
    }
    if (taskEditData.due_date && editData.planification_date > taskEditData.due_date) {
      toastError('Fecha inválida', `La actividad no puede ser posterior a la entrega (${taskEditData.due_date})`);
      return;
    }
    setIsCheckingConflict(true);
    const loadId = toastLoading('Guardando actividad…', 'Verificando conflictos de horario');
    try {
      const date = editData.planification_date;
      let url = `/api/subtasks/?planification_date=${date}`;
      if (editingId !== null) url += `&exclude_ids=${editingId}`;
      const response = await apiClient.get<Array<{ needed_hours: number }>>(url);
      const backendHours = response.data.reduce((sum, st) => sum + (Number(st.needed_hours) || 0), 0);
      const newHours = Number(editData.needed_hours) || 0;
      const total = parseFloat((backendHours + newHours).toFixed(2));
      if (total > dailyHours) {
        dismiss(loadId);
        setConflictWarning(true);
        const id = toastShow({
          title: 'Límite excedido',
          subtitle: 'Has superado las horas disponibles para este día.',
          variant: 'warning',
          duration: 0, // Persistente
          showProgress: false,
          loading: false,
        });
        setConflictToastId(id);
        return;
      }
      if (conflictToastId) {
        dismiss(conflictToastId);
        setConflictToastId(null);
      }
      setConflictWarning(false);
      // Guardar en estado local
      saveEditedSubtask();
      // Persistir en BD si hay callback
      if (onSaveIndividualSubtask && editingId !== null) {
        const updatedSubtask = subtasks.find((st) => st.id === editingId);
        if (updatedSubtask) {
          await onSaveIndividualSubtask({
            ...updatedSubtask,
            description: editData.description,
            planification_date: editData.planification_date,
            needed_hours: Number(editData.needed_hours),
          });
        }
      }
      dismiss(loadId);
      toastSuccess('¡Cambios guardados!', 'La actividad se ha actualizado correctamente.');
    } catch {
      dismiss(loadId);
      toastError('Error al guardar', 'No se pudo actualizar la actividad.');
      saveEditedSubtask();
    } finally {
      setIsCheckingConflict(false);
    }
  };

  const handleTaskEditFieldChange = (field: string, value: string) => {
    setTaskEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancelEditing = () => {
    if (conflictToastId) {
      dismiss(conflictToastId);
      setConflictToastId(null);
    }
    cancelEditing();
  };

  const handleConfirmDelete = async () => {
    const isMainTask = deleteTarget?.type === 'main-task';
    const loadId = toastLoading(
      isMainTask ? 'Eliminando tarea…' : 'Eliminando actividad…',
      'Por favor espera'
    );
    try {
      await originalConfirmDelete();
      dismiss(loadId);
      toastSuccess(
        isMainTask ? '¡Tarea eliminada!' : '¡Actividad eliminada!',
        isMainTask ? 'La tarea se ha borrado correctamente.' : 'El paso se ha eliminado de la lista.'
      );
    } catch (error) {
      dismiss(loadId);
      toastError('Error al eliminar', 'No se pudo completar la operación.');
    }
  };

  const handleSaveTaskChanges = async () => {
    if (!onSaveTask) return;
    setIsSavingTask(true);
    const loadId = toastLoading('Guardando tarea…', 'Aplicando los cambios');
    try {
      let formattedDate = taskEditData.due_date;
      if (formattedDate && !formattedDate.includes('T')) {
        formattedDate = `${formattedDate}T23:59:59Z`;
      }
      await onSaveTask({ ...taskEditData, due_date: formattedDate });
      setIsEditingTask(false);
      dismiss(loadId);
      toastSuccess('¡Tarea guardada!', 'Los cambios se han aplicado correctamente.');
    } catch (error) {
      console.error('Error al guardar cambios de la tarea:', error);
      dismiss(loadId);
      toastError('Error al guardar', 'No se pudo actualizar la tarea.');
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleCancelTaskEdit = () => {
    setIsEditingTask(false);
    setTaskEditData({
      title: task?.title || taskTitle || '',
      description: task?.description || '',
      subject: task?.subject || '',
      type: task?.type || '',
      priority: task?.priority || 'medium',
      due_date: (task?.due_date || taskDueDate || '').split('T')[0],
    });
  };

  return (
    <div className="subtask-edit-wrapper">
      <BackButton
        onClick={isEditingTask ? handleCancelTaskEdit : onClose}
        label={isEditingTask ? 'Volver sin editar' : 'Volver a inicio'}
      />

      <div className="subtask-edit-container">
        {!isEditingTask ? (
          <>
            <TaskInfoCard
              title={taskEditData.title}
              description={taskEditData.description}
              subject={taskEditData.subject}
              type={taskEditData.type}
              priority={taskEditData.priority}
              due_date={taskEditData.due_date}
              computedTotalHours={computedTotalHours}
              onEdit={() => setIsEditingTask(true)}
              onDelete={openDeleteMainTaskModal}
            />

            <SubtaskList
              subtasks={subtasks}
              editingId={editingId}
              editData={editData}
              errors={{
                ...errors,
                needed_hours: hourLimitError || errors.needed_hours,
              }}
              conflictWarning={conflictWarning}
              isCheckingConflict={isCheckingConflict}
              maxHours={dailyHours}
              taskDueDate={taskEditData.due_date || undefined}
              onCreateSubtask={onCreateSubtask ?? (() => Promise.resolve())}
              onStartEditing={startEditing}
              onDeleteClick={openDeleteSubtaskModal}
              onFieldChange={handleEditFieldChange}
              onOpenDatePicker={() => setIsDatePickerOpen(true)}
              onCancelEditing={handleCancelEditing}
              onSaveSubtask={checkAndSaveSubtask}
              onResolveConflict={checkAndSaveSubtask}
              onHoursChange={(value) => {
                setConflictWarning(false);
                if (value <= 0 || isNaN(value)) {
                  setHourLimitError('El tiempo debe ser mayor que 0 horas.');
                } else if (value > dailyHours) {
                  setHourLimitError(
                    `No puedes asignar más de ${dailyHours}h en un día. Considera dividir esta actividad en varios días.`,
                  );
                } else {
                  setHourLimitError('');
                }
                handleEditFieldChange('needed_hours', value);
              }}
            />
          </>
        ) : (
          <TaskEditForm
            taskEditData={taskEditData}
            isSavingTask={isSavingTask}
            onFieldChange={handleTaskEditFieldChange}
            onSave={handleSaveTaskChanges}
            onCancel={handleCancelTaskEdit}
            hasSaveHandler={!!onSaveTask}
          />
        )}
      </div>

      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onConfirm={(date) => {
          setConflictWarning(false);
          handleEditFieldChange('planification_date', date);
          setIsDatePickerOpen(false);
        }}
        newSubtaskDescription={editData.description}
        newSubtaskHours={editData.needed_hours}
        maxDate={taskEditData.due_date || undefined}
        confirmLabel="Modificar aquí"
        excludeIds={editingId !== null ? [editingId] : []}
        originalDate={editData.planification_date || undefined}
      />

      {deleteTarget && (
        <DeleteConfirmModal
          type={deleteTarget.type}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={closeDeleteModal}
        />
      )}

      <ToastHost toasts={toasts} onDismiss={dismiss} />
    </div>
  );
};

export default SubtaskEdit;
