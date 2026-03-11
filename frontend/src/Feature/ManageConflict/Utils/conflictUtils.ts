import type { ConflictTask } from '../Types/conflict';

export const HOUR_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8];

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function totalHours(tasks: ConflictTask[]): number {
  return tasks.reduce((sum, t) => sum + t.hours, 0);
}

export function isResolved(tasks: ConflictTask[], maxHoursPerDay: number, conflictDate: string): boolean {
  const tasksOnDay = tasks.filter(t => t.date === conflictDate);
  return totalHours(tasksOnDay) <= maxHoursPerDay;
}

export function excessHours(tasks: ConflictTask[], maxHoursPerDay: number, conflictDate: string): number {
  const tasksOnDay = tasks.filter(t => t.date === conflictDate);
  return Math.max(0, totalHours(tasksOnDay) - maxHoursPerDay);
}
