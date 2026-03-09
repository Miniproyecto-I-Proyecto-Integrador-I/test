import React, { useEffect, useMemo, useState } from 'react';
import { Trash2, Edit2, Calendar, Clock, FileText, X, Check } from 'lucide-react';
import { useSubtaskEdit, type EditableSubtask } from '../Hooks/useSubtaskEdit';
import BackButton from '../../ManageCreatePage/Components/BackButton';
import {
  formatShortDate,
  formatTaskDueDate,
  formatHours,
  getPriorityLabel,
  getTodayDateStr,
} from '../Utils/subtaskEditUtils';
import '../Styles/SubtaskEdit.css';

interface SubtaskEditProps {
  taskId: number;
  initialSubtasks: EditableSubtask[];
  onSubtasksChange?: (subtasks: EditableSubtask[]) => void;
  onSaveChanges?: (subtasks: EditableSubtask[]) => Promise<void> | void;
  onDeleteSubtask?: (subtask: EditableSubtask) => Promise<void> | void;
  onTaskDeleted?: () => void;
  onClose?: () => void;
  onAddNewSubtask?: () => void;
  onSaveTask?: (taskData: any) => Promise<void> | void;
  taskTitle?: string;
  taskDueDate?: string;
  totalHours?: number;
  task?: {
    id: number;
    title: string;
    description?: string;
    subject?: string;
    type?: string;
    priority?: string;
    due_date?: string;
  };
}

const SubtaskEdit: React.FC<SubtaskEditProps> = ({
  taskId,
  initialSubtasks,
  onSubtasksChange,
  onSaveChanges,
  onDeleteSubtask,
  onTaskDeleted,
  onClose,
  onAddNewSubtask,
  onSaveTask,
  taskTitle = 'Ensayo sobre la Revolución Francesa',
  taskDueDate,
  totalHours,
  task,
}) => {
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [taskEditData, setTaskEditData] = useState({
    title: task?.title || taskTitle || '',
    description: task?.description || '',
    subject: task?.subject || '',
    type: task?.type || '',
    priority: task?.priority || 'medium',
    due_date: (task?.due_date || taskDueDate || '').split('T')[0],
  });

  const {
    subtasks,
    editingId,
    editData,
    errors,
    isSaving,
    isDeleting,
    deleteTarget,
    startEditing,
    cancelEditing,
    handleEditFieldChange,
    saveEditedSubtask,
    openDeleteSubtaskModal,
    openDeleteMainTaskModal,
    closeDeleteModal,
    confirmDelete,
    handleSaveChanges,
    setSubtasks,
  } = useSubtaskEdit({
    taskId,
    initialSubtasks,
    onSubtasksChange,
    onSaveChanges,
    onDeleteSubtask,
    onTaskDeleted,
    onClose,
  });

  // Store a stringified version of initial subtasks to prevent unnecessary resets
  const initialSubtasksStr = useMemo(() => JSON.stringify(initialSubtasks ?? []), [initialSubtasks]);

  useEffect(() => {
    const parsed = JSON.parse(initialSubtasksStr);
    setSubtasks(parsed);
    cancelEditing();
  }, [initialSubtasksStr, setSubtasks, cancelEditing]);

  const computedTotalHours = useMemo(() => {
    if (typeof totalHours === 'number') return totalHours;
    return subtasks.reduce((acc, item) => acc + (Number(item.needed_hours) || 0), 0);
  }, [subtasks, totalHours]);

  const handleTaskEditFieldChange = (field: string, value: string) => {
    setTaskEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveTaskChanges = async () => {
    if (!onSaveTask) return;
    setIsSavingTask(true);
    try {
      let formattedDate = taskEditData.due_date;
      if (formattedDate && !formattedDate.includes('T')) {
        formattedDate = `${formattedDate}T23:59:59Z`;
      }
      await onSaveTask({
        ...taskEditData,
        due_date: formattedDate,
      });
      setIsEditingTask(false);
    } catch (error) {
      console.error('Error al guardar cambios de la tarea:', error);
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleCancelTaskEdit = () => {
    setIsEditingTask(false);
    setTaskEditData({
      title: task?.title || taskTitle || '',
      description: task?.description || '',
      subject: task?.subject || '',
      type: task?.type || '',
      priority: task?.priority || 'medium',
      due_date: (task?.due_date || taskDueDate || '').split('T')[0],
    });
  };

  return (
    <div className="subtask-edit-wrapper">
      <BackButton 
        onClick={isEditingTask ? handleCancelTaskEdit : onClose} 
        label={isEditingTask ? "Volver sin editar" : "Volver a inicio"}
      />
      <div className="subtask-edit-container">
        {!isEditingTask ? (
          <>
            <div className="subtask-edit-task-row">
              <div>
                <div className="subtask-edit-task-header-row">
                  <h2 className="subtask-edit-title">{taskEditData.title}</h2>
                  <div className="subtask-edit-buttons-group">
                    <button
                      type="button"
                      className="subtask-edit-edit-main"
                      onClick={() => setIsEditingTask(true)}
                    >
                      <Edit2 size={16} />
                      <span>Editar Tarea</span>
                    </button>
                    <button
                      type="button"
                      className="subtask-edit-delete-main"
                      onClick={openDeleteMainTaskModal}
                    >
                      <Trash2 size={16} />
                      <span>Eliminar Tarea</span>
                    </button>
                  </div>
                </div>
                <div className="subtask-edit-meta">
                  <span className="subtask-edit-category">{getPriorityLabel(taskEditData.priority)}</span>
                  <span className="subtask-edit-meta-item">
                    <Calendar size={16} />
                    Fecha: {formatTaskDueDate(taskEditData.due_date)}
                  </span>
                  <span className="subtask-edit-meta-item">
                    <Clock size={16} />
                    {computedTotalHours.toFixed(1)} Horas totales
                  </span>
                </div>
              </div>
            </div>

            <section className="subtask-edit-list-section">
              <h3 className="subtask-edit-section-title">Actividades de la tarea</h3>

              <div className="subtask-edit-list">
                {subtasks.length === 0 ? (
                  <div className="subtask-edit-empty-state">
                    <FileText size={56} className="subtask-edit-empty-icon" strokeWidth={1.5} />
                    <p className="subtask-edit-empty-text">No hay subtareas creadas</p>
                    <p className="subtask-edit-empty-hint">
                      Agrega un nuevo paso para comenzar a organizar tu tarea
                    </p>
                  </div>
                ) : (
                  subtasks.map((subtask) => {
                    const isEditing = editingId === subtask.id;
                    return (
                      <div
                        key={subtask.id}
                        className={`subtask-edit-item ${isEditing ? 'is-editing' : ''}`}
                      >
                        {!isEditing ? (
                          <>
                            <div className="subtask-edit-item-left">
                              <span className="subtask-edit-item-circle" aria-hidden="true" />
                              <div className="subtask-edit-item-content">
                                <p className="subtask-edit-item-title">{subtask.description}</p>
                                <p className="subtask-edit-item-meta">
                                  Fecha: {formatShortDate(subtask.planification_date)} • {formatHours(subtask.needed_hours)}
                                </p>
                              </div>
                            </div>
                            <div className="subtask-edit-item-actions">
                              <button
                                type="button"
                                className="subtask-edit-icon-btn"
                                onClick={() => startEditing(subtask)}
                                aria-label="Editar subtarea"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                type="button"
                                className="subtask-edit-icon-btn danger"
                                onClick={() => openDeleteSubtaskModal(subtask)}
                                aria-label="Eliminar subtarea"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div
                            className="subtask-edit-inline-form"
                            role="group"
                            aria-label="Editar subtarea"
                          >
                            <div className="subtask-edit-input-group grow">
                              <label>Descripción</label>
                              <input
                                type="text"
                                value={editData.description}
                                onChange={(e) => handleEditFieldChange('description', e.target.value)}
                                className={errors.description ? 'error' : ''}
                                maxLength={300}
                              />
                              {errors.description && (
                                <span className="subtask-edit-error">{errors.description}</span>
                              )}
                            </div>

                            <div className="subtask-edit-input-group">
                              <label>Fecha</label>
                              <input
                                type="date"
                                min={getTodayDateStr()}
                                max={taskEditData.due_date}
                                value={editData.planification_date}
                                onChange={(e) => handleEditFieldChange('planification_date', e.target.value)}
                                className={errors.planification_date ? 'error' : ''}
                              />
                              {errors.planification_date && (
                                <span className="subtask-edit-error">{errors.planification_date}</span>
                              )}
                            </div>

                            <div className="subtask-edit-input-group small">
                              <label>Horas</label>
                              <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={editData.needed_hours || ''}
                                onChange={(e) => handleEditFieldChange('needed_hours', parseFloat(e.target.value) || 0)}
                                className={errors.needed_hours ? 'error' : ''}
                              />
                              {errors.needed_hours && (
                                <span className="subtask-edit-error">{errors.needed_hours}</span>
                              )}
                            </div>

                            <div className="subtask-edit-inline-actions">
                              <button
                                type="button"
                                className="subtask-edit-round-btn"
                                onClick={cancelEditing}
                                aria-label="Cancelar edición"
                              >
                                <X size={14} />
                              </button>
                              <button
                                type="button"
                                className="subtask-edit-round-btn success"
                                onClick={() => {
                                  if (taskEditData.due_date && editData.planification_date > taskEditData.due_date) {
                                    alert(`La fecha de la actividad no puede ser posterior a la fecha de entrega de la tarea (${taskEditData.due_date}).\nPor favor, selecciona una fecha anterior o igual.`);
                                    return;
                                  }
                                  saveEditedSubtask();
                                }}
                                aria-label="Guardar edición"
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {onAddNewSubtask && (
                <button
                  type="button"
                  className="subtask-edit-add-row"
                  onClick={onAddNewSubtask}
                >
                  + Agregar nuevo paso
                </button>
              )}
            </section>

            <footer className="subtask-edit-footer">
              <button
                type="button"
                className="subtask-edit-save"
                onClick={handleSaveChanges}
                disabled={isSaving || !onSaveChanges}
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </footer>
          </>
        ) : (
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
                  onChange={(e) => handleTaskEditFieldChange('title', e.target.value)}
                  maxLength={200}
                />
              </div>

              <div className="subtask-edit-task-form-group full-width">
                <label>Descripción</label>
                <textarea
                  value={taskEditData.description}
                  onChange={(e) => handleTaskEditFieldChange('description', e.target.value)}
                  maxLength={500}
                  rows={3}
                />
              </div>

              <div className="subtask-edit-task-form-group">
                <label>Materia</label>
                <input
                  type="text"
                  value={taskEditData.subject}
                  onChange={(e) => handleTaskEditFieldChange('subject', e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="subtask-edit-task-form-group">
                <label>Tipo de evaluación</label>
                <select
                  value={taskEditData.type}
                  onChange={(e) => handleTaskEditFieldChange('type', e.target.value)}
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
                  onChange={(e) => handleTaskEditFieldChange('due_date', e.target.value)}
                />
              </div>

              <div className="subtask-edit-task-form-group">
                <label>Nivel de prioridad</label>
                <select
                  value={taskEditData.priority}
                  onChange={(e) => handleTaskEditFieldChange('priority', e.target.value)}
                >
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
            </div>

            <footer className="subtask-edit-footer">
              <button type="button" className="subtask-edit-cancel" onClick={handleCancelTaskEdit}>
                Cancelar
              </button>
              <button
                type="button"
                className="subtask-edit-save"
                onClick={handleSaveTaskChanges}
                disabled={isSavingTask || !onSaveTask}
              >
                {isSavingTask ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </footer>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="subtask-edit-modal-overlay" role="dialog" aria-modal="true">
          <div className="subtask-edit-modal">
            <h4>
              {deleteTarget.type === 'main-task'
                ? '¿Eliminar tarea principal?'
                : '¿Eliminar esta subtarea?'}
            </h4>
            <p>
              {deleteTarget.type === 'main-task'
                ? 'Esta acción no se puede deshacer y eliminará la tarea completa.'
                : 'Esta acción no se puede deshacer y eliminará la subtarea seleccionada.'}
            </p>
            <div className="subtask-edit-modal-actions">
              <button type="button" className="subtask-edit-cancel" onClick={closeDeleteModal}>
                Cancelar
              </button>
              <button
                type="button"
                className="subtask-edit-delete-confirm"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubtaskEdit;
