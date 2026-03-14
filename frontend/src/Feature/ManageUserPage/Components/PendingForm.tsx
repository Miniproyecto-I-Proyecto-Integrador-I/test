import { AlertTriangle, ArrowLeft, Calendar, Clock3 } from 'lucide-react';
import type { PendingConflictDay } from '../Types/pending.types';
import '../Styles/PendingForm.css';

interface PendingFormProps {
  isOpen: boolean;
  conflictDays: PendingConflictDay[];
  newDailyLimit: number;
  onAbort: () => void;
  onSolve: () => void;
  isSolving?: boolean;
}

const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day, 0, 0, 0, 0);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

const capitalize = (value: string) => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getDaySummary = (day: PendingConflictDay) => {
  const taskCount = day.subtasks.length;
  const totalHours = day.subtasks.reduce(
    (acc, subtask) => acc + (Number(subtask.horas) || 0),
    0,
  );

  return {
    taskCount,
    totalHours,
  };
};

const PendingForm: React.FC<PendingFormProps> = ({
  isOpen,
  conflictDays,
  newDailyLimit,
  onAbort,
  onSolve,
  isSolving = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="pending-overlay" role="dialog" aria-modal="true">
      <div className="pending-modal">
        <button type="button" className="pending-abort" onClick={onAbort}>
          <ArrowLeft size={18} aria-hidden="true" />
          Abortar cambio
        </button>

        <div className="pending-card">
          <div className="pending-card-hero" aria-hidden="true">
            <AlertTriangle size={52} />
          </div>

          <div className="pending-card-content">
            <h2 className="pending-title">¡Conflictos de Agenda!</h2>
            <p className="pending-subtitle">
              Para cambiar el límite de horas máximas a {newDailyLimit}h,
              primero debes resolver los conflictos detectados en los días
              listados a continuación.
            </p>

            <div className="pending-list">
              {conflictDays.map((day) => {
                const { taskCount, totalHours } = getDaySummary(day);

                return (
                  <article key={day.fecha} className="pending-list-item">
                    <div className="pending-list-info">
                      <div className="pending-list-date">
                        <Calendar size={18} aria-hidden="true" />
                        <span>{capitalize(formatDate(day.fecha))}</span>
                      </div>
                      <p className="pending-list-summary">
                        <span>
                          {taskCount} {taskCount === 1 ? 'tarea' : 'tareas'}
                        </span>
                        <span className="pending-list-summary-hours">
                          <Clock3 size={13} aria-hidden="true" />
                          {totalHours.toFixed(1)}h
                        </span>
                      </p>
                    </div>
                    <button type="button" className="pending-action-btn">
                      Ir a resolver conflicto
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pending-warning">
          Aviso: se han detectado {conflictDays.length} dias con conflictos
          generados por tu nuevo limite diario
        </div>

        <div className="pending-footer">
          <button
            type="button"
            className="pending-action-btn"
            onClick={onSolve}
            disabled={isSolving}
          >
            {isSolving ? 'Verificando...' : 'Confirmar resolución'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingForm;
