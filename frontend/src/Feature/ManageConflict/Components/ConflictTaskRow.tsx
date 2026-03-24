import React, { useState, useEffect } from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import type { ConflictTask } from '../Types/conflict';
import { formatDate, totalHours } from '../Utils/conflictUtils';
import DatePickerModal from '../../ManageCalendarPage/Components/DatePickerModal';
import type { SubtaskItem } from '../../ManageCreatePage/Types/subtask.types';

interface ConflictTaskRowProps {
  task: ConflictTask;
  conflictDate: string;
  allTasksOnDay: ConflictTask[];
  allLocalTasks: ConflictTask[];
  maxHoursPerDay: number;
  editableHours: boolean;
  editableDate: boolean;
  canMarkForDelete?: boolean;
  resolved?: boolean;
  maxDate?: string;
  onChangeHours: (id: string, hours: number) => void;
  onChangeDate: (id: string, date: string) => void;
  onTogglePendingDelete?: (id: string) => void;
}

const ConflictTaskRow: React.FC<ConflictTaskRowProps> = ({
  task,
  conflictDate,
  allTasksOnDay,
  allLocalTasks,
  maxHoursPerDay,
  editableHours,
  editableDate,
  canMarkForDelete = false,
  resolved = false,
  maxDate,
  onChangeHours,
  onChangeDate,
  onTogglePendingDelete,
}) => {
  const isPendingDelete = !!task.pendingDelete;
  const isOnConflictDay = task.date === conflictDate;
  const dayTotal = totalHours(allTasksOnDay);
  const dayOverflows = dayTotal > maxHoursPerDay;
  const showWarning =
    isOnConflictDay && dayOverflows && !task.isNew && !isPendingDelete;

  // Local raw string so we can handle intermediate typing states
  const [rawHours, setRawHours] = useState(String(task.hours));
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Keep rawHours in sync if parent updates the task (e.g. auto-resolve)
  useEffect(() => {
    setRawHours(String(task.hours));
  }, [task.hours]);

  useEffect(() => {
    if (!Number.isFinite(task.hours) || task.hours <= 0) {
      setHoursError('Ingresa una cantidad de horas válida');
      return;
    }

    if (task.hours > maxHoursPerDay) {
      setHoursError(
        `No puede exceder las ${maxHoursPerDay}h máximas del usuario`,
      );
      return;
    }

    setHoursError(null);
  }, [task.hours, maxHoursPerDay]);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setRawHours(raw);

    const parsed = parseFloat(raw);
    if (raw === '' || isNaN(parsed)) {
      setHoursError('Ingresa una cantidad de horas válida');
      return;
    }
    if (parsed <= 0) {
      setHoursError('Las horas deben ser mayores a 0');
      return;
    }
    if (parsed > maxHoursPerDay) {
      setHoursError(
        `No puede exceder las ${maxHoursPerDay}h máximas del usuario`,
      );
      return;
    }
    setHoursError(null);
    onChangeHours(task.id, parsed);
  };

  const handleMinus = () => {
    if (!editableHours) return;
    const parsed = parseFloat(rawHours) || 0;
    if (parsed > 1) {
      const next = parsed - 1;
      setRawHours(String(next));
      setHoursError(null);
      onChangeHours(task.id, next);
    } else if (parsed <= 1 && parsed > 0) {
      setRawHours('1');
      setHoursError(null);
      onChangeHours(task.id, 1);
    }
  };

  const handlePlus = () => {
    if (!editableHours) return;
    const parsed = parseFloat(rawHours) || 0;
    if (parsed < maxHoursPerDay) {
      const next = parsed + 1;
      setRawHours(String(next));
      setHoursError(null);
      onChangeHours(task.id, next);
    } else if (parsed > maxHoursPerDay) {
      setRawHours(String(maxHoursPerDay));
      setHoursError(null);
      onChangeHours(task.id, maxHoursPerDay);
    }
  };

  const rowClass = [
    'conflict-task',
    isPendingDelete ? 'conflict-task--pending-delete' : '',
    task.isNew
      ? resolved
        ? 'conflict-task--new-resolved'
        : 'conflict-task--new'
      : '',
    showWarning ? 'conflict-task--overflow' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const pendingSubtasks: Array<SubtaskItem & { taskTitle?: string }> =
    allLocalTasks
      .filter((localTask) => localTask.id !== task.id)
      .map((localTask) => ({
        id: String(localTask.id),
        description: localTask.title,
        planification_date: localTask.date,
        needed_hours: Number(localTask.hours) || 0,
        taskTitle: localTask.parentTask,
      }));

  const excludeIds = allLocalTasks
    .map((localTask) =>
      typeof localTask.id === 'number' || /^\d+$/.test(String(localTask.id))
        ? String(localTask.id)
        : null,
    )
    .filter((id): id is string => id !== null);

  return (
    <div className={rowClass}>
      <div className="conflict-task__info">
        <p className="conflict-task__title">{task.title}</p>
        <p className="conflict-task__parent">{task.parentTask}</p>
        {isPendingDelete && (
          <p className="conflict-task__pending-delete-label">
            Se eliminará al guardar cambios.
          </p>
        )}
      </div>

      <div className="conflict-task__controls">
        {/* Hours input */}
        <div className="conflict-input-wrap">
          <label className="conflict-input-label">TIEMPO A INVERTIR</label>
          <div className="conflict-input-field">
            <button
              type="button"
              className="conflict-hour-btn"
              onClick={handleMinus}
              disabled={
                !editableHours || isPendingDelete || parseFloat(rawHours) <= 1
              }
            >
              -
            </button>
            <input
              type="number"
              className={`conflict-input ${hoursError ? 'conflict-input--error' : ''}`}
              value={rawHours}
              min={1}
              max={maxHoursPerDay}
              step={1}
              disabled={!editableHours || isPendingDelete}
              onChange={handleHoursChange}
              aria-label={`Horas para ${task.title}`}
            />
            <button
              type="button"
              className="conflict-hour-btn"
              onClick={handlePlus}
              disabled={
                !editableHours ||
                isPendingDelete ||
                parseFloat(rawHours) >= maxHoursPerDay
              }
            >
              +
            </button>
          </div>
          {hoursError && <p className="conflict-input-error">{hoursError}</p>}
          {!hoursError && (
            <p className="conflict-input-error conflict-input-error--placeholder">
              &nbsp;
            </p>
          )}
        </div>

        {/* Date selector */}
        <div className="conflict-input-wrap">
          <label className="conflict-input-label">DÍA DE REALIZACIÓN</label>
          <button
            type="button"
            className="conflict-select conflict-date-btn"
            disabled={!editableDate || isPendingDelete}
            onClick={() => setIsDatePickerOpen(true)}
            aria-label={`Cambiar fecha para ${task.title}`}
            style={{
              width: '130px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '13px' }}>{formatDate(task.date)}</span>
            <Calendar size={14} style={{ opacity: 0.6 }} />
          </button>
        </div>

        {canMarkForDelete && (
          <div className="conflict-input-wrap">
            <label className="conflict-input-label">ELIMINAR</label>
            <button
              type="button"
              className={`conflict-trash-btn ${isPendingDelete ? 'conflict-trash-btn--active' : ''}`}
              onClick={() => onTogglePendingDelete?.(task.id)}
              aria-label={
                isPendingDelete
                  ? `Deshacer eliminación para ${task.title}`
                  : `Marcar ${task.title} para eliminar al guardar`
              }
            >
              <Trash2 size={14} />
              {isPendingDelete && <span>Deshacer</span>}
            </button>
          </div>
        )}
      </div>

      <DatePickerModal
        isOpen={isDatePickerOpen && !isPendingDelete}
        onClose={() => setIsDatePickerOpen(false)}
        onConfirm={(date) => {
          onChangeDate(task.id, date);
          setIsDatePickerOpen(false);
        }}
        newSubtaskDescription={task.title}
        newSubtaskTaskTitle={task.parentTask}
        newSubtaskHours={task.hours}
        pendingSubtasks={pendingSubtasks}
        excludeIds={excludeIds}
        originalDate={task.date}
        maxDate={maxDate}
        blockConflict={true}
        maxDailyHours={maxHoursPerDay}
      />
    </div>
  );
};

export default ConflictTaskRow;
