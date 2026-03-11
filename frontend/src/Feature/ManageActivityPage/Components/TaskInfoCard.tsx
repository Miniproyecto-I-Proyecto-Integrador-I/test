import React from 'react';
import { Edit2, Trash2, Calendar, FileText, Clock } from 'lucide-react';
import {
  formatTaskDueDate,
  getPriorityLabel,
} from '../Utils/subtaskEditUtils';

interface TaskInfoCardProps {
  title: string;
  description?: string;
  subject?: string;
  type?: string;
  priority: string;
  due_date: string;
  computedTotalHours: number;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskInfoCard: React.FC<TaskInfoCardProps> = ({
  title,
  description,
  subject,
  type,
  priority,
  due_date,
  computedTotalHours,
  onEdit,
  onDelete,
}) => (
  <div className="subtask-edit-parent-card">
    <div className="subtask-edit-task-row">
      <div>
        <div className="subtask-edit-task-header-row">
          <div className="subtask-edit-title-group">
            <h2 className="subtask-edit-title">{title}</h2>
            <span className="subtask-edit-category">
              PRIORIDAD: {getPriorityLabel(priority)}
            </span>
          </div>

          <div className="subtask-edit-buttons-group">
            <button
              type="button"
              className="subtask-edit-edit-main"
              onClick={onEdit}
            >
              <Edit2 size={16} />
              <span>Editar Tarea</span>
            </button>
            <button
              type="button"
              className="subtask-edit-delete-main"
              onClick={onDelete}
            >
              <Trash2 size={16} />
              <span>Eliminar Tarea</span>
            </button>
          </div>
        </div>

        <div className="subtask-edit-meta">
          <span className="subtask-edit-meta-item">
            <Calendar size={16} />
            ENTREGA: {formatTaskDueDate(due_date)}
          </span>
          <span className="subtask-edit-meta-item">
            <FileText size={16} />
            MATERIA: {subject?.trim() || '-'}
          </span>
          <span className="subtask-edit-meta-item">
            <FileText size={16} />
            TIPO: {type?.trim() || '-'}
          </span>
          <span className="subtask-edit-meta-item">
            <Clock size={16} />
            ESTIMADO: {computedTotalHours.toFixed(1)} Horas totales
          </span>
        </div>

        <hr className="subtask-edit-divider" />
        <div className="subtask-edit-description-row">
          <span className="subtask-edit-description-label">Descripción:</span>
          <span className="subtask-edit-description-text">
            {description?.trim() || '-'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default TaskInfoCard;
