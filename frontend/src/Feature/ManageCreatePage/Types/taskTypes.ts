import type { EditableSubtask } from '../Components/SubtaskEdit';

export interface Task {
	id: number;
	title: string;
	subject?: string;
	type?: string;
	description?: string;
	status: string;
	priority: string;
	due_date: string;
	subtasks?: EditableSubtask[];
}

export interface TaskPayload {
	title: string;
	due_date: string;
	user: number;
	subject?: string;
	type?: string;
	priority?: string;
}
