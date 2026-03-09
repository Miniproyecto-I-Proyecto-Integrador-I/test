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
 * Returns the query range for the given month.
 * - `from`: max(today, first day of month)  → never fetch past days
 * - `to`:   last day of month
 *
 * If `from > to` the whole month is in the past; the hook skips the fetch.
 */
export function getMonthRange(month: Date): { from: string; to: string } {
  const today = toISODate(new Date());
  const firstDay = toISODate(new Date(month.getFullYear(), month.getMonth(), 1));
  const lastDay = toISODate(
    new Date(month.getFullYear(), month.getMonth() + 1, 0),
  );

  return {
    from: firstDay < today ? today : firstDay,
    to: lastDay,
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
