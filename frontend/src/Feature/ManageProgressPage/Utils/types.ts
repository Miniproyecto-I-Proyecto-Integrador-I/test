export interface Subtask {
  id: number | string;
  description: string;
  status: string;
}

export interface Task {
  id: number;
  title: string;
  subject?: string;
  status: string;
  progress_percentage: number;
  due_date?: string;
  subtasks?: Subtask[];
}
