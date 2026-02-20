export interface Subtask {
    id: number;
    description: string;
    status: string;
    planification_date: string;
    needed_hours: number;
    task?: {
        id: number;
        title: string;
        status: string;
        due_date?: string;
        description?: string;
        priority?: string;
        subject?: string;
        type?: string;
        total_hours?: number;
    };
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