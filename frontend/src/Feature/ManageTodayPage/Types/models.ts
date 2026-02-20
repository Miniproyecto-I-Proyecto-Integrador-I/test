export interface Subtask {
    id: number;
    task: number; // FK -> Task id
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    planification_date: string; // Date string
    needed_hours: number;
    created_at: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    completed?: boolean;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    due_date: string | null;
    user: number; // ID del usuario
    subtasks: Subtask[];
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    daily_hours: number;
    bio: string;
}