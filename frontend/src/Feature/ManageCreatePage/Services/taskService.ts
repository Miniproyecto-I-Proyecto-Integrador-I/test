import apiClient from '../../../Services/ApiClient';
import type { Task, TaskPayload } from '../Types/taskTypes';

export const fetchTasks = async (): Promise<Task[]> => {
	const response = await apiClient.get('/api/task/');
	return Array.isArray(response.data) ? response.data : [];
};

export const createTask = async (payload: TaskPayload): Promise<Task> => {
	const response = await apiClient.post('/api/task/', payload);
	return response.data;
};

export const getTaskById = async (id: number): Promise<Task> => {
	const response = await apiClient.get(`/api/task/${id}/`);
	return response.data;
};
