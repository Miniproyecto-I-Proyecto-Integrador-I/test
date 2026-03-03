import apiClient from '../../../Services/ApiClient';
import type { Subtask } from '../Types/models';

export const todayService = {
    // Obtener todas las subtareas del día filtradas por fecha y estado
    getTodaySubtasks: async (): Promise<Subtask[]> => {
        const now = new Date();
        const colombia = new Date(now.getTime() - 5 * 60 * 60 * 1000);
        const fecha = colombia.toISOString().split('T')[0];

        const params = new URLSearchParams({
            fecha,
            status: 'pending',
        });

        const response = await apiClient.get<Subtask[]>(`api/subtasks/?${params.toString()}`);
        return response.data;
    },

    
}