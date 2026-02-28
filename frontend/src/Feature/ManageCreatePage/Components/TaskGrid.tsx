import React from 'react';
import type { Task } from '../Types/taskTypes';

interface TaskGridProps {
	tasks: Task[];
	onTaskClick: (task: Task) => void;
}

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
					<p>{task.description}</p>
					<span className={`status-badge ${task.status}`}>
						{task.status}
					</span>
				</div>
			))}
		</div>
	);
};

export default TaskGrid;
