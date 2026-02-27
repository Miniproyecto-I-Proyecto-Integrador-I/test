import { useState } from 'react';
import apiClient from '../Services/ApiClient';
import './CreatePage.css';

interface SubtaskForm {
	description: string;
	status: string;
	planification_date: string;
	needed_hours: number | '';
}

const CreatePage = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formStatus, setFormStatus] = useState<'idle' | 'success'>('idle');

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [status, setStatus] = useState('pending');
	const [priority, setPriority] = useState('medium');
	const [dueDate, setDueDate] = useState('');

	const [subtasks, setSubtasks] = useState<SubtaskForm[]>([]);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const handleAddSubtask = () => {
		setSubtasks([
			...subtasks,
			{ description: '', status: 'pending', planification_date: '', needed_hours: '' }
		]);
	};

	const handleSubtaskChange = (index: number, field: keyof SubtaskForm, value: any) => {
		const newSubtasks = [...subtasks];
		newSubtasks[index] = { ...newSubtasks[index], [field]: value };
		setSubtasks(newSubtasks);
	};

	const handleRemoveSubtask = (index: number) => {
		const newSubtasks = subtasks.filter((_, i) => i !== index);
		setSubtasks(newSubtasks);
	};

	const handleCreateTask = async (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: { [key: string]: string } = {};

		if (!title.trim()) newErrors.title = "El título es obligatorio.";
		if (!description.trim()) newErrors.description = "La descripción es obligatoria.";

		subtasks.forEach((st, index) => {
			if (!st.description.trim()) newErrors[`subtask_${index}_desc`] = `La descripción de la subtarea ${index + 1} es obligatoria.`;
			if (!st.planification_date) newErrors[`subtask_${index}_date`] = `La fecha de la subtarea ${index + 1} es obligatoria.`;
			if (!st.needed_hours || st.needed_hours <= 0) newErrors[`subtask_${index}_hours`] = `Las horas de la subtarea ${index + 1} deben ser mayor a 0.`;
		});

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
			const createdTaskId = taskResponse.data.id;

			if (subtasks.length > 0) {
				const subtaskPromises = subtasks.map(st => {
					const subtaskPayload = {
						description: st.description,
						status: st.status,
						planification_date: st.planification_date,
						needed_hours: Number(st.needed_hours),
						task: createdTaskId
					};
					return apiClient.post('/api/subtasks/', subtaskPayload);
				});

				await Promise.all(subtaskPromises);
			}

			setErrors({});
			setFormStatus('success');

			setTimeout(() => {
				handleClose();
			}, 3000);

		} catch (error: any) {
			console.error("Error al guardar en Django:", error);
			if (error.response) {
				console.error("Detalle del error:", error.response.data);
			}
			setErrors({ general: "Ocurrió un error al guardar la tarea o sus subtareas en el servidor." });
		}
	};

	const handleClose = () => {
		setIsModalOpen(false);
		setFormStatus('idle');
		setErrors({});
		setTitle('');
		setDescription('');
		setStatus('pending');
		setPriority('medium');
		setDueDate('');
		setSubtasks([]);
	};

	const errorCount = Object.keys(errors).filter(k => k !== 'general').length;

	return (
		<div className="create-page">
			<header className="page-header">
				<h1 className="page-title">Crear Actividad</h1>
				<p className="page-subtitle">Añade tu tarea principal y desglósala en subtareas</p>
			</header>

			<div className="empty-state">
				<div className="empty-content">
					<p className="empty-text">No tienes tareas pendientes para hoy</p>
					<button className="btn-primary" onClick={() => setIsModalOpen(true)}>
						Crear actividad
					</button>
				</div>
			</div>

			{isModalOpen && (
				<div className="modal-overlay" onClick={handleClose}>
					<div className="modal-card" onClick={(e) => e.stopPropagation()}>

						{formStatus === 'idle' && (
							<>
								<div className="modal-header">
									<h2>Nueva Tarea y Subtareas</h2>
									<p>Estructura tu plan de estudio paso a paso.</p>
								</div>

								{errorCount > 0 && (
									<div className="error-banner">
										<span className="error-icon">ⓘ</span>
										Hay {errorCount} {errorCount === 1 ? 'error' : 'errores'} en el formulario.
									</div>
								)}
								{errors.general && (
									<div className="error-banner">
										<span className="error-icon">⚠</span>
										{errors.general}
									</div>
								)}

								<form onSubmit={handleCreateTask} className="task-form" noValidate>

									<h3 className="section-title">Detalles de la Tarea Principal</h3>

									<div className="form-group">
										<label>Título (Title)</label>
										<input
											type="text" placeholder="Ej. Proyecto Final"
											value={title} onChange={(e) => setTitle(e.target.value)}
											className={errors.title ? 'has-error' : ''}
										/>
										{errors.title && <span className="error-text">{errors.title}</span>}
									</div>

									<div className="form-group">
										<label>Descripción (Description)</label>
										<input
											type="text" placeholder="Detalles de la tarea..."
											value={description} onChange={(e) => setDescription(e.target.value)}
											className={errors.description ? 'has-error' : ''}
										/>
										{errors.description && <span className="error-text">{errors.description}</span>}
									</div>

									<div className="form-row">
										<div className="form-group">
											<label>Estado (Status)</label>
											<select value={status} onChange={(e) => setStatus(e.target.value)}>
												<option value="pending">Pendiente</option>
												<option value="in_progress">En Progreso</option>
												<option value="completed">Completada</option>
											</select>
										</div>
										<div className="form-group">
											<label>Prioridad (Priority)</label>
											<select value={priority} onChange={(e) => setPriority(e.target.value)}>
												<option value="high">Alta</option>
												<option value="medium">Media</option>
												<option value="low">Baja</option>
											</select>
										</div>
										<div className="form-group">
											<label>Fecha Límite (Due Date) - Opcional</label>
											<input
												type="date" value={dueDate}
												onChange={(e) => setDueDate(e.target.value)}
											/>
										</div>
									</div>

									<div className="subtasks-header">
										<h3 className="section-title">Subtareas (Subtasks)</h3>
										<button type="button" className="btn-add-subtask" onClick={handleAddSubtask}>
											+ Añadir Subtarea
										</button>
									</div>

									{subtasks.length === 0 ? (
										<p className="no-subtasks-msg">Aún no hay subtareas. Puedes añadir una si lo necesitas.</p>
									) : (
										<div className="subtasks-list">
											{subtasks.map((st, index) => (
												<div key={index} className="subtask-item">
													<div className="subtask-item-header">
														<h4>Subtarea {index + 1}</h4>
														<button type="button" className="btn-remove" onClick={() => handleRemoveSubtask(index)}>Eliminar</button>
													</div>

													<div className="form-group">
														<label>Descripción</label>
														<input
															type="text" placeholder="Ej. Leer capítulo 1"
															value={st.description}
															onChange={(e) => handleSubtaskChange(index, 'description', e.target.value)}
															className={errors[`subtask_${index}_desc`] ? 'has-error' : ''}
														/>
														{errors[`subtask_${index}_desc`] && <span className="error-text">{errors[`subtask_${index}_desc`]}</span>}
													</div>

													<div className="form-row">
														<div className="form-group">
															<label>Estado</label>
															<select value={st.status} onChange={(e) => handleSubtaskChange(index, 'status', e.target.value)}>
																<option value="pending">Pendiente</option>
																<option value="in_progress">En Progreso</option>
																<option value="completed">Completado</option>
															</select>
														</div>
														<div className="form-group">
															<label>Fecha Planificada</label>
															<input
																type="date" value={st.planification_date}
																onChange={(e) => handleSubtaskChange(index, 'planification_date', e.target.value)}
																className={errors[`subtask_${index}_date`] ? 'has-error' : ''}
															/>
															{errors[`subtask_${index}_date`] && <span className="error-text">{errors[`subtask_${index}_date`]}</span>}
														</div>
														<div className="form-group">
															<label>Horas Necesarias</label>
															<input
																type="number" step="0.5" placeholder="Ej. 1.5"
																value={st.needed_hours}
																onChange={(e) => handleSubtaskChange(index, 'needed_hours', e.target.value)}
																className={errors[`subtask_${index}_hours`] ? 'has-error' : ''}
															/>
															{errors[`subtask_${index}_hours`] && <span className="error-text">{errors[`subtask_${index}_hours`]}</span>}
														</div>
													</div>
												</div>
											))}
										</div>
									)}

									<div className="modal-footer">
										<button type="button" className="btn-secondary" onClick={handleClose}>
											Cancelar
										</button>
										<button type="submit" className="btn-primary">
											Guardar Todo
										</button>
									</div>
								</form>

								<div className="security-footer">
									<span>STaskM®</span>
								</div>
							</>
						)}

						{formStatus === 'success' && (
							<div className="success-state">
								<div className="success-icon">✓</div>
								<h2>¡Tarea y Subtareas creadas!</h2>
								<p>Tu tarea "{title}" con sus {subtasks.length} subtareas ha sido guardada en la base de datos.</p>
								<button className="btn-primary" onClick={handleClose}>
									Volver al panel principal
								</button>
							</div>
						)}

					</div>
				</div>
			)}
		</div>
	);
};

export default CreatePage;