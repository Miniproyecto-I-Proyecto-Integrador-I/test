import { Routes, Route, useNavigate } from 'react-router-dom';
import '../Feature/ManageCreatePage/Styles/CreatePage.css';

import CreateTaskModal from '../Feature/ManageCreatePage/Components/CreateTaskModal';
import { useTasks } from '../Feature/ManageCreatePage/Hooks/useTasks';
import { useNotification } from '../Feature/ManageCreatePage/Hooks/useNotification';

const CreatePage = () => {
  const { addTask } = useTasks();
  const { notification } = useNotification();
  const navigate = useNavigate();

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
      </Routes>
    </div>
  );
};

export default CreatePage;
