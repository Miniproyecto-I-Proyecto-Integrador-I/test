import type { Subtask } from '../../ManageTodayPage/Types/models';

export interface DaySummary {
  count: number;
  totalHours: number;
}

/** Maps 'YYYY-MM-DD' → aggregated summary for that day */
export type DayMap = Record<string, DaySummary>;

/** Maps 'YYYY-MM-DD' → raw subtasks for that day */
export type SubtasksByDate = Record<string, Subtask[]>;
