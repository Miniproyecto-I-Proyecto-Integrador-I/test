import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../Styles/Calendar.css';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CalendarProps {
  /**
   * Optional render prop. Receives the Date for each cell and whether it
   * belongs to the currently displayed month. Return any JSX to fill the cell.
   */
  renderDay?: (date: Date, isCurrentMonth: boolean) => React.ReactNode;
  /** Controlled: currently visible month. Falls back to internal state. */
  month?: Date;
  /** Fired when the user navigates to a different month. */
  onMonthChange?: (newMonth: Date) => void;
  /** Fired when the user clicks a day cell. */
  onDaySelect?: (date: Date) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const WEEKDAYS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/**
 * Returns every cell for the visible weeks (4, 5 or 6 rows).
 * Outside-month days get `isCurrentMonth: false` so they can be dimmed.
 */
function buildCalendarCells(
  year: number,
  month: number,
): { date: Date; isCurrentMonth: boolean }[] {
  const startOffset = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells: { date: Date; isCurrentMonth: boolean }[] = [];

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1;
    cells.push({
      date: new Date(year, month, dayNum),
      isCurrentMonth: dayNum >= 1 && dayNum <= daysInMonth,
    });
  }

  return cells;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

const Calendar = ({
  renderDay,
  month: controlledMonth,
  onMonthChange,
  onDaySelect,
}: CalendarProps) => {
  const today = new Date();

  const [internalMonth, setInternalMonth] = useState<Date>(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const activeMonth = controlledMonth ?? internalMonth;

  const navigate = (delta: number) => {
    const next = new Date(
      activeMonth.getFullYear(),
      activeMonth.getMonth() + delta,
      1,
    );
    if (onMonthChange) {
      onMonthChange(next);
    } else {
      setInternalMonth(next);
    }
  };

  const days = buildCalendarCells(
    activeMonth.getFullYear(),
    activeMonth.getMonth(),
  );

  return (
    <div className="calendar">
      {/* Header */}
      <div className="calendar__header">
        <button
          className="calendar__nav-btn"
          onClick={() => navigate(-1)}
          aria-label="Mes anterior"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="calendar__selectors">
          <select
            className="calendar__select"
            value={activeMonth.getMonth()}
            onChange={(e) => {
              const next = new Date(
                activeMonth.getFullYear(),
                Number(e.target.value),
                1,
              );
              onMonthChange ? onMonthChange(next) : setInternalMonth(next);
            }}
            aria-label="Seleccionar mes"
          >
            {MONTHS_ES.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>

          <select
            className="calendar__select"
            value={activeMonth.getFullYear()}
            onChange={(e) => {
              const next = new Date(
                Number(e.target.value),
                activeMonth.getMonth(),
                1,
              );
              onMonthChange ? onMonthChange(next) : setInternalMonth(next);
            }}
            aria-label="Seleccionar año"
          >
            {Array.from(
              { length: 11 },
              (_, i) => today.getFullYear() - 5 + i,
            ).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          className="calendar__nav-btn"
          onClick={() => navigate(1)}
          aria-label="Mes siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="calendar__weekdays">
        {WEEKDAYS.map((d) => (
          <div key={d} className="calendar__weekday">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="calendar__grid">
        {days.map(({ date, isCurrentMonth }, idx) => {
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate
            ? isSameDay(date, selectedDate)
            : false;

          const cellClass = [
            'calendar__cell',
            !isCurrentMonth ? 'calendar__cell--outside' : '',
            isToday ? 'calendar__cell--today' : '',
            isSelected ? 'calendar__cell--selected' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={idx}
              className={cellClass}
              onClick={() => {
                setSelectedDate(date);
                onDaySelect?.(date);
              }}
            >
              <span className="calendar__day-number">{date.getDate()}</span>
              <div className="calendar__cell-content">
                {renderDay?.(date, isCurrentMonth)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
