import apiClient from '../../../Services/ApiClient';
import type { SubtaskPayload } from '../Types/subtask.types';

/**
 * Crea una subtarea asociada a una tarea
 */
export const createSubtask = async (subtaskData: SubtaskPayload) => {
    try {
        const response = await apiClient.post('/subtasks/', subtaskData);
        return response.data;
    } catch (error) {
        console.error('Error al crear subtarea:', error);
        throw error;
    }
};

/**
 * Crea múltiples subtareas asociadas a una tarea
 */
export const createMultipleSubtasks = async (taskId: number, subtasks: Omit<SubtaskPayload, 'task'>[]) => {
    try {
        const promises = subtasks.map(subtask => 
            createSubtask({ ...subtask, task: taskId })
        );
        const results = await Promise.all(promises);
        return results;
    } catch (error) {
        console.error('Error al crear subtareas:', error);
        throw error;
    }
};

/**
 * Obtiene todas las subtareas de una tarea
 */
export const getSubtasksByTask = async (taskId: number) => {
    try {
        const response = await apiClient.get(`/subtasks/?task=${taskId}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener subtareas:', error);
        throw error;
    }
};

/**
 * Elimina una subtarea
 */
export const deleteSubtask = async (subtaskId: number) => {
    try {
        const response = await apiClient.delete(`/subtasks/${subtaskId}/`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar subtarea:', error);
        throw error;
    }
};
