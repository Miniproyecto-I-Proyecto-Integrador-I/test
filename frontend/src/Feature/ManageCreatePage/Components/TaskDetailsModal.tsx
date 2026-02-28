import React from 'react';
import type { Task } from '../Types/taskTypes';

interface TaskDetailsModalProps {
	task: Task;
	onClose: () => void;
	onOpenEditSubtasks: () => void;
	onOpenAddSubtasks: () => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
	task,
	onClose,
	onOpenEditSubtasks,
	onOpenAddSubtasks,
}) => {
	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-card" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>{task.title}</h2>
					<span className={`status-badge ${task.status}`}>
						{task.status}
					</span>
				</div>
				<div className="task-details-content">
					<p>
						<strong>Descripción:</strong> {task.description}
					</p>
					<p>
						<strong>Prioridad:</strong> {task.priority}
					</p>
					{task.due_date && (
						<p>
							<strong>Fecha límite:</strong>{' '}
							{new Date(task.due_date).toLocaleDateString()}
						</p>
					)}
				</div>

				<div className="modal-footer">
					<button className="btn-secondary" onClick={onClose}>
						Cerrar
					</button>
					<button className="btn-primary" onClick={onOpenEditSubtasks}>
						+ Editar subtareas
					</button>
					<button className="btn-primary" onClick={onOpenAddSubtasks}>
						+ Agregar actividades
					</button>
				</div>
			</div>
		</div>
	);
};

export default TaskDetailsModal;
