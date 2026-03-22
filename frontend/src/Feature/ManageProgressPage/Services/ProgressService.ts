import apiClient from '../../../Services/ApiClient';
import type { Task } from '../Utils/types';

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await apiClient.get<Task[]>('/api/task/');
  return response.data;
};
