import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SubtaskEdit from '../Feature/ManageActivityPage/Components/SubtaskEdit';
import {
  deleteSubtask,
  updateSubtask,
  deleteTask as deleteMainTaskService,
} from '../Feature/ManageCreatePage/Services/subtaskService';
import { updateTask } from '../Feature/ManageCreatePage/Services/taskService';
import { createMultipleSubtasks } from '../Feature/ManageCreatePage/Services/subtaskService';
import apiClient from '../Services/ApiClient';
import LoadingScreen from '../shared/Components/LoadingScreen';
import type { Task } from '../Feature/ManageCreatePage/Types/taskTypes';
import type { EditableSubtask } from '../Feature/ManageActivityPage/Hooks/useSubtaskEdit';
import type { SubtaskFormData } from '../Feature/ManageCreatePage/Types/subtask.types';
import '../Feature/ManageCreatePage/Styles/CreatePage.css';

const ActivityPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const focusSubtaskId = (location.state as { focusSubtaskId?: number } | null)
    ?.focusSubtaskId;

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await apiClient.get<Task>(`/api/task/${id}/`);
        setTask(response.data);
      } catch (error) {
        console.error('Error fetching task:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchTask();
    }
  }, [id]);

  /** PATCH una subtarea individual directamente en la BD */
  const handleSaveIndividualSubtask = async (subtask: EditableSubtask) => {
    if (!task || typeof subtask.id !== 'number') return;
    try {
      await updateSubtask(subtask.id, {
        description: subtask.description,
        planification_date: subtask.planification_date,
        needed_hours: subtask.needed_hours,
        task_id: task.id,
      });
      setTask((prev) =>
        prev
          ? {
              ...prev,
              subtasks: (prev.subtasks ?? []).map((st) =>
                st.id === subtask.id ? { ...st, ...subtask } : st,
              ),
            }
          : prev,
      );
    } catch (error) {
      console.error('Error al actualizar subtarea:', error);
      throw error;
    }
  };

  /** POST una nueva subtarea directamente en la BD */
  const handleCreateSubtask = async (subtaskData: SubtaskFormData) => {
    if (!task) return;
    try {
      const createdSubtasks = await createMultipleSubtasks(task.id, [
        subtaskData,
      ]);
      const normalized: EditableSubtask[] = createdSubtasks.map(
        (item: any) => ({
          id: item.id,
          description: item.description,
          planification_date: item.planification_date,
          needed_hours: Number(item.needed_hours) || 0,
          status: item.status,
          is_completed: item.is_completed,
          note: item.note ?? null,
        }),
      );
      setTask((prev) =>
        prev
          ? { ...prev, subtasks: [...(prev.subtasks ?? []), ...normalized] }
          : prev,
      );
    } catch (error) {
      console.error('Error al crear subtarea:', error);
      throw error;
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
          subtasks: (prev.subtasks ?? []).filter(
            (item) => item.id !== subtask.id,
          ),
        };
      });
    } catch (error) {
      console.error('Error al eliminar subtarea:', error);
      throw error;
    }
  };

  const handleTaskDeleted = async () => {
    try {
      if (task) {
        await deleteMainTaskService(task.id);
      }
      navigate('/today');
    } catch (error) {
      console.error('Error al eliminar tarea principal', error);
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
          : null,
      );
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      throw error;
    }
  };

  const handleSubtasksChange = useCallback((newSubtasks: EditableSubtask[]) => {
    setTask((prev) => (prev ? { ...prev, subtasks: newSubtasks } : prev));
  }, []);

  if (loading) {
    return <LoadingScreen message="Cargando detalles de la actividad..." />;
  }

  return (
    <div className="create-page">
      <div className="subtask-fullscreen">
        {task ? (
          <SubtaskEdit
            taskId={task.id}
            initialSubtasks={task.subtasks ?? []}
            initialEditingSubtaskId={focusSubtaskId}
            taskTitle={task.title}
            taskDueDate={task.due_date ?? undefined}
            task={task}
            onSubtasksChange={handleSubtasksChange}
            onSaveIndividualSubtask={handleSaveIndividualSubtask}
            onCreateSubtask={handleCreateSubtask}
            onSaveTask={handleSaveTask}
            onDeleteSubtask={handleDeleteEditedSubtask}
            onTaskDeleted={handleTaskDeleted}
            onClose={() => navigate(-1)}
          />
        ) : (
          <div className="empty-state">
            <p>La tarea solicitada no existe o fue eliminada.</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/today')}
              style={{ marginTop: '16px' }}
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
