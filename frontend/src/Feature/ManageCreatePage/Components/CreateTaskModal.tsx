import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Task, TaskPayload } from '../Types/taskTypes';
import SuccessTaskModal from './SuccessTaskModal';

interface CreateTaskModalProps {
	onClose: () => void;
	onSubmit: (payload: TaskPayload) => Promise<Task>;
	onAddSubtasks: (task: Task) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
	onClose,
	onSubmit,
	onAddSubtasks,
}) => {
	const navigate = useNavigate();
	const [formStatus, setFormStatus] = useState<'idle' | 'success'>('idle');
	const [title, setTitle] = useState('');
	const [subject, setSubject] = useState('');
	const [evaluationType, setEvaluationType] = useState('');
	const [priority, setPriority] = useState('medium');
	const [dueDate, setDueDate] = useState('');
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [createdTask, setCreatedTask] = useState<Task | null>(null);

	const handleCreateTask = async (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: { [key: string]: string } = {};

		if (!title.trim()) newErrors.title = 'El nombre de la tarea es obligatorio.';
		if (!dueDate.trim()) newErrors.dueDate = 'La fecha límite es obligatoria.';

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		const taskPayload: TaskPayload = {
			title,
			due_date: `${dueDate}T23:59:59Z`,
			user: 1, // ID de usuario por defecto
			...(subject && { subject }),
			...(evaluationType && { type: evaluationType }),
			priority,
		};

		try {
			const newTask = await onSubmit(taskPayload);
			setCreatedTask(newTask);
			setErrors({});
			setFormStatus('success');
			setTitle('');
			setSubject('');
			setEvaluationType('');
			setPriority('medium');
			setDueDate('');
		} catch (error: any) {
			console.error('Error al guardar en Django:', error);
			setErrors({ general: 'Ocurrió un error al guardar la tarea en el servidor.' });
		}
	};

	const handleCloseTaskModal = () => {
		setFormStatus('idle');
		setErrors({});
		setTitle('');
		setSubject('');
		setEvaluationType('');
		setPriority('medium');
		setDueDate('');
		onClose();
	};

	const errorCount = Object.keys(errors).filter((k) => k !== 'general').length;

	return (
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
                            <h3 className="section-title">Información General de la Tarea</h3>
                            
                            <div className="form-group">
                                <label>Nombre descriptivo de la tarea</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Ensayo sobre la Revolución Francesa"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={errors.title ? 'has-error' : ''}
                                />
                                {errors.title && (
                                    <span className="error-text">{errors.title}</span>
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Materia o Asignatura</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Historia Universal"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tipo de evaluación</label>
                                    <select
                                        value={evaluationType}
                                        onChange={(e) => setEvaluationType(e.target.value)}
                                    >
                                        <option value="">Seleccionar tipo</option>
                                        <option value="ensayo">Ensayo</option>
                                        <option value="examen">Examen</option>
                                        <option value="proyecto">Proyecto</option>
                                        <option value="tarea">Tarea</option>
                                        <option value="lectura">Lectura</option>
                                    </select>
                                </div>
                            </div>

                            <h3 className="section-title">Planificación y Tiempos</h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha límite de entrega</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        placeholder="mm/dd/yyyy"
                                        className={errors.dueDate ? 'has-error' : ''}
                                    />
                                    {errors.dueDate && (
                                        <span className="error-text">{errors.dueDate}</span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Nivel de prioridad</label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <option value="high">Alta</option>
                                        <option value="medium">Media</option>
                                        <option value="low">Baja</option>
                                    </select>
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
                                    Crear Tarea Principal
                                </button>
                            </div>
                        </form>
					</>
				)}

				{formStatus === 'success' && createdTask && (
					<SuccessTaskModal
						task={createdTask}
						onNavigateToPanel={() => navigate('/today')}
						onAddSubtasks={() => onAddSubtasks(createdTask)}
					/>
				)}
			</div>
		</div>
	);
};

export default CreateTaskModal;
