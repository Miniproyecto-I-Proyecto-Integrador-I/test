import { CalendarDays } from 'lucide-react';
import type { Subtask } from '../../ManageTodayPage/Types/models';
import { formatDayLabel } from '../Utils/calendarUtils';
import { useAuth } from '../../../Context/AuthContext';
import '../Styles/DayDetailPanel.css';

interface DayDetailPanelProps {
  selectedDate: Date | null;
  subtasks: Subtask[];
}

const DayDetailPanel = ({ selectedDate, subtasks }: DayDetailPanelProps) => {
  const { user } = useAuth();
  const dailyHours = user?.daily_hours ?? 8;

  const totalHours = subtasks.reduce((sum, s) => sum + s.needed_hours, 0);
  const pct = Math.min((totalHours / dailyHours) * 100, 100);
  const isOver = totalHours > dailyHours;
  const remaining = parseFloat((dailyHours - totalHours).toFixed(2));

  return (
    <aside className="ddp">
      <div className="ddp__header">
        <h2 className="ddp__title">Detalles del Día</h2>
        {selectedDate && (
          <span className="ddp__date">{formatDayLabel(selectedDate)}</span>
        )}
      </div>

      {selectedDate && (
        <div className="ddp__progress">
          <div className="ddp__progress-header">
            <span className="ddp__progress-label">Progreso del día</span>
            <span className="ddp__progress-value">
              {totalHours}h / {dailyHours}h
            </span>
          </div>
          <div className="ddp__progress-track">
            <div
              className={`ddp__progress-fill${isOver ? ' ddp__progress-fill--over' : ''}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {!isOver && remaining > 0 && (
            <p className="ddp__progress-hint">
              Quedan {remaining}h disponibles para hoy.
            </p>
          )}
        </div>
      )}

      {!selectedDate ? (
        <div className="ddp__empty">
          <CalendarDays size={32} className="ddp__empty-icon" />
          <p className="ddp__empty-text">
            Seleccioná un día para ver sus actividades
          </p>
        </div>
      ) : subtasks.length === 0 ? (
        <div className="ddp__empty">
          <CalendarDays size={32} className="ddp__empty-icon" />
          <p className="ddp__empty-text">Sin actividades para este día</p>
        </div>
      ) : (
        <ul className="ddp__list">
          {subtasks.map((subtask) => (
            <li key={subtask.id} className="ddp__item">
              <div className="ddp__item-accent" />
              <div className="ddp__item-body">
                <span className="ddp__item-name">{subtask.description}</span>
                {subtask.task && (
                  <span className="ddp__item-task">{subtask.task.title}</span>
                )}
              </div>
              <span className="ddp__item-hours">{subtask.needed_hours}h</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default DayDetailPanel;
