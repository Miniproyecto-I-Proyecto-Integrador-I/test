import { useNavigate } from 'react-router-dom';
import { ChevronRight, PlusCircle } from 'lucide-react';

import type { Task } from '../Utils/types';
import { formatDateLabel } from '../Utils/progressUtils';

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
  const navigate = useNavigate();
  const subs = task.subtasks || [];
  const completedSubsCount = subs.filter(s => s.status === 'completed').length;
  const pct = Math.round(task.progress_percentage || 0);

  return (
    <div className="progress-card" onClick={() => navigate(`/activity/${task.id}`)}>
      <div className="progress-card-header">
        <div className="progress-card-header-left">
          <h3>{task.title}</h3>
          <p className="progress-card-due">
            VENCE: {formatDateLabel(task.due_date)}
          </p>
        </div>
        <ChevronRight size={20} className="progress-card-hint-icon" />
      </div>

      <div className="progress-card-bar-info">
        <span>Progreso</span>
        <span>{pct}%</span>
      </div>
      <div className="progress-card-bar-bg">
        <div className="progress-card-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="progress-card-subtasks-wrapper">
        <p className="progress-card-subtasks-title">ACTIVIDADES ({completedSubsCount}/{subs.length})</p>
        {subs.length === 0 ? (
          <div className="progress-empty-subtasks">
            <PlusCircle size={14} />
            <span>Haz click para añadir actividades</span>
          </div>
        ) : (
          <div className="progress-card-subtasks-list">
            {subs.map(sub => {
              const isDone = sub.status === 'completed';
              return (
                <div key={sub.id} className={`progress-pill ${isDone ? 'completed' : ''}`}>
                  <div className="progress-pill-dot" />
                  <span>{sub.description.toUpperCase()}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
