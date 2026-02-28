import { useState, useEffect } from 'react';
import apiClient from '../Services/ApiClient';
import SubtaskForm from '../Feature/ManageCreatePage/Components/SubtaskForm';
import './CreatePage.css';

interface Task {
	id: number;
	title: string;
	description: string;
	status: string;
	priority: string;
	due_date: string | null;
}

const CreatePage = () => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
	const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);

	const [formStatus, setFormStatus] = useState<'idle' | 'success'>('idle');
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [status, setStatus] = useState('pending');
	const [priority, setPriority] = useState('medium');
	const [dueDate, setDueDate] = useState('');
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	// Nuevo estado para nuestra notificación personalizada
	const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

	// Función auxiliar para mostrar la notificación y ocultarla después de 3 segundos
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
				console.error("Error al cargar las tareas:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchTasks();
	}, []);

	const handleCreateTask = async (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: { [key: string]: string } = {};

		if (!title.trim()) newErrors.title = "El título es obligatorio.";
		if (!description.trim()) newErrors.description = "La descripción es obligatoria.";

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
			user: 1
		};

		try {
			const taskResponse = await apiClient.post('/api/task/', taskPayload);
			const newTask: Task = taskResponse.data;

			setTasks([...tasks, newTask]);

			setErrors({});
			setFormStatus('success');

			setTimeout(() => {
				handleCloseTaskModal();
			}, 2000);

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
			const subtaskPromises = subtasksData.map(st => {
				const subtaskPayload = {
					description: st.description,
					status: 'pending',
					planification_date: st.planification_date,
					needed_hours: Number(st.needed_hours),
					task: selectedTask.id
				};
				return apiClient.post('/api/subtasks/', subtaskPayload);
			});

			await Promise.all(subtaskPromises);

			setIsSubtaskModalOpen(false);
			setSelectedTask(null);

			// Usamos nuestra notificación en lugar del alert()
			showNotification("¡Listo! Las actividades se han añadido a tu tarea exitosamente.", "success");

		} catch (error: any) {
			console.error("Error al guardar subtareas en Django:", error);

			// Usamos nuestra notificación para el error
			showNotification("Hubo un problema al intentar guardar las actividades.", "error");
		}
	};

	const errorCount = Object.keys(errors).filter(k => k !== 'general').length;

	if (isLoading) {
		return (
			<div className="empty-state">
				<div className="empty-content">
					<p className="empty-text">Cargando tus tareas...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="create-page">
			{/* Renderizamos la notificación si existe */}
			{notification && (
				<div className={`custom-toast toast-${notification.type}`}>
					{notification.message}
				</div>
			)}

			<header className="page-header">
				<h1 className="page-title">Gestión de Actividades</h1>
				{tasks.length > 0 && (
					<button className="btn-primary" onClick={() => setIsCreateTaskModalOpen(true)}>
						+ Crear nueva tarea
					</button>
				)}
			</header>

			{tasks.length === 0 ? (
				<div className="empty-state">
					<div className="empty-content">
						<p className="empty-text">No tienes tareas pendientes para hoy</p>
						<button className="btn-primary" onClick={() => setIsCreateTaskModalOpen(true)}>
							Crear tarea
						</button>
					</div>
				</div>
			) : (
				<div className="task-grid">
					{tasks.map(task => (
						<div key={task.id} className="task-card" onClick={() => setSelectedTask(task)}>
							<h3>{task.title}</h3>
							<p>{task.description}</p>
							<span className={`status-badge ${task.status}`}>{task.status}</span>
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
										<span className="error-icon">ⓘ</span> Hay {errorCount} errores en el formulario.
									</div>
								)}
								{errors.general && (
									<div className="error-banner">
										<span className="error-icon">⚠</span> {errors.general}
									</div>
								)}

								<form onSubmit={handleCreateTask} className="task-form" noValidate>
									<div className="form-group">
										<label>Título</label>
										<input
											type="text" placeholder="Ej. Proyecto Final"
											value={title} onChange={(e) => setTitle(e.target.value)}
											className={errors.title ? 'has-error' : ''}
										/>
										{errors.title && <span className="error-text">{errors.title}</span>}
									</div>

									<div className="form-group">
										<label>Descripción</label>
										<input
											type="text" placeholder="Detalles de la tarea..."
											value={description} onChange={(e) => setDescription(e.target.value)}
											className={errors.description ? 'has-error' : ''}
										/>
										{errors.description && <span className="error-text">{errors.description}</span>}
									</div>

									<div className="form-row">
										<div className="form-group">
											<label>Estado</label>
											<select value={status} onChange={(e) => setStatus(e.target.value)}>
												<option value="pending">Pendiente</option>
												<option value="in_progress">En Progreso</option>
												<option value="completed">Completada</option>
											</select>
										</div>
										<div className="form-group">
											<label>Prioridad</label>
											<select value={priority} onChange={(e) => setPriority(e.target.value)}>
												<option value="high">Alta</option>
												<option value="medium">Media</option>
												<option value="low">Baja</option>
											</select>
										</div>
										<div className="form-group">
											<label>Fecha Límite (Opcional)</label>
											<input
												type="date" value={dueDate}
												onChange={(e) => setDueDate(e.target.value)}
											/>
										</div>
									</div>

									<div className="modal-footer">
										<button type="button" className="btn-secondary" onClick={handleCloseTaskModal}>Cancelar</button>
										<button type="submit" className="btn-primary">Crear Tarea</button>
									</div>
								</form>
							</>
						)}

						{formStatus === 'success' && (
							<div className="success-state">
								<div className="success-icon">✓</div>
								<h2>¡Tarea creada!</h2>
								<p>Tu tarea "{title}" ha sido guardada. Ahora haz clic en ella para agregarle actividades.</p>
							</div>
						)}
					</div>
				</div>
			)}

			{selectedTask && !isSubtaskModalOpen && (
				<div className="modal-overlay" onClick={() => setSelectedTask(null)}>
					<div className="modal-card" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h2>{selectedTask.title}</h2>
							<span className={`status-badge ${selectedTask.status}`}>{selectedTask.status}</span>
						</div>
						<div className="task-details-content">
							<p><strong>Descripción:</strong> {selectedTask.description}</p>
							<p><strong>Prioridad:</strong> {selectedTask.priority}</p>
							{selectedTask.due_date && <p><strong>Fecha límite:</strong> {new Date(selectedTask.due_date).toLocaleDateString()}</p>}
						</div>

						<div className="modal-footer">
							<button className="btn-secondary" onClick={() => setSelectedTask(null)}>
								Cerrar
							</button>
							<button className="btn-primary" onClick={() => setIsSubtaskModalOpen(true)}>
								+ Agregar actividades
							</button>
						</div>
					</div>
				</div>
			)}

			{selectedTask && isSubtaskModalOpen && (
				<div className="modal-overlay" onClick={() => setIsSubtaskModalOpen(false)}>
					<div className="subtask-modal-card" onClick={(e) => e.stopPropagation()}>
						<button className="btn-close-corner" onClick={() => setIsSubtaskModalOpen(false)}>✕</button>
						<SubtaskForm
							taskTitle={selectedTask.title}
							onFinalize={handleFinalizeSubtasks}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default CreatePage;