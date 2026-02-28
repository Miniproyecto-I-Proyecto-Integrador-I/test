import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../Services/ApiClient';
import SubtaskForm from '../Feature/ManageCreatePage/Components/SubtaskForm';
import './CreatePage.css';

interface Task {
	id: number;
	title: string;
	description: string;
	subject?: string;
	status: string;
	priority: string;
	due_date: string | null;
}

const CreatePage = () => {
	const navigate = useNavigate();
	const [tasks, setTasks] = useState<Task[]>([]);
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
	const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);

	const [subject, setSubject] = useState('');
	const [formStatus, setFormStatus] = useState<'idle' | 'success'>('idle');
	const [title, setTitle] = useState('');
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
		if (!subject.trim()) newErrors.subject = "La materia es obligatoria.";

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		const taskPayload = {
			title,
			subject,
			status,
			priority,
			due_date: dueDate ? `${dueDate}T23:59:59Z` : null,
			user: 1
		};

		try {
			const taskResponse = await apiClient.post('/api/task/', taskPayload);
			const newTask: Task = taskResponse.data;

			setTasks([...tasks, newTask]);
			setSelectedTask(newTask);

			setErrors({});
			setFormStatus('success');

			// Limpiar los campos del formulario tras creación exitosa
			setTitle('');
			setSubject('');
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
		setSubject('');
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
									<h2>Crear Nueva Tarea</h2>
									<p>Organiza tus objetivos académicos con facilidad.</p>
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
									<h3>Información General de la Tarea</h3>
									<div className="form-group">
										<label>Nombre descriptivo de la tarea</label>
										<input
											type="text" placeholder="Ej. Ensayo sobre la Revolución Francesa"
											value={title} onChange={(e) => setTitle(e.target.value)}
											className={errors.title ? 'has-error' : ''}
										/>
										{errors.title && <span className="error-text">{errors.title}</span>}
									</div>

									<div className="form-group">
										<label>Materia o asignatura</label>
										<input
											type="text" placeholder="Ej. Historia Universal"
											value={subject} onChange={(e) => setSubject(e.target.value)}
											className={errors.subject ? 'has-error' : ''}
										/>
										{errors.subject && <span className="error-text">{errors.subject}</span>}
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
										Materia: {selectedTask?.subject || 'Sin asignar'}
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

			{selectedTask && !isSubtaskModalOpen && !isCreateTaskModalOpen && (
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
				<div className="modal-overlay" onClick={() => {
					setIsSubtaskModalOpen(false);
					setSelectedTask(null);
				}}>
					<div className="subtask-modal-card" onClick={(e) => e.stopPropagation()}>
						<button className="btn-close-corner" onClick={() => {
							setIsSubtaskModalOpen(false);
							setSelectedTask(null);
						}}>✕</button>
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