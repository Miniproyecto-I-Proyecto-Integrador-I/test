import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import type { ConflictTask } from '../Types/conflict';
import { formatDate, totalHours } from '../Utils/conflictUtils';
import DatePickerModal from '../../ManageCalendarPage/Components/DatePickerModal';

interface ConflictTaskRowProps {
  task: ConflictTask;
  conflictDate: string;
  allTasksOnDay: ConflictTask[];
  maxHoursPerDay: number;
  editableHours: boolean;
  editableDate: boolean;
  resolved?: boolean;
  maxDate?: string;
  onChangeHours: (id: string, hours: number) => void;
  onChangeDate: (id: string, date: string) => void;
}

const ConflictTaskRow: React.FC<ConflictTaskRowProps> = ({
  task,
  conflictDate,
  allTasksOnDay,
  maxHoursPerDay,
  editableHours,
  editableDate,
  resolved = false,
  maxDate,
  onChangeHours,
  onChangeDate,
}) => {
  const isOnConflictDay = task.date === conflictDate;
  const dayTotal = totalHours(allTasksOnDay);
  const dayOverflows = dayTotal > maxHoursPerDay;
  const showWarning = isOnConflictDay && dayOverflows && !task.isNew;

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
    task.isNew
      ? resolved
        ? 'conflict-task--new-resolved'
        : 'conflict-task--new'
      : '',
    showWarning ? 'conflict-task--overflow' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rowClass}>
      <div className="conflict-task__info">
        <p className="conflict-task__title">{task.title}</p>
        <p className="conflict-task__parent">{task.parentTask}</p>
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
              disabled={!editableHours || parseFloat(rawHours) <= 1}
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
              disabled={!editableHours}
              onChange={handleHoursChange}
              aria-label={`Horas para ${task.title}`}
            />
            <button
              type="button"
              className="conflict-hour-btn"
              onClick={handlePlus}
              disabled={
                !editableHours || parseFloat(rawHours) >= maxHoursPerDay
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
            disabled={!editableDate}
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
      </div>

      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onConfirm={(date) => {
          onChangeDate(task.id, date);
          setIsDatePickerOpen(false);
        }}
        newSubtaskDescription={task.title}
        newSubtaskHours={task.hours}
        excludeIds={!task.isNew ? [task.id] : []}
        originalDate={task.date}
        maxDate={maxDate}
        blockConflict={true}
        maxDailyHours={maxHoursPerDay}
      />
    </div>
  );
};

export default ConflictTaskRow;
