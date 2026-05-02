export type ConflictCase = 'new_task' | 'day_overload';

export interface ConflictTask {
  id: string;
  title: string;
  parentTask: string;
  hours: number;
  date: string; // ISO: 'YYYY-MM-DD'
  isNew?: boolean; // only true for the incoming task causing the conflict (case 1)
  parentDueDate?: string;
  pendingDelete?: boolean;
}

export interface ConflictScenario {
  case: ConflictCase;
  conflictDate: string; // 'YYYY-MM-DD'
  maxHoursPerDay: number;
  newTask?: ConflictTask;      // only present in case 'new_task'
  existingTasks: ConflictTask[];
}
