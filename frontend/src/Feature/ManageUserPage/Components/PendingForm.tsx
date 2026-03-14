import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock3,
} from 'lucide-react';
import type { PendingConflictDay } from '../Types/pending.types';
import type {
  ConflictScenario,
  ConflictTask,
} from '../../ManageConflict/Types/conflict';
import { ConflictView } from '../../../Pages/ConflictPage';
import '../Styles/PendingForm.css';
import '../../ManageConflict/Styles/ConflictPage.css';

interface PendingFormProps {
  isOpen: boolean;
  conflictDays: PendingConflictDay[];
  newDailyLimit: number;
  onAbort: () => void;
  onSolve: () => void;
  onDayResolved: (fecha: string, tasks: ConflictTask[]) => Promise<void>;
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
  return { taskCount, totalHours };
};

const buildScenario = (
  day: PendingConflictDay,
  maxHoursPerDay: number,
): ConflictScenario => ({
  case: 'day_overload',
  conflictDate: day.fecha,
  maxHoursPerDay,
  existingTasks: day.subtasks.map((st) => ({
    id: String(st.id),
    title: st.nombre,
    parentTask: st.task_title || 'Sin tarea',
    hours: Number(st.horas),
    date: day.fecha,
    parentDueDate: st.task_due_date
      ? String(st.task_due_date).split('T')[0]
      : undefined,
  })),
});

const PendingForm: React.FC<PendingFormProps> = ({
  isOpen,
  conflictDays,
  newDailyLimit,
  onAbort,
  onSolve,
  onDayResolved,
  isSolving = false,
}) => {
  const [activeDay, setActiveDay] = useState<PendingConflictDay | null>(null);
  const [isSavingDay, setIsSavingDay] = useState(false);
  const isResolvedState = conflictDays.length === 0;

  if (!isOpen) return null;

  const handleConflictSave = async (tasks: ConflictTask[]) => {
    if (!activeDay) return;
    setIsSavingDay(true);
    try {
      await onDayResolved(activeDay.fecha, tasks);
      setActiveDay(null);
    } catch (err) {
      console.error('Error guardando resolución de conflicto:', err);
    } finally {
      setIsSavingDay(false);
    }
  };

  // ---- Inline conflict resolution view ----
  if (activeDay) {
    const scenario = buildScenario(activeDay, newDailyLimit);
    return (
      <div className="pending-overlay" role="dialog" aria-modal="true">
        <div className="pending-modal pending-modal--conflict">
          <button
            type="button"
            className="pending-abort"
            onClick={() => setActiveDay(null)}
            disabled={isSavingDay}
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Volver al resumen
          </button>
          <ConflictView
            scenario={scenario}
            onSave={handleConflictSave}
            onCancel={() => setActiveDay(null)}
          />
        </div>
      </div>
    );
  }

  // ---- Default list view ----
  return (
    <div className="pending-overlay" role="dialog" aria-modal="true">
      <div
        className={`pending-modal${isResolvedState ? ' pending-modal--resolved' : ''}`}
      >
        <button type="button" className="pending-abort" onClick={onAbort}>
          <ArrowLeft size={18} aria-hidden="true" />
          Descartar cambios
        </button>

        <div
          className={`pending-card${isResolvedState ? ' pending-card--resolved' : ''}`}
        >
          <div
            className={`pending-card-hero${isResolvedState ? ' pending-card-hero--resolved' : ''}`}
            aria-hidden="true"
          >
            {isResolvedState ? (
              <CheckCircle2 size={52} />
            ) : (
              <AlertTriangle size={52} />
            )}
          </div>

          <div className="pending-card-content">
            <h2 className="pending-title">
              {isResolvedState
                ? '¡Conflictos resueltos!'
                : '¡Conflictos de Agenda!'}
            </h2>
            <p className="pending-subtitle">
              {isResolvedState
                ? `Ya resolviste todos los conflictos. Puedes confirmar el nuevo límite diario de ${newDailyLimit}h.`
                : `Para cambiar el límite de horas máximas a ${newDailyLimit}h, primero debes resolver los conflictos detectados en los días listados a continuación.`}
            </p>

            {!isResolvedState && (
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
                      <button
                        type="button"
                        className="pending-action-btn"
                        onClick={() => setActiveDay(day)}
                      >
                        Ir a resolver conflicto
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div
          className={`pending-warning${isResolvedState ? ' pending-warning--resolved' : ''}`}
        >
          {isResolvedState
            ? 'Todo listo: no quedan conflictos pendientes por resolver.'
            : `Aviso: se han detectado ${conflictDays.length} dias con conflictos generados por tu nuevo limite diario`}
        </div>

        <div className="pending-footer">
          <button
            type="button"
            className={`pending-action-btn${isResolvedState ? ' pending-action-btn--resolved' : ''}`}
            onClick={onSolve}
            disabled={isSolving || conflictDays.length > 0}
          >
            {isSolving ? 'Verificando...' : 'Confirmar resolución'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingForm;
