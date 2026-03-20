import apiClient from '../../../Services/ApiClient';
import type { Subtask } from '../Types/models';

export const todayService = {
    // Obtener todas las subtareas con filtros opcionales
    getFilterSubtasks: async (filters?: Record<string, string>): Promise<Subtask[]> => {
        const params = new URLSearchParams(filters || {});
        const queryString = params.toString() ? `?${params.toString()}` : '';
        
        const response = await apiClient.get<Subtask[]>(`/api/subtasks/${queryString}`);
        console.log('Subtareas:', response.data);
        return response.data;
    },

    updateSubtaskStatus: async (subtaskId: number, status: string): Promise<Subtask> => {
        const response = await apiClient.patch<Subtask>(`/api/subtasks/${subtaskId}/`, { status });
        return response.data;
    },

    postponeSubtask: async (subtaskId: number, note?: string): Promise<Subtask> => {
        const normalizedNote = note?.trim();
        const payload: { status: string; note: string | null } = {
            status: 'postponed',
            note: normalizedNote ? normalizedNote : null,
        };

        const response = await apiClient.patch<Subtask>(`/api/subtasks/${subtaskId}/`, payload);
        return response.data;
    },

    
}