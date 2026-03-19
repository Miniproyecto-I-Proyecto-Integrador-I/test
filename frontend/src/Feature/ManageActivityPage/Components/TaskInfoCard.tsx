import React from 'react';
import {
  Edit2,
  Trash2,
  Calendar,
  FileText,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  formatTaskDueDate,
  getPriorityLabel,
  isDateBeforeToday,
} from '../Utils/subtaskEditUtils';

interface TaskInfoCardProps {
  title: string;
  description?: string;
  subject?: string;
  type?: string;
  priority: string;
  due_date: string;
  progress_percentage: number;
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
  progress_percentage = 0,
  computedTotalHours,
  onEdit,
  onDelete,
}) => {
  const isDueDateOverdue = isDateBeforeToday(due_date);

  return (
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
            <span
              className={`subtask-edit-meta-item ${isDueDateOverdue ? 'subtask-edit-meta-item--overdue' : ''}`}
            >
              <Calendar size={16} />
              ENTREGA: {formatTaskDueDate(due_date)}
              {isDueDateOverdue ? (
                <>
                  {' • Vencida'}
                  <AlertTriangle size={14} />
                </>
              ) : (
                ''
              )}
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
          {/*Barra de progreso*/}
                    {/* INICIO DE BARRA DE PROGRESO */}
          <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>
              <span>Progreso de la actividad</span>
              <span>{Math.round(progress_percentage)}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{
                  height: '100%',
                  backgroundColor: progress_percentage === 100 ? '#10b981' : '#3b82f6',
                  width: `${progress_percentage}%`,
                  transition: 'width 0.5s ease-in-out'
                }}
              />
            </div>
          </div>
          {/* FIN DE BARRA DE PROGRESO */}

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
};

export default TaskInfoCard;
