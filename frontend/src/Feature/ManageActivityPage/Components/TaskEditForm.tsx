import React from 'react';
import { getTodayDateStr } from '../Utils/subtaskEditUtils';

interface TaskEditData {
  title: string;
  description: string;
  subject: string;
  type: string;
  priority: string;
  due_date: string;
}

interface TaskEditFormProps {
  taskEditData: TaskEditData;
  isSavingTask: boolean;
  onFieldChange: (field: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  hasSaveHandler: boolean;
}

const TaskEditForm: React.FC<TaskEditFormProps> = ({
  taskEditData,
  isSavingTask,
  onFieldChange,
  onSave,
  onCancel,
  hasSaveHandler,
}) => (
  <div className="subtask-edit-task-edit-form">
    <div className="subtask-edit-task-edit-header">
      <h2>Editar Tarea</h2>
    </div>

    <div className="subtask-edit-task-edit-grid">
      <div className="subtask-edit-task-form-group full-width">
        <label htmlFor="task-edit-title">Título de la tarea</label>
        <input
          id="task-edit-title"
          type="text"
          value={taskEditData.title}
          onChange={(e) => onFieldChange('title', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
          maxLength={200}
        />
      </div>

      <div className="subtask-edit-task-form-group full-width">
        <label htmlFor="task-edit-description">Descripción</label>
        <textarea
          id="task-edit-description"
          value={taskEditData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          maxLength={500}
          rows={3}
        />
      </div>

      <div className="subtask-edit-task-form-group">
        <label htmlFor="task-edit-subject">Materia</label>
        <input
          id="task-edit-subject"
          type="text"
          value={taskEditData.subject}
          onChange={(e) => onFieldChange('subject', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
          maxLength={100}
        />
      </div>

      <div className="subtask-edit-task-form-group">
        <label htmlFor="task-edit-type">Tipo de evaluación</label>
        <select
          id="task-edit-type"
          value={taskEditData.type}
          onChange={(e) => onFieldChange('type', e.target.value)}
        >
          <option value="">Seleccionar tipo</option>
          <option value="ensayo">Ensayo</option>
          <option value="examen">Examen</option>
          <option value="proyecto">Proyecto</option>
          <option value="tarea">Tarea</option>
          <option value="lectura">Lectura</option>
        </select>
      </div>

      <div className="subtask-edit-task-form-group">
        <label htmlFor="task-edit-due-date">Fecha de entrega</label>
        <input
          id="task-edit-due-date"
          type="date"
          min={getTodayDateStr()}
          value={taskEditData.due_date}
          onChange={(e) => onFieldChange('due_date', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
        />
      </div>

      <div className="subtask-edit-task-form-group">
        <label htmlFor="task-edit-priority">Nivel de prioridad</label>
        <select
          id="task-edit-priority"
          value={taskEditData.priority}
          onChange={(e) => onFieldChange('priority', e.target.value)}
        >
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
      </div>
    </div>

    <footer className="subtask-edit-footer">
      <button type="button" className="subtask-edit-cancel" onClick={onCancel}>
        Cancelar
      </button>
      <button
        type="button"
        className="subtask-edit-save"
        onClick={onSave}
        disabled={isSavingTask || !hasSaveHandler}
      >
        {isSavingTask ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </footer>
  </div>
);

export default TaskEditForm;
