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
        <label>Título de la tarea</label>
        <input
          type="text"
          value={taskEditData.title}
          onChange={(e) => onFieldChange('title', e.target.value)}
          maxLength={200}
        />
      </div>

      <div className="subtask-edit-task-form-group full-width">
        <label>Descripción</label>
        <textarea
          value={taskEditData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          maxLength={500}
          rows={3}
        />
      </div>

      <div className="subtask-edit-task-form-group">
        <label>Materia</label>
        <input
          type="text"
          value={taskEditData.subject}
          onChange={(e) => onFieldChange('subject', e.target.value)}
          maxLength={100}
        />
      </div>

      <div className="subtask-edit-task-form-group">
        <label>Tipo de evaluación</label>
        <select
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
        <label>Fecha de entrega</label>
        <input
          type="date"
          min={getTodayDateStr()}
          value={taskEditData.due_date}
          onChange={(e) => onFieldChange('due_date', e.target.value)}
        />
      </div>

      <div className="subtask-edit-task-form-group">
        <label>Nivel de prioridad</label>
        <select
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
      <button
        type="button"
        className="subtask-edit-cancel"
        onClick={onCancel}
      >
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
