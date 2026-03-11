import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import type { ConflictTask } from '../Types/conflict';
import { formatDate, totalHours } from '../Utils/conflictUtils';
import { MOCK_AVAILABLE_DATES } from '../Services/mockData';

interface ConflictTaskRowProps {
  task: ConflictTask;
  conflictDate: string;
  allTasksOnDay: ConflictTask[];
  maxHoursPerDay: number;
  editableHours: boolean;
  editableDate: boolean;
  resolved?: boolean;
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

  // Keep rawHours in sync if parent updates the task (e.g. auto-resolve)
  useEffect(() => {
    setRawHours(String(task.hours));
  }, [task.hours]);

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
          <div
            className={`conflict-input-field${hoursError ? ' conflict-input-field--error' : ''}${!editableHours ? ' conflict-input-field--disabled' : ''}`}
          >
            <Clock size={13} className="conflict-input-field__icon" />
            <input
              type="number"
              className="conflict-input"
              value={rawHours}
              min={0.5}
              max={maxHoursPerDay}
              step={0.5}
              disabled={!editableHours}
              onChange={handleHoursChange}
              aria-label={`Horas para ${task.title}`}
            />
            <span className="conflict-input-field__suffix">h</span>
          </div>
          {hoursError && <p className="conflict-input-error">{hoursError}</p>}
          {!hoursError && (
            <p className="conflict-input-error conflict-input-error--placeholder">
              &nbsp;
            </p>
          )}
        </div>

        {/* Date selector */}
        <select
          className="conflict-select"
          value={task.date}
          disabled={!editableDate}
          onChange={(e) => onChangeDate(task.id, e.target.value)}
          aria-label={`Fecha para ${task.title}`}
        >
          {MOCK_AVAILABLE_DATES.map((d) => (
            <option key={d} value={d}>
              {formatDate(d)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ConflictTaskRow;
