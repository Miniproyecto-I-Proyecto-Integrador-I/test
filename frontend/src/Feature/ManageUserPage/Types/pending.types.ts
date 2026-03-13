export interface PendingSubtask {
  id: number;
  nombre: string;
  horas: number;
}

export interface PendingConflictDay {
  fecha: string;
  subtasks: PendingSubtask[];
}
