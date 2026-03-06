import React from 'react'
import type {Subtask} from '../Types/models'

interface selectedSubtask {
    onClose: () => void ;
    selectedSubtask: Subtask
}

const SelectedSubtask: React.FC<selectedSubtask> = ({
    onClose,
    selectedSubtask
}) => {
  return (
    <div className="modal-overlay" onClick={() => onClose()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => onClose()}
            >
              ×
            </button>

            <div className="modal-header">
              <h2>{selectedSubtask.description}</h2>
              <div className="modal-tags">
                <span className="tag status-tag">
                  Estado: {selectedSubtask.status}
                </span>
                <span className="tag time-tag">
                  Horas necesarias: {selectedSubtask.needed_hours}
                </span>
              </div>
            </div>

            {selectedSubtask.task && (
              <div className="parent-task-info">
                <h3>Información de la Tarea Principal</h3>

                <div className="info-grid">
                  <div className="info-item">
                    <strong>Título:</strong>
                    <span>{selectedSubtask.task.title}</span>
                  </div>
                  <div className="info-item">
                    <strong>Estado:</strong>
                    <span>{selectedSubtask.task.status}</span>
                  </div>
                  {selectedSubtask.task.priority && (
                    <div className="info-item">
                      <strong>Prioridad:</strong>
                      <span
                        className={`priority ${selectedSubtask.task.priority}`}
                      >
                        {selectedSubtask.task.priority}
                      </span>
                    </div>
                  )}
                  {selectedSubtask.task.subject && (
                    <div className="info-item">
                      <strong>Materia:</strong>
                      <span>{selectedSubtask.task.subject}</span>
                    </div>
                  )}
                  {selectedSubtask.task.type && (
                    <div className="info-item">
                      <strong>Tipo:</strong>
                      <span>{selectedSubtask.task.type}</span>
                    </div>
                  )}
                  {selectedSubtask.task.due_date && (
                    <div className="info-item">
                      <strong>Fecha de entrega:</strong>
                      <span>
                        {new Date(
                          selectedSubtask.task.due_date,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {selectedSubtask.task.description && (
                  <div className="info-item full-width">
                    <strong>Descripción de la tarea:</strong>
                    <p>{selectedSubtask.task.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
)}

export default SelectedSubtask