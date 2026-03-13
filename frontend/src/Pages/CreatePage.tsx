import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import SubtaskForm from '../Feature/ManageCreatePage/Components/SubtaskForm';
import { createMultipleSubtasks } from '../Feature/ManageCreatePage/Services/subtaskService';
import '../Feature/ManageCreatePage/Styles/CreatePage.css';

import type { Task } from '../Feature/ManageCreatePage/Types/taskTypes';
import CreateTaskModal from '../Feature/ManageCreatePage/Components/CreateTaskModal';
import BackButton from '../Feature/ManageCreatePage/Components/BackButton';
import { useTasks } from '../Feature/ManageCreatePage/Hooks/useTasks';
import { useNotification } from '../Feature/ManageCreatePage/Hooks/useNotification';

const CreatePage = () => {
  const { addTask } = useTasks();
  const { notification, showNotification } = useNotification();
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  return (
    <div className="create-page">
      {notification && (
        <div className={`custom-toast toast-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <CreateTaskModal
                inline={true}
                onClose={() => navigate('/today')}
                onSubmit={async (payload) => {
                  return await addTask(payload);
                }}
                onAddSubtasks={(task) => {
                  navigate(`/activity/${task.id}`);
                }}
              />
            </div>
          }
        />

        <Route
          path="subtarea"
          element={
            <div className="subtask-fullscreen">
              <BackButton
                onClick={() => {
                  setSelectedTask(null);
                  navigate('/create');
                }}
              />
              {selectedTask ? (
                <SubtaskForm
                  taskId={selectedTask.id}
                  taskTitle={selectedTask.title}
                  onFinalize={handleFinalizeSubtasks}
                />
              ) : (
                <div className="empty-state">
                  <p>No has seleccionado una tarea. Vuelve a inicio.</p>
                  <button
                    className="btn-primary"
                    onClick={() => navigate('/create')}
                    style={{ marginTop: '16px' }}
                  >
                    Ir a Crear Tarea
                  </button>
                </div>
              )}
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default CreatePage;
