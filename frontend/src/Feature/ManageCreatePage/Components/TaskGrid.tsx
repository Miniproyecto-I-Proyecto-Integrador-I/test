import React from 'react';
import type { Task } from '../Types/taskTypes';

interface TaskGridProps {
	tasks: Task[];
	onTaskClick: (task: Task) => void;
}

const getStatusLabel = (status: string): string => {
	const labels: Record<string, string> = {
		pending: 'Pendiente',
		in_progress: 'En Progreso',
		completed: 'Completada',
	};
	return labels[status] || status;
};

const TaskGrid: React.FC<TaskGridProps> = ({ tasks, onTaskClick }) => {
	if (tasks.length === 0) return null;

	return (
		<div className="task-grid">
			{tasks.map((task) => (
				<div
					key={task.id}
					className="task-card"
					onClick={() => onTaskClick(task)}
				>
					<h3>{task.title}</h3>
					{task.description && (
						<p className="task-card-description">{task.description}</p>
					)}
					<div className={`status-badge ${task.status}`}>
						<span className="status-dot"></span>
						<span>{getStatusLabel(task.status)}</span>
					</div>
				</div>
			))}
		</div>
	);
};

export default TaskGrid;
