export interface Subtask {
    id: number;
    title: string;
    completed: boolean;
    status?: string;
    description?: string;
    planificationDate?: string;
    neededHours?: number;
    activityId?: number;
}

export interface Task {
    id: number;
    title: string;
    description?: string; // El '?' significa que es opcional
    subtasks: Subtask[];
    subject?: string;
    type?: string;
    dueDate?: string;
    progress?: number;
    priority?: string;
    totalHours?: number;
    studentId?: number;
}
