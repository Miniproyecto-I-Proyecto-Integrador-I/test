import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import SubtaskForm from '../Feature/ManageCreatePage/Components/SubtaskForm';
import { createMultipleSubtasks } from '../Feature/ManageCreatePage/Services/subtaskService';
import SubtaskEdit from '../Feature/ManageCreatePage/Components/SubtaskEdit';
import {
  deleteSubtask,
  updateSubtask,
} from '../Feature/ManageCreatePage/Services/subtaskService';
import { updateTask } from '../Feature/ManageCreatePage/Services/taskService';
import '../Feature/ManageCreatePage/Styles/CreatePage.css';
import apiClient from '../Services/ApiClient';
import type { EditableSubtask } from '../Feature/ManageCreatePage/Components/SubtaskEdit';

import type { Task } from '../Feature/ManageCreatePage/Types/taskTypes';
import TaskGrid from '../Feature/ManageCreatePage/Components/TaskGrid';
import CreateTaskModal from '../Feature/ManageCreatePage/Components/CreateTaskModal';
import TaskDetailsModal from '../Feature/ManageCreatePage/Components/TaskDetailsModal';
import BackButton from '../Feature/ManageCreatePage/Components/BackButton';
import { useTasks } from '../Feature/ManageCreatePage/Hooks/useTasks';
import { useNotification } from '../Feature/ManageCreatePage/Hooks/useNotification';

const CreatePage = () => {
  const { tasks, isLoading, addTask, removeTask } = useTasks();
  const { notification, showNotification } = useNotification();

  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleFinalizeSubtasks = async (subtasksData: any[]) => {
    if (!selectedTask) return;

    try {
      await createMultipleSubtasks(selectedTask.id, subtasksData);

      setSelectedTask(null);
      navigate('/create');

      showNotification(
        '¡Listo! Las actividades se han añadido a tu tarea exitosamente.',
        'success',
      );
    } catch (error: any) {
      console.error('Error al guardar subtareas en Django:', error);

      showNotification(
        'Hubo un problema al intentar guardar las actividades.',
        'error',
      );
    }
  };

  const handleOpenEditSubtasks = async () => {
    if (!selectedTask) return;

    try {
      const response = await apiClient.get(`/api/task/${selectedTask.id}/`);
      setSelectedTask(response.data);
      navigate('/create/edicion');
    } catch (error) {
      console.error('Error al cargar tarea para edición:', error);
      showNotification('No se pudo abrir la edición de subtareas.', 'error');
    }
  };

  const handleSaveSubtasks = async (updatedSubtasks: EditableSubtask[]) => {
    if (!selectedTask) return;

    try {
      const updatePromises = updatedSubtasks.map((subtask) => {
        if (typeof subtask.id !== 'number') return Promise.resolve(null);
        return updateSubtask(subtask.id, {
          description: subtask.description,
          planification_date: subtask.planification_date,
          needed_hours: subtask.needed_hours,
          task_id: selectedTask.id,
        });
      });

      await Promise.all(updatePromises);
      setSelectedTask(null);
      navigate('/create');
      showNotification('Subtareas actualizadas correctamente.', 'success');
    } catch (error) {
      console.error('Error al actualizar subtareas:', error);
      showNotification('No se pudieron guardar los cambios.', 'error');
    }
  };

  const handleDeleteEditedSubtask = async (subtask: EditableSubtask) => {
    if (typeof subtask.id !== 'number') return;

    try {
      await deleteSubtask(subtask.id);
    } catch (error) {
      console.error('Error al eliminar subtarea:', error);
      showNotification('No se pudo eliminar la subtarea.', 'error');
      throw error;
    }
  };

  const handleTaskDeleted = async () => {
    if (!selectedTask) return;

    removeTask(selectedTask.id);
    setSelectedTask(null);
    navigate('/create');
    showNotification('Tarea eliminada correctamente.', 'success');
  };

  const handleSaveTask = async (taskData: any) => {
    if (!selectedTask) return;

    try {
      await updateTask(selectedTask.id, {
        title: taskData.title,
        description: taskData.description,
        subject: taskData.subject,
        type: taskData.type,
        priority: taskData.priority,
        due_date: taskData.due_date,
      });

      // Actualizar el estado de la tarea seleccionada
      setSelectedTask((prev) =>
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

      showNotification('Tarea actualizada correctamente.', 'success');
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      showNotification('No se pudo actualizar la tarea.', 'error');
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="empty-content">
          <p className="empty-text">Cargando tus tareas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-page">
      {notification && (
        <div className={`custom-toast toast-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <Routes>
        <Route path="/" element={
          <>
            <header className="page-header">
              <h1 className="page-title">Gestión de Tareas</h1>
              {tasks.length > 0 && (
                <button
                  className="btn-primary"
                  onClick={() => navigate('/create/formulario')}
                >
                  + Crear nueva tarea
                </button>
              )}
            </header>

            {tasks.length === 0 ? (
              <Navigate to="/create/formulario" replace />
            ) : (
              <TaskGrid tasks={tasks} onTaskClick={(t) => {
                setSelectedTask(t);
                setIsDetailsModalOpen(true);
              }} />
            )}

            {selectedTask && isDetailsModalOpen && (
              <TaskDetailsModal
                task={selectedTask}
                onClose={() => {
                  setSelectedTask(null);
                  setIsDetailsModalOpen(false);
                }}
                onOpenEditSubtasks={() => {
                  setIsDetailsModalOpen(false);
                  handleOpenEditSubtasks();
                }}
                onOpenAddSubtasks={() => {
                  setIsDetailsModalOpen(false);
                  navigate('/create/formulario/subtarea');
                }}
              />
            )}
          </>
        } />

        <Route path="formulario" element={
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {tasks.length > 0 && <BackButton to="/create" />}
            <CreateTaskModal
              inline={true}
              onClose={() => navigate('/create')}
              onSubmit={async (payload) => {
                return await addTask(payload);
              }}
              onAddSubtasks={(task) => {
                setSelectedTask(task);
                navigate('/create/formulario/subtarea');
              }}
            />
          </div>
        } />

        <Route path="formulario/subtarea" element={
          <div className="subtask-fullscreen">
            <BackButton onClick={() => { setSelectedTask(null); navigate('/create'); }} />
            {selectedTask ? (
              <SubtaskForm
                taskTitle={selectedTask.title}
                onFinalize={handleFinalizeSubtasks}
              />
            ) : (
              <div className="empty-state"><p>No has seleccionado una tarea. Vuelve a inicio.</p></div>
            )}
          </div>
        } />

        <Route path="edicion" element={
          <div className="subtask-fullscreen">
            <BackButton onClick={() => { setSelectedTask(null); navigate('/create'); }} />
            {selectedTask ? (
              <SubtaskEdit
                taskId={selectedTask.id}
                initialSubtasks={selectedTask.subtasks ?? []}
                taskTitle={selectedTask.title}
                taskDueDate={selectedTask.due_date ?? undefined}
                task={selectedTask}
                onSaveChanges={handleSaveSubtasks}
                onSaveTask={handleSaveTask}
                onDeleteSubtask={handleDeleteEditedSubtask}
                onTaskDeleted={handleTaskDeleted}
                onClose={() => {
                  setSelectedTask(null);
                  navigate('/create');
                }}
              />
            ) : (
              <div className="empty-state"><p>No has seleccionado una tarea. Vuelve a inicio.</p></div>
            )}
          </div>
        } />
      </Routes>
    </div>
  );
};

export default CreatePage;
