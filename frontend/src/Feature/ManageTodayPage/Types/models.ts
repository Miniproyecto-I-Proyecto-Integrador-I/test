export interface Subtask {
    id: number;
    description: string;
    status: string;
    planification_date: string;
    needed_hours: number;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date?: string;
    subtasks?: Subtask[];
}


export interface User {
    id: number;
    username: string;
    email: string;
    daily_hours: number;
    bio: string;
}