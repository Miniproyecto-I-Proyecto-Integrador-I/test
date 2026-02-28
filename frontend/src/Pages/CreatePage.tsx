import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../Services/ApiClient';
import SubtaskForm from '../Feature/ManageCreatePage/Components/SubtaskForm';
import { createMultipleSubtasks } from '../Feature/ManageCreatePage/Services/subtaskService';
import SubtaskEdit from '../Feature/ManageCreatePage/Components/SubtaskEdit';
import type { EditableSubtask } from '../Feature/ManageCreatePage/Components/SubtaskEdit';
import { deleteSubtask, updateSubtask } from '../Feature/ManageCreatePage/Services/subtaskService';
import './CreatePage.css';

interface Task {
	id: number;
	title: string;
	description: string;
	status: string;
	priority: string;
	due_date: string | null;
	subtasks?: EditableSubtask[];
}

const CreatePage = () => {
	const navigate = useNavigate();
	const [tasks, setTasks] = useState<Task[]>([]);
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
	const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
	const [isEditSubtaskModalOpen, setIsEditSubtaskModalOpen] = useState(false);

	const [formStatus, setFormStatus] = useState<'idle' | 'success'>('idle');
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [status, setStatus] = useState('pending');
	const [priority, setPriority] = useState('medium');
	const [dueDate, setDueDate] = useState('');
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const [notification, setNotification] = useState<{
		message: string;
		type: 'success' | 'error';
	} | null>(null);

	const showNotification = (message: string, type: 'success' | 'error') => {
		setNotification({ message, type });
		setTimeout(() => {
			setNotification(null);
		}, 3000);
	};

	useEffect(() => {
		const fetchTasks = async () => {
			try {
				const response = await apiClient.get('/api/task/');
				setTasks(Array.isArray(response.data) ? response.data : []);
			} catch (error) {
				console.error('Error al cargar las tareas:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTasks();
	}, []);

	const handleCreateTask = async (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: { [key: string]: string } = {};

		if (!title.trim()) newErrors.title = 'El título es obligatorio.';
		if (!description.trim()) newErrors.description = 'La descripción es obligatoria.';

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		const taskPayload = {
			title,
			description,
			status,
			priority,
			due_date: dueDate ? `${dueDate}T23:59:59Z` : null,
			user: 1,
		};

		try {
			const taskResponse = await apiClient.post('/api/task/', taskPayload);
			const newTask: Task = taskResponse.data;

			setTasks([...tasks, newTask]);
			setSelectedTask(newTask);

			setErrors({});
			setFormStatus('success');

			setTitle('');
			setDescription('');
			setDueDate('');

		} catch (error: any) {
			console.error("Error al guardar en Django:", error);
			setErrors({ general: "Ocurrió un error al guardar la tarea en el servidor." });
		}
	};

	const handleCloseTaskModal = () => {
		setIsCreateTaskModalOpen(false);
		setFormStatus('idle');
		setErrors({});
		setTitle('');
		setDescription('');
		setStatus('pending');
		setPriority('medium');
		setDueDate('');
	};

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

		setTasks((prev) => prev.filter((task) => task.id !== selectedTask.id));
		setIsEditSubtaskModalOpen(false);
		setSelectedTask(null);
		showNotification('Tarea eliminada correctamente.', 'success');
	};

	const errorCount = Object.keys(errors).filter((k) => k !== 'general').length;

	const formatSpanishDate = (dateString: string) => {
		if (!dateString) return "Sin fecha";
		const date = new Date(dateString + 'T12:00:00');
		return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
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
				<div className="task-grid">
					{tasks.map((task) => (
						<div
							key={task.id}
							className="task-card"
							onClick={() => setSelectedTask(task)}
						>
							<h3>{task.title}</h3>
							<p>{task.description}</p>
							<span className={`status-badge ${task.status}`}>
								{task.status}
							</span>
						</div>
					))}
				</div>
			)}

			{isCreateTaskModalOpen && (
				<div className="modal-overlay" onClick={handleCloseTaskModal}>
					<div className="modal-card" onClick={(e) => e.stopPropagation()}>
						{formStatus === 'idle' && (
							<>
								<div className="modal-header">
									<h2>Nueva Tarea</h2>
									<p>Define el objetivo general.</p>
								</div>

								{errorCount > 0 && (
									<div className="error-banner">
										<span className="error-icon">ⓘ</span> Hay {errorCount}{' '}
										errores en el formulario.
									</div>
								)}
								{errors.general && (
									<div className="error-banner">
										<span className="error-icon">⚠</span> {errors.general}
									</div>
								)}

								<form
									onSubmit={handleCreateTask}
									className="task-form"
									noValidate
								>
									<div className="form-group">
										<label>Título</label>
										<input
											type="text"
											placeholder="Ej. Proyecto Final"
											value={title}
											onChange={(e) => setTitle(e.target.value)}
											className={errors.title ? 'has-error' : ''}
										/>
										{errors.title && (
											<span className="error-text">{errors.title}</span>
										)}
									</div>

									<div className="form-group">
										<label>Descripción</label>
										<input
											type="text"
											placeholder="Detalles de la tarea..."
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											className={errors.description ? 'has-error' : ''}
										/>
										{errors.description && (
											<span className="error-text">{errors.description}</span>
										)}
									</div>

									<div className="form-row">
										<div className="form-group">
											<label>Estado</label>
											<select
												value={status}
												onChange={(e) => setStatus(e.target.value)}
											>
												<option value="pending">Pendiente</option>
												<option value="in_progress">En Progreso</option>
												<option value="completed">Completada</option>
											</select>
										</div>
										<div className="form-group">
											<label>Prioridad</label>
											<select
												value={priority}
												onChange={(e) => setPriority(e.target.value)}
											>
												<option value="high">Alta</option>
												<option value="medium">Media</option>
												<option value="low">Baja</option>
											</select>
										</div>
										<div className="form-group">
											<label>Fecha Límite (Opcional)</label>
											<input
												type="date"
												value={dueDate}
												onChange={(e) => setDueDate(e.target.value)}
											/>
										</div>
									</div>

									<div className="modal-footer">
										<button
											type="button"
											className="btn-secondary"
											onClick={handleCloseTaskModal}
										>
											Cancelar
										</button>
										<button type="submit" className="btn-primary">
											Crear Tarea
										</button>
									</div>
								</form>
							</>
						)}

						{formStatus === 'success' && (
							<div className="success-state">
								<div className="success-icon-wrapper">
									<div className="success-icon">
										<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									</div>
								</div>
								<h2 className="success-title">¡Tarea creada exitosamente!</h2>
								<p className="success-subtitle">Tu tarea ha sido guardada y añadida a tu plan de estudio.</p>

								<div className="success-summary-list">
									<div className="summary-item">
										Descripción: {selectedTask?.description || 'Sin descripción'}
									</div>
									<div className="summary-item">
										Fecha: {formatSpanishDate(selectedTask?.due_date || '')}
									</div>
								</div>

								<div className="success-footer-actions">
									<button className="btn-secondary" onClick={() => navigate('/today')}>
										Volver al panel principal
									</button>
									<button className="btn-primary" onClick={() => {
										setIsCreateTaskModalOpen(false);
										setFormStatus('idle');
										setIsSubtaskModalOpen(true);
									}}>
										Añadir subtareas a esta actividad
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{selectedTask && !isSubtaskModalOpen && !isEditSubtaskModalOpen && !isCreateTaskModalOpen && (
				<div className="modal-overlay" onClick={() => setSelectedTask(null)}>
					<div className="modal-card" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h2>{selectedTask.title}</h2>
							<span className={`status-badge ${selectedTask.status}`}>
								{selectedTask.status}
							</span>
						</div>
						<div className="task-details-content">
							<p>
								<strong>Descripción:</strong> {selectedTask.description}
							</p>
							<p>
								<strong>Prioridad:</strong> {selectedTask.priority}
							</p>
							{selectedTask.due_date && (
								<p>
									<strong>Fecha límite:</strong>{' '}
									{new Date(selectedTask.due_date).toLocaleDateString()}
								</p>
							)}
						</div>

						<div className="modal-footer">
							<button
								className="btn-secondary"
								onClick={() => setSelectedTask(null)}
							>
								Cerrar
							</button>
							<button
								className="btn-primary"
								onClick={handleOpenEditSubtasks}
							>
								+ Editar subtareas
							</button>
							<button
								className="btn-primary"
								onClick={() => setIsSubtaskModalOpen(true)}
							>
								+ Agregar actividades
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CreatePage;
