import { useState, useEffect } from 'react';
import type { Task, TaskPayload } from '../Types/taskTypes';
import { fetchTasks as fetchTasksService, createTask as createTaskService } from '../Services/taskService';

export const useTasks = () => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadTasks = async () => {
			try {
				const data = await fetchTasksService();
				setTasks(data);
			} catch (error) {
				console.error('Error al cargar las tareas:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadTasks();
	}, []);

	const addTask = async (payload: TaskPayload) => {
		const newTask = await createTaskService(payload);
		setTasks((prev) => [...prev, newTask]);
		return newTask;
	};

	const removeTask = (taskId: number) => {
		setTasks((prev) => prev.filter((task) => task.id !== taskId));
	};

	return {
		tasks,
		isLoading,
		addTask,
		removeTask,
		setTasks,
	};
};
