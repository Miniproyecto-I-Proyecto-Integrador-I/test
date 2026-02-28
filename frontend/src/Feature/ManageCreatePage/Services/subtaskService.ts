import apiClient from '../../../Services/ApiClient';
import type { SubtaskPayload } from '../Types/subtask.types';

/**
 * Crea una subtarea asociada a una tarea
 */
export const createSubtask = async (taskId: number, subtaskData: SubtaskPayload) => {
	try {
		const response = await apiClient.post(`api/task/${taskId}/subtasks/`, subtaskData);
		return response.data;
	} catch (error) {
		console.error('Error al crear subtarea:', error);
		throw error;
	}
};

/**
 * Crea múltiples subtareas asociadas a una tarea
 */
export const createMultipleSubtasks = async (
	taskId: number,
	subtasks: Omit<SubtaskPayload, 'task_id'>[]
) => {
	try {
		const promises = subtasks.map((subtask) =>
			createSubtask(taskId, {
				...subtask,
				task_id: taskId,
			})
		);
		const results = await Promise.all(promises);
		return results;
	} catch (error) {
		console.error('Error al crear subtareas:', error);
		throw error;
	}
};

/**
 * Obtiene una tarea con todas sus subtareas
 */
export const getTaskWithSubtasks = async (taskId: number) => {
	try {
		const response = await apiClient.get(`/task/${taskId}/`);
		return response.data;
	} catch (error) {
		console.error('Error al obtener tarea con subtareas:', error);
		throw error;
	}
};

/**
 * Obtiene todas las subtareas (con filtros opcionales)
 */
export const getAllSubtasks = async () => {
	try {
		const response = await apiClient.get('/subtasks/');
		return response.data;
	} catch (error) {
		console.error('Error al obtener subtareas:', error);
		throw error;
	}
};

/**
 * Obtiene las subtareas de una tarea específica
 */
export const getSubtasksByTask = async (taskId: number) => {
	try {
		const response = await apiClient.get(`/api/task/${taskId}/subtasks/`);
		return response.data;
	} catch (error) {
		console.error('Error al obtener subtareas de la tarea:', error);
		throw error;
	}
};

/**
 * Actualiza una subtarea existente
 */
export const updateSubtask = async (subtaskId: number, subtaskData: Partial<SubtaskPayload>) => {
	try {
		const response = await apiClient.patch(`/api/subtasks/${subtaskId}/`, subtaskData);
		return response.data;
	} catch (error) {
		console.error('Error al actualizar subtarea:', error);
		throw error;
	}
};

/**
 * Elimina una subtarea
 */
export const deleteSubtask = async (subtaskId: number) => {
	try {
		const response = await apiClient.delete(`/api/subtasks/${subtaskId}/`);
		return response.data;
	} catch (error) {
		console.error('Error al eliminar subtarea:', error);
		throw error;
	}
};

/**
 * Elimina una tarea completa
 */
export const deleteTask = async (taskId: number) => {
	try {
		const response = await apiClient.delete(`/api/task/${taskId}/`);
		return response.data;
	} catch (error) {
		console.error('Error al eliminar tarea:', error);
		throw error;
	}
};
