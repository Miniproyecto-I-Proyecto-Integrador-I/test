import apiClient from '../../../Services/ApiClient';
import type { Subtask } from '../Types/models';

export const todayService = {
    // Obtener todas las subtareas con filtros opcionales
    getTodaySubtasks: async (filters?: Record<string, string>): Promise<Subtask[]> => {
        const params = new URLSearchParams(filters || {});
        const queryString = params.toString() ? `?${params.toString()}` : '';
        
        const response = await apiClient.get<Subtask[]>(`/api/subtasks/${queryString}`);
        console.log('Subtareas:', response.data);
        return response.data;
    },

    
}