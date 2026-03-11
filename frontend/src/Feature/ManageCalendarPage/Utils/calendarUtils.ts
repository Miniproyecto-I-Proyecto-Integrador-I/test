import type { Subtask } from '../../ManageTodayPage/Types/models';
import type { DayMap, SubtasksByDate } from '../Types/calendarTypes';

const MONTHS_ES_UTIL = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** Returns 'YYYY-MM-DD' without UTC conversion issues. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Returns a human-readable label like "9 de Marzo". */
export function formatDayLabel(date: Date): string {
  return `${date.getDate()} de ${MONTHS_ES_UTIL[date.getMonth()]}`;
}

/**
 * Returns the query range covering the full visible calendar grid for the
 * given month, including the leading days from the previous month and the
 * trailing days from the next month that fill the grid rows.
 *
 * - `from`: max(today, first visible cell)  → never fetch past days
 * - `to`:   last visible cell (may be in the next month)
 *
 * If `from > to` the entire visible range is in the past; the hook skips
 * the fetch.
 */
export function getMonthRange(month: Date): { from: string; to: string } {
  const today = toISODate(new Date());
  const year = month.getFullYear();
  const m = month.getMonth();

  const startOffset = new Date(year, m, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  // First and last cells of the rendered grid
  const firstCell = toISODate(new Date(year, m, 1 - startOffset));
  const lastCell = toISODate(new Date(year, m, totalCells - startOffset));

  return {
    from: firstCell < today ? today : firstCell,
    to: lastCell,
  };
}

/** Aggregates a list of subtasks into a per-day summary map. */
export function buildDayMap(subtasks: Subtask[]): DayMap {
  const map: DayMap = {};

  for (const subtask of subtasks) {
    const key = subtask.planification_date;
    if (!map[key]) map[key] = { count: 0, totalHours: 0 };
    map[key].count += 1;
    map[key].totalHours = parseFloat(
      (map[key].totalHours + subtask.needed_hours).toFixed(2),
    );
  }

  return map;
}

/** Groups a list of subtasks into a map of date → subtask[]. */
export function buildSubtasksByDate(subtasks: Subtask[]): SubtasksByDate {
  const map: SubtasksByDate = {};

  for (const subtask of subtasks) {
    const key = subtask.planification_date;
    if (!map[key]) map[key] = [];
    map[key].push(subtask);
  }

  return map;
}
