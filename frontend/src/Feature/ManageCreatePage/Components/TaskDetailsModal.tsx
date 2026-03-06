import React from 'react';
import { X, CheckCircle2, Circle } from 'lucide-react';
import type { Task } from '../Types/taskTypes';

interface TaskDetailsModalProps {
	task: Task;
	onClose: () => void;
	onOpenEditSubtasks: () => void;
	onOpenAddSubtasks: () => void;
}

const getStatusLabel = (status: string): string => {
	const labels: Record<string, string> = {
		pending: 'Pendiente',
		in_progress: 'En Progreso',
		completed: 'Completada',
	};
	return labels[status] || status;
};

const getPriorityLabel = (priority: string): string => {
	const labels: Record<string, string> = {
		high: 'Alta',
		medium: 'Media',
		low: 'Baja',
	};
	return labels[priority] || priority;
};

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
	task,
	onClose,
	onOpenEditSubtasks,
	onOpenAddSubtasks,
}) => {
	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
				<button 
					type="button" 
					className="btn-close-corner" 
					onClick={onClose} 
					aria-label="Cerrar detalles"
				>
					<X size={20} />
				</button>
				<div className="modal-header">
					<h2>{task.title}</h2>
					<span className={`status-badge ${task.status}`}>
						{getStatusLabel(task.status)}
					</span>
				</div>
				<div className="task-details-content">
					{task.description && (
						<p>
							<strong>Descripción:</strong> {task.description}
						</p>
					)}
					{task.subject && (
						<p>
							<strong>Materia:</strong> {task.subject}
						</p>
					)}
					{task.type && (
						<p>
							<strong>Tipo de evaluación:</strong> {task.type}
						</p>
					)}
					<p>
						<strong>Prioridad:</strong> {getPriorityLabel(task.priority)}
					</p>
					{task.due_date && (
						<p>
							<strong>Fecha límite:</strong>{' '}
							{new Date(task.due_date).toLocaleDateString()}
						</p>
					)}
				</div>

				{task.subtasks && task.subtasks.length > 0 && (
					<div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
						<h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
							Actividades
						</h3>
						<ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
							{task.subtasks.map((st) => (
								<li key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
									{st.is_completed ? (
										<CheckCircle2 size={18} color="var(--success-color)" />
									) : (
										<Circle size={18} color="var(--text-tertiary)" />
									)}
									<span style={{ textDecoration: st.is_completed ? 'line-through' : 'none', flex: 1 }}>
										{st.description}
									</span>
									<span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
										{st.needed_hours}h
									</span>
								</li>
							))}
						</ul>
					</div>
				)}

				<div className="modal-footer">
					<button className="btn-primary" onClick={onOpenEditSubtasks}>
						+ Editar Tarea
					</button>
					<button className="btn-primary" onClick={onOpenAddSubtasks}>
						+ Agregar Actividades
					</button>
				</div>
			</div>
		</div>
	);
};

export default TaskDetailsModal;
