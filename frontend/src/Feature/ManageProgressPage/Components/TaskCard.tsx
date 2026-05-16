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
  const completedSubsCount = subs.filter(
    (s) => s.status === 'completed',
  ).length;
  const pct = Math.round(task.progress_percentage || 0);

  const handleClick = () => {
    try {
      const container = document.querySelector(
        '.progress-cards-container',
      ) as HTMLElement | null;
      if (container) {
        sessionStorage.setItem(
          'progress.scrollLeft',
          String(container.scrollLeft),
        );
      }
    } catch (e) {
      // ignore
    }
    navigate(`/activity/${task.id}`, { state: { from: '/progress' } });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="progress-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Abrir tarea ${task.title}`}
    >
      <div className="progress-card-header">
        <div className="progress-card-header-left">
          <h3>{task.title}</h3>
          <p className="progress-card-due">
            VENCE: {formatDateLabel(task.due_date)}
          </p>
        </div>
        <ChevronRight
          size={20}
          className="progress-card-hint-icon"
          aria-hidden="true"
        />
      </div>

      <div className="progress-card-bar-info">
        <span>Progreso</span>
        <span>{pct}%</span>
      </div>
      <div className="progress-card-bar-bg">
        <div
          className="progress-card-bar-fill"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label="Progreso de la tarea"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="progress-card-subtasks-wrapper">
        <p className="progress-card-subtasks-title">
          ACTIVIDADES ({completedSubsCount}/{subs.length})
        </p>
        {subs.length === 0 ? (
          <div className="progress-empty-subtasks">
            <PlusCircle size={14} aria-hidden="true" />
            <span>Haz click para añadir actividades</span>
          </div>
        ) : (
          <div className="progress-card-subtasks-list">
            {subs.map((sub) => {
              const isDone = sub.status === 'completed';
              return (
                <div
                  key={sub.id}
                  className={`progress-pill ${isDone ? 'completed' : ''}`}
                >
                  <div className="progress-pill-dot" />
                  <span className="progress-pill-text">
                    {sub.description.toUpperCase()}
                  </span>
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
