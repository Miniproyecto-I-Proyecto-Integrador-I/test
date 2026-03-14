import { useState, useEffect } from 'react';
import { X, CalendarDays, AlertTriangle } from 'lucide-react';
import Calendar from '../../../shared/Components/Calendar';
import { useCalendarData } from '../Hooks/useCalendarData';
import CalendarDayCell, { CalendarDayCellSkeleton } from './CalendarDayCell';
import { toISODate, formatDayLabel } from '../Utils/calendarUtils';
import { useAuth } from '../../../Context/AuthContext';
import type { Subtask } from '../../ManageTodayPage/Types/models';
import type { SubtaskItem } from '../../ManageCreatePage/Types/subtask.types';
import '../Styles/DatePickerModal.css';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the chosen 'YYYY-MM-DD' string when the user confirms. */
  onConfirm: (date: string) => void;
  newSubtaskDescription: string;
  newSubtaskHours: number | string;
  /** Subtasks already added in this session (not yet saved to API). */
  pendingSubtasks?: SubtaskItem[];
  /** Optional upper bound (task due date). Dates after this are not selectable. */
  maxDate?: string;
  /** Custom label for the confirm button. Defaults to 'Añadir esta actividad' / 'Resolver conflicto'. */
  confirmLabel?: string;
  /** Subtask ids to exclude from the calendar API query (avoids duplicates when editing). */
  excludeIds?: (string | number)[];
  /** Current date of the subtask being edited ('YYYY-MM-DD'). Selecting this day shows a blocked message. */
  originalDate?: string;
  /** If true, blocks the selection of a date if it causes a time overload conflict. */
  blockConflict?: boolean;
  /** Optional override for daily max hours (e.g., conflict resolution with a new limit). */
  maxDailyHours?: number;
}

const DatePickerModal = ({
  isOpen,
  onClose,
  onConfirm,
  newSubtaskDescription,
  newSubtaskHours,
  pendingSubtasks = [],
  maxDate,
  excludeIds,
  originalDate,
  blockConflict = false,
  maxDailyHours,
}: DatePickerModalProps) => {
  const today = new Date();
  const todayISO = toISODate(today);

  const [activeMonth, setActiveMonth] = useState<Date>(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { dayMap, subtasksByDate, isLoading } = useCalendarData(
    activeMonth,
    excludeIds,
  );
  const { user } = useAuth();
  const dailyHours = maxDailyHours ?? user?.daily_hours ?? 8;

  const SKELETON_FADE_MS = 350;
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [skeletonFading, setSkeletonFading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (originalDate) {
        const [y, m, d] = originalDate.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        setSelectedDate(date);
        setActiveMonth(new Date(y, m - 1, 1));
      } else {
        setSelectedDate(null);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true);
      setSkeletonFading(false);
    } else {
      setSkeletonFading(true);
      const t = setTimeout(() => {
        setShowSkeleton(false);
        setSkeletonFading(false);
      }, SKELETON_FADE_MS);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  if (!isOpen) return null;

  // Augment dayMap with pending (locally added) subtasks for calendar cell badges
  const augmentedDayMap = { ...dayMap };
  for (const st of pendingSubtasks) {
    const key = st.planification_date;
    if (!augmentedDayMap[key]) {
      augmentedDayMap[key] = { count: 1, totalHours: st.needed_hours };
    } else {
      augmentedDayMap[key] = {
        count: augmentedDayMap[key].count + 1,
        totalHours: parseFloat(
          (augmentedDayMap[key].totalHours + st.needed_hours).toFixed(2),
        ),
      };
    }
  }

  const selectedISO = selectedDate ? toISODate(selectedDate) : null;
  const existingSubtasks: Subtask[] = selectedISO
    ? (subtasksByDate[selectedISO] ?? [])
    : [];
  const pendingForDay: SubtaskItem[] = selectedISO
    ? pendingSubtasks.filter((st) => st.planification_date === selectedISO)
    : [];
  const existingHours = existingSubtasks.reduce(
    (sum, st) => sum + st.needed_hours,
    0,
  );
  const pendingHours = pendingForDay.reduce(
    (sum, st) => sum + st.needed_hours,
    0,
  );
  const totalHours = parseFloat(
    (existingHours + pendingHours + Number(newSubtaskHours)).toFixed(2),
  );
  const isOver = totalHours > dailyHours;
  const pct = Math.min((totalHours / dailyHours) * 100, 100);
  const isSameAsOriginal = !!(originalDate && selectedISO === originalDate);

  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    if (!selectedISO) return;
    onConfirm(selectedISO);
    setSelectedDate(null);
  };

  return (
    <div className="dpm__overlay" onClick={onClose}>
      <div className="dpm" onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <div className="dpm__header">
          <h3 className="dpm__modal-title">Elegir fecha de la actividad</h3>
          <button className="dpm__close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="dpm__body">
          {/* ── Left – Calendar ── */}
          <div className="dpm__left">
            <Calendar
              month={activeMonth}
              onMonthChange={setActiveMonth}
              onDaySelect={handleDaySelect}
              minDate={todayISO}
              maxDate={maxDate}
              value={selectedDate}
              renderDay={(date) => {
                const iso = toISODate(date);
                if (iso < todayISO) return null;
                if (showSkeleton) {
                  return <CalendarDayCellSkeleton fading={skeletonFading} />;
                }
                const summary = augmentedDayMap[iso];
                if (!summary) return null;
                return <CalendarDayCell summary={summary} />;
              }}
            />
          </div>

          {/* ── Right – Day detail ── */}
          <div className="dpm__right">
            {!selectedDate ? (
              <div className="dpm__empty">
                <CalendarDays size={32} className="dpm__empty-icon" />
                <p className="dpm__empty-text">
                  Seleccioná un día para ver los detalles
                </p>
              </div>
            ) : selectedISO && selectedISO < todayISO ? (
              <div className="dpm__empty">
                <CalendarDays size={32} className="dpm__empty-icon" />
                <p className="dpm__empty-text">
                  Este día ya pasó. Seleccioná un día a partir de hoy para
                  agregar la actividad.
                </p>
              </div>
            ) : (
              <>
                <div className="dpm__day-header">
                  <span className="dpm__day-label">
                    {formatDayLabel(selectedDate)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="dpm__progress">
                  <div className="dpm__progress-header">
                    <span className="dpm__progress-label">Carga del día</span>
                    <span className="dpm__progress-value">
                      {totalHours}h / {dailyHours}h
                    </span>
                  </div>
                  <div className="dpm__progress-track">
                    <div
                      className={`dpm__progress-fill${isOver ? ' dpm__progress-fill--over' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Subtask list */}
                <p className="dpm__list-title">Actividades del día</p>
                <ul className="dpm__list">
                  {isLoading ? (
                    <>
                      <li className="dpm__item-skeleton" />
                      <li className="dpm__item-skeleton" />
                    </>
                  ) : (
                    <>
                      {/* New subtask – highlighted */}
                      <li className="dpm__item">
                        <div className="dpm__item-accent dpm__item-accent--new" />
                        <div className="dpm__item-body">
                          <span className="dpm__item-name">
                            {newSubtaskDescription || '(sin descripción)'}
                          </span>
                          <span className="dpm__item-new-badge">
                            {originalDate ? 'Modificando' : 'Nueva'}
                          </span>
                        </div>
                        <span className="dpm__item-hours dpm__item-hours--new">
                          {newSubtaskHours}h
                        </span>
                      </li>

                      {/* Pending subtasks (added this session, not yet saved) */}
                      {pendingForDay.map((st) => (
                        <li
                          key={st.id}
                          className="dpm__item dpm__item--pending"
                        >
                          <div className="dpm__item-accent dpm__item-accent--pending" />
                          <div className="dpm__item-body">
                            <span className="dpm__item-name">
                              {st.description}
                            </span>
                            <span className="dpm__item-pending-badge">
                              Recién agregada
                            </span>
                          </div>
                          <span className="dpm__item-hours dpm__item-hours--pending">
                            {st.needed_hours}h
                          </span>
                        </li>
                      ))}

                      {existingSubtasks.map((st) => (
                        <li key={st.id} className="dpm__item">
                          <div className="dpm__item-accent" />
                          <div className="dpm__item-body">
                            <span className="dpm__item-name">
                              {st.description}
                            </span>
                            {st.task && (
                              <span className="dpm__item-task">
                                {st.task.title}
                              </span>
                            )}
                          </div>
                          <span className="dpm__item-hours">
                            {st.needed_hours}h
                          </span>
                        </li>
                      ))}
                    </>
                  )}
                </ul>

                {/* CTA */}
                <div className="dpm__actions">
                  {isSameAsOriginal && (
                    <p className="dpm__same-day-hint">
                      Esta actividad ya está programada en este día.
                    </p>
                  )}
                  {!isSameAsOriginal && isOver && (
                    <p className="dpm__overload-hint">
                      <AlertTriangle size={13} />
                      Supera el límite diario por{' '}
                      {parseFloat((totalHours - dailyHours).toFixed(2))}h
                    </p>
                  )}
                  <button
                    className={`dpm__confirm-btn${isSameAsOriginal ? ' dpm__confirm-btn--disabled' : isOver ? ' dpm__confirm-btn--conflict' : ''}`}
                    onClick={
                      isSameAsOriginal || (isOver && blockConflict)
                        ? undefined
                        : handleConfirm
                    }
                    disabled={isSameAsOriginal || (isOver && blockConflict)}
                  >
                    {isSameAsOriginal
                      ? 'Ya está en este día'
                      : isOver && blockConflict
                        ? 'Sobrecarga de horas'
                        : originalDate
                          ? 'Modificar aquí'
                          : 'Elegir esta fecha'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal;
