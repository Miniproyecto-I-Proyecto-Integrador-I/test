import React, { useEffect, useMemo, useState } from 'react';
import { CircleAlert } from 'lucide-react';
import DatePickerModal from '../../ManageCalendarPage/Components/DatePickerModal';
import type { LocalSubtask } from '../../ManageCalendarPage/Components/DatePickerModal';
import { useSubtaskEdit, type EditableSubtask } from '../Hooks/useSubtaskEdit';
import BackButton from '../../ManageCreatePage/Components/BackButton';
import { useAuth } from '../../../Context/AuthContext';
import apiClient from '../../../Services/ApiClient';
import '../Styles/SubtaskEdit.css';

import TaskInfoCard from './TaskInfoCard';
import TaskEditForm from './TaskEditForm';
import SubtaskList from './SubtaskList';
import DeleteConfirmModal from './DeleteConfirmModal';

interface SubtaskEditProps {
  taskId: number;
  initialSubtasks: EditableSubtask[];
  onSubtasksChange?: (subtasks: EditableSubtask[]) => void;
  onSaveChanges?: (subtasks: EditableSubtask[]) => Promise<void> | void;
  onDeleteSubtask?: (subtask: EditableSubtask) => Promise<void> | void;
  onTaskDeleted?: () => void;
  onClose?: () => void;
  onAddNewSubtask?: () => void;
  onSaveTask?: (taskData: any) => Promise<void> | void;
  persistedSubtasks?: EditableSubtask[];
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
  onSaveChanges,
  onDeleteSubtask,
  onTaskDeleted,
  onClose,
  onAddNewSubtask,
  onSaveTask,
  persistedSubtasks,
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

  const { user } = useAuth();
  const dailyHours = user?.daily_hours ?? 8;

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
    editingId,
    editData,
    errors,
    isSaving,
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
    handleSaveChanges,
    setSubtasks,
  } = useSubtaskEdit({
    taskId,
    initialSubtasks,
    onSubtasksChange,
    onSaveChanges,
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

  const hasUnsavedChanges = useMemo(() => {
    const base = persistedSubtasks ?? initialSubtasks ?? [];
    const normalize = (items: EditableSubtask[]) =>
      items.map((item) => ({
        id: item.id,
        description: (item.description ?? '').trim(),
        planification_date: (item.planification_date ?? '').split('T')[0],
        needed_hours: Number(item.needed_hours) || 0,
      }));
    return JSON.stringify(normalize(subtasks)) !== JSON.stringify(normalize(base));
  }, [initialSubtasks, persistedSubtasks, subtasks]);

  const locallyModifiedSubtasks = useMemo((): LocalSubtask[] => {
    const base = persistedSubtasks ?? initialSubtasks ?? [];
    const baseMap = new Map(
      base.map((st) => [
        st.id,
        {
          planification_date: (st.planification_date ?? '').split('T')[0],
          needed_hours: Number(st.needed_hours) || 0,
        },
      ]),
    );
    return subtasks
      .filter((st) => st.id !== editingId)
      .filter((st) => {
        const orig = baseMap.get(st.id);
        if (!orig) return false;
        const dateChanged = (st.planification_date ?? '').split('T')[0] !== orig.planification_date;
        const hoursChanged = (Number(st.needed_hours) || 0) !== orig.needed_hours;
        return dateChanged || hoursChanged;
      })
      .map((st) => ({
        id: st.id,
        description: st.description,
        planification_date: (st.planification_date ?? '').split('T')[0],
        needed_hours: Number(st.needed_hours) || 0,
      }));
  }, [subtasks, editingId, persistedSubtasks, initialSubtasks]);

  const checkAndSaveSubtask = async () => {
    if (taskEditData.due_date && editData.planification_date > taskEditData.due_date) {
      alert(
        `La fecha de la actividad no puede ser posterior a la fecha de entrega de la tarea (${taskEditData.due_date}).\nPor favor, selecciona una fecha anterior o igual.`,
      );
      return;
    }
    setIsCheckingConflict(true);
    try {
      const date = editData.planification_date;
      let url = `/api/subtasks/?planification_date=${date}`;
      if (editingId !== null) url += `&exclude_ids=${editingId}`;
      const response = await apiClient.get<Array<{ needed_hours: number }>>(url);
      const subtasksForDay = response.data;
      const localForDay = locallyModifiedSubtasks.filter((st) => st.planification_date === date);
      const backendHours = subtasksForDay.reduce((sum, st) => sum + (Number(st.needed_hours) || 0), 0);
      const localHours = localForDay.reduce((sum, st) => sum + st.needed_hours, 0);
      const newHours = Number(editData.needed_hours) || 0;
      const total = parseFloat((backendHours + localHours + newHours).toFixed(2));
      if (total > dailyHours) {
        setConflictWarning(true);
        return;
      }
      setConflictWarning(false);
      saveEditedSubtask();
    } catch {
      saveEditedSubtask();
    } finally {
      setIsCheckingConflict(false);
    }
  };

  const handleTaskEditFieldChange = (field: string, value: string) => {
    setTaskEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveTaskChanges = async () => {
    if (!onSaveTask) return;
    setIsSavingTask(true);
    try {
      let formattedDate = taskEditData.due_date;
      if (formattedDate && !formattedDate.includes('T')) {
        formattedDate = `${formattedDate}T23:59:59Z`;
      }
      await onSaveTask({ ...taskEditData, due_date: formattedDate });
      setIsEditingTask(false);
    } catch (error) {
      console.error('Error al guardar cambios de la tarea:', error);
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
      {hasUnsavedChanges && (
        <div className="subtask-edit-unsaved-toast" role="status" aria-live="polite">
          <CircleAlert size={18} />
          <span>Tienes cambios sin guardar</span>
        </div>
      )}

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
              errors={errors}
              conflictWarning={conflictWarning}
              isCheckingConflict={isCheckingConflict}
              isSaving={isSaving}
              hasSaveChangesHandler={!!onSaveChanges}
              onAddNewSubtask={onAddNewSubtask}
              onStartEditing={startEditing}
              onDeleteClick={openDeleteSubtaskModal}
              onFieldChange={handleEditFieldChange}
              onOpenDatePicker={() => setIsDatePickerOpen(true)}
              onCancelEditing={() => {
                setConflictWarning(false);
                cancelEditing();
              }}
              onSaveSubtask={checkAndSaveSubtask}
              onResolveConflict={() => {
                setConflictWarning(false);
                setIsDatePickerOpen(true);
              }}
              onHoursChange={(value) => {
                setConflictWarning(false);
                handleEditFieldChange('needed_hours', value);
              }}
              onSaveChanges={handleSaveChanges}
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
        excludeIds={[
          ...(editingId !== null ? [editingId] : []),
          ...locallyModifiedSubtasks.map((st) => st.id),
        ]}
        originalDate={editData.planification_date || undefined}
        localSubtasks={locallyModifiedSubtasks}
      />

      {deleteTarget && (
        <DeleteConfirmModal
          type={deleteTarget.type}
          isDeleting={isDeleting}
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
        />
      )}
    </div>
  );
};

export default SubtaskEdit;
