export interface PendingSubtask {
  id: number;
  nombre: string;
  horas: number;
  task_title?: string;
  task_due_date?: string | null;
}

export interface PendingConflictDay {
  fecha: string;
  subtasks: PendingSubtask[];
}
