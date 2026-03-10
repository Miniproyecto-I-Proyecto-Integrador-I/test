import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SubtaskEdit from '../Feature/ManageActivityPage/Components/SubtaskEdit';
import { deleteSubtask, updateSubtask, deleteTask as deleteMainTaskService } from '../Feature/ManageCreatePage/Services/subtaskService';
import { updateTask } from '../Feature/ManageCreatePage/Services/taskService';
import { createMultipleSubtasks } from '../Feature/ManageCreatePage/Services/subtaskService';
import SubtaskForm from '../Feature/ManageCreatePage/Components/SubtaskForm';
import BackButton from '../Feature/ManageCreatePage/Components/BackButton';
import apiClient from '../Services/ApiClient';
import LoadingScreen from '../shared/Components/LoadingScreen';
import { useNotification } from '../Feature/ManageCreatePage/Hooks/useNotification';
import type { Task } from '../Feature/ManageCreatePage/Types/taskTypes';
import type { EditableSubtask } from '../Feature/ManageActivityPage/Hooks/useSubtaskEdit';
import '../Feature/ManageCreatePage/Styles/CreatePage.css';

const ActivityPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [draftSubtasks, setDraftSubtasks] = useState<EditableSubtask[] | null>(null);
  const [isAddingSteps, setIsAddingSteps] = useState(false);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification } = useNotification();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await apiClient.get<Task>(`/api/task/${id}/`);
        setTask(response.data);
        setDraftSubtasks(response.data.subtasks ?? []);
      } catch (error) {
        console.error('Error fetching task:', error);
        showNotification('No se pudo cargar la tarea', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchTask();
    }
  }, [id, showNotification]);

  const handleSaveSubtasks = async (updatedSubtasks: EditableSubtask[]) => {
    if (!task) return;
    try {
      const updatePromises = updatedSubtasks.map((subtask) => {
        if (typeof subtask.id !== 'number') return Promise.resolve(null);
        return updateSubtask(subtask.id, {
          description: subtask.description,
          planification_date: subtask.planification_date,
          needed_hours: subtask.needed_hours,
          task_id: task.id,
        });
      });
      await Promise.all(updatePromises);
      showNotification('Subtareas actualizadas correctamente.', 'success');

      const response = await apiClient.get<Task>(`/api/task/${id}/`);
      setTask(response.data);
      setDraftSubtasks(response.data.subtasks ?? []);
      
      // Redirigir a /today después de guardar
      navigate('/today');
    } catch (error) {
      console.error('Error al actualizar subtareas:', error);
      showNotification('No se pudieron guardar los cambios.', 'error');
    }
  };

  const handleDeleteEditedSubtask = async (subtask: EditableSubtask) => {
    if (typeof subtask.id !== 'number') return;
    try {
      await deleteSubtask(subtask.id);
      setTask((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          subtasks: (prev.subtasks ?? []).filter((item) => item.id !== subtask.id),
        };
      });
      setDraftSubtasks((prev) =>
        (prev ?? []).filter((item) => item.id !== subtask.id),
      );
      showNotification('Subtarea eliminada.', 'success');
    } catch (error) {
      console.error('Error al eliminar subtarea:', error);
      showNotification('No se pudo eliminar la subtarea.', 'error');
      throw error;
    }
  };

  const handleTaskDeleted = async () => {
    try {
      if (task) {
        await deleteMainTaskService(task.id);
      }
      showNotification('Tarea eliminada correctamente.', 'success');
      navigate('/today');
    } catch (error) {
       console.error('Error al eliminar tarea principal', error);
      showNotification('No se pudo eliminar la tarea.', 'error');
    }
  };

  const handleSaveTask = async (taskData: any) => {
    if (!task) return;
    try {
      await updateTask(task.id, {
        title: taskData.title,
        description: taskData.description,
        subject: taskData.subject,
        type: taskData.type,
        priority: taskData.priority,
        due_date: taskData.due_date,
      });

      setTask((prev) =>
        prev
          ? {
              ...prev,
              title: taskData.title,
              description: taskData.description,
              subject: taskData.subject,
              type: taskData.type,
              priority: taskData.priority,
              due_date: taskData.due_date,
            }
          : null
      );
      showNotification('Tarea actualizada correctamente.', 'success');
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      showNotification('No se pudo actualizar la tarea.', 'error');
      throw error;
    }
  };

  const handleOpenAddSteps = () => {
    setIsAddingSteps(true);
  };

  const handleFinalizeSubtasks = async (subtasksData: any[]) => {
    if (!task) return;

    try {
      const createdSubtasks = await createMultipleSubtasks(task.id, subtasksData);

      const normalizedCreated: EditableSubtask[] = createdSubtasks.map((item: any) => ({
        id: item.id,
        description: item.description,
        planification_date: item.planification_date,
        needed_hours: Number(item.needed_hours) || 0,
        is_completed: item.is_completed,
      }));

      setTask((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          subtasks: [...(prev.subtasks ?? []), ...normalizedCreated],
        };
      });

      setDraftSubtasks((prev) => [...(prev ?? []), ...normalizedCreated]);
      setIsAddingSteps(false);
      showNotification('Nuevos pasos agregados correctamente.', 'success');
    } catch (error) {
      console.error('Error al crear subtareas:', error);
      showNotification('No se pudieron crear los nuevos pasos.', 'error');
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando detalles de la actividad..." />;
  }

  return (
    <div className="create-page">
      {notification && (
        <div className={`custom-toast toast-${notification.type}`}>
          {notification.message}
        </div>
      )}
      <div className="subtask-fullscreen">
        {task && isAddingSteps ? (
          <>
            <BackButton onClick={() => setIsAddingSteps(false)} label="Volver a editar subtareas" />
            <SubtaskForm
              taskId={task.id}
              taskTitle={task.title}
              baseSubtasksForHours={draftSubtasks ?? task.subtasks ?? []}
              onFinalize={handleFinalizeSubtasks}
            />
          </>
        ) : task ? (
          <SubtaskEdit
            taskId={task.id}
            initialSubtasks={draftSubtasks ?? task.subtasks ?? []}
            persistedSubtasks={task.subtasks ?? []}
            taskTitle={task.title}
            taskDueDate={task.due_date ?? undefined}
            task={task}
            onSubtasksChange={setDraftSubtasks}
            onSaveChanges={handleSaveSubtasks}
            onSaveTask={handleSaveTask}
            onDeleteSubtask={handleDeleteEditedSubtask}
            onTaskDeleted={handleTaskDeleted}
            onAddNewSubtask={handleOpenAddSteps}
            onClose={() => navigate(-1)}
          />
        ) : (
          <div className="empty-state">
            <p>La tarea solicitada no existe o fue eliminada.</p>
            <button className="btn-primary" onClick={() => navigate('/today')} style={{ marginTop: '16px' }}>
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
