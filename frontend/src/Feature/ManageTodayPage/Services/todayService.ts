import apiClient from '../../../Services/ApiClient';
import type { Task } from '../Types/models';

export const todayService = {
    // Obtener todas las tareas y subtareas del día
    getTodayTasks: async (): Promise<Task[]> => {
        const response = await apiClient.get<Task[]>('/hoy');
        return response.data;
    },
}