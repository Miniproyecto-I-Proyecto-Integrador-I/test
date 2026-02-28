import { useState } from 'react';
import SubtaskForm from '../Feature/ManageCreatePage/Components/SubtaskForm';
import { createMultipleSubtasks } from '../Feature/ManageCreatePage/Services/subtaskService';
import SubtaskEdit from '../Feature/ManageCreatePage/Components/SubtaskEdit';
import { deleteSubtask, updateSubtask } from '../Feature/ManageCreatePage/Services/subtaskService';
import '../Feature/ManageCreatePage/Styles/CreatePage.css';
import apiClient from '../Services/ApiClient';
import type { EditableSubtask } from '../Feature/ManageCreatePage/Components/SubtaskEdit';

import type { Task } from '../Feature/ManageCreatePage/Types/taskTypes';
import TaskGrid from '../Feature/ManageCreatePage/Components/TaskGrid';
import CreateTaskModal from '../Feature/ManageCreatePage/Components/CreateTaskModal';
import TaskDetailsModal from '../Feature/ManageCreatePage/Components/TaskDetailsModal';
import { useTasks } from '../Feature/ManageCreatePage/Hooks/useTasks';
import { useNotification } from '../Feature/ManageCreatePage/Hooks/useNotification';

const CreatePage = () => {
	const { tasks, isLoading, addTask, removeTask } = useTasks();
	const { notification, showNotification } = useNotification();

	const [selectedTask, setSelectedTask] = useState<Task | null>(null);

	const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
	const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
	const [isEditSubtaskModalOpen, setIsEditSubtaskModalOpen] = useState(false);

	const handleFinalizeSubtasks = async (subtasksData: any[]) => {
		if (!selectedTask) return;

		try {
			await createMultipleSubtasks(selectedTask.id, subtasksData);

			setIsSubtaskModalOpen(false);
			setSelectedTask(null);

			showNotification(
				'¡Listo! Las actividades se han añadido a tu tarea exitosamente.',
				'success',
			);
		} catch (error: any) {
			console.error('Error al guardar subtareas en Django:', error);

			showNotification(
				'Hubo un problema al intentar guardar las actividades.',
				'error',
			);
		}
	};

	const handleOpenEditSubtasks = async () => {
		if (!selectedTask) return;

		try {
			const response = await apiClient.get(`/api/task/${selectedTask.id}/`);
			setSelectedTask(response.data);
			setIsEditSubtaskModalOpen(true);
		} catch (error) {
			console.error('Error al cargar tarea para edición:', error);
			showNotification('No se pudo abrir la edición de subtareas.', 'error');
		}
	};

	const handleSaveSubtasks = async (updatedSubtasks: EditableSubtask[]) => {
		if (!selectedTask) return;

		try {
			const updatePromises = updatedSubtasks.map((subtask) => {
				if (typeof subtask.id !== 'number') return Promise.resolve(null);
				return updateSubtask(subtask.id, {
					description: subtask.description,
					planification_date: subtask.planification_date,
					needed_hours: subtask.needed_hours,
					task_id: selectedTask.id,
				});
			});

			await Promise.all(updatePromises);
			setIsEditSubtaskModalOpen(false);
			setSelectedTask(null);
			showNotification('Subtareas actualizadas correctamente.', 'success');
		} catch (error) {
			console.error('Error al actualizar subtareas:', error);
			showNotification('No se pudieron guardar los cambios.', 'error');
		}
	};

	const handleDeleteEditedSubtask = async (subtask: EditableSubtask) => {
		if (typeof subtask.id !== 'number') return;

		try {
			await deleteSubtask(subtask.id);
		} catch (error) {
			console.error('Error al eliminar subtarea:', error);
			showNotification('No se pudo eliminar la subtarea.', 'error');
			throw error;
		}
	};

	const handleTaskDeleted = async () => {
		if (!selectedTask) return;

		removeTask(selectedTask.id);
		setIsEditSubtaskModalOpen(false);
		setSelectedTask(null);
		showNotification('Tarea eliminada correctamente.', 'success');
	};

	if (isLoading) {
		return (
			<div className="empty-state">
				<div className="empty-content">
					<p className="empty-text">Cargando tus tareas...</p>
				</div>
			</div>
		);
	}

	if (isSubtaskModalOpen && selectedTask) {
		return (
			<div className="create-page">
				{notification && (
					<div className={`custom-toast toast-${notification.type}`}>
						{notification.message}
					</div>
				)}
				<div className="subtask-fullscreen">
					<SubtaskForm
						taskTitle={selectedTask.title}
						onFinalize={handleFinalizeSubtasks}
						onBack={() => {
							setIsSubtaskModalOpen(false);
							setSelectedTask(null);
						}}
					/>
				</div>
			</div>
		);
	}

	if (isEditSubtaskModalOpen && selectedTask) {
		return (
			<div className="create-page">
				{notification && (
					<div className={`custom-toast toast-${notification.type}`}>
						{notification.message}
					</div>
				)}
				<div className="subtask-fullscreen">
					<SubtaskEdit
						taskId={selectedTask.id}
						initialSubtasks={selectedTask.subtasks ?? []}
						taskTitle={selectedTask.title}
						taskCategory={selectedTask.priority.toUpperCase()}
						taskDueDate={selectedTask.due_date ?? undefined}
						onSaveChanges={handleSaveSubtasks}
						onDeleteSubtask={handleDeleteEditedSubtask}
						onTaskDeleted={handleTaskDeleted}
						onClose={() => {
							setIsEditSubtaskModalOpen(false);
							setSelectedTask(null);
						}}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="create-page">
			{notification && (
				<div className={`custom-toast toast-${notification.type}`}>
					{notification.message}
				</div>
			)}

			<header className="page-header">
				<h1 className="page-title">Gestión de Actividades</h1>
				{tasks.length > 0 && (
					<button
						className="btn-primary"
						onClick={() => setIsCreateTaskModalOpen(true)}
					>
						+ Crear nueva tarea
					</button>
				)}
			</header>

			{tasks.length === 0 ? (
				<div className="empty-state">
					<div className="empty-content">
						<p className="empty-text">No tienes tareas pendientes para hoy</p>
						<button
							className="btn-primary"
							onClick={() => setIsCreateTaskModalOpen(true)}
						>
							Crear tarea
						</button>
					</div>
				</div>
			) : (
				<TaskGrid tasks={tasks} onTaskClick={setSelectedTask} />
			)}

			{isCreateTaskModalOpen && (
				<CreateTaskModal
					onClose={() => setIsCreateTaskModalOpen(false)}
					onSubmit={addTask}
					onAddSubtasks={(task) => {
						setIsCreateTaskModalOpen(false);
						setSelectedTask(task);
						setIsSubtaskModalOpen(true);
					}}
				/>
			)}

			{selectedTask && !isSubtaskModalOpen && !isEditSubtaskModalOpen && !isCreateTaskModalOpen && (
				<TaskDetailsModal
					task={selectedTask}
					onClose={() => setSelectedTask(null)}
					onOpenEditSubtasks={handleOpenEditSubtasks}
					onOpenAddSubtasks={() => setIsSubtaskModalOpen(true)}
				/>
			)}
		</div>
	);
};

export default CreatePage;
