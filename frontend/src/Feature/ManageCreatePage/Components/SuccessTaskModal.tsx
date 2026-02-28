import React from 'react';
import type { Task } from '../Types/taskTypes';
import { formatSpanishDate } from '../Utils/dateUtils';
import '../Styles/SuccessTaskModal.css';

interface SuccessTaskModalProps {
    task: Task;
    onNavigateToPanel: () => void;
    onAddSubtasks: () => void;
}

const SuccessTaskModal: React.FC<SuccessTaskModalProps> = ({ 
    task, 
    onNavigateToPanel, 
    onAddSubtasks 
}) => {
    return (
        <div className="success-state-container">
            <div className="success-icon-wrapper-large">
                <div className="success-icon-large">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
            
            <h2 className="success-title-large">¡Tarea creada exitosamente!</h2>
            <p className="success-subtitle-large">Tu tarea "{task.title}" ha sido guardada y añadida a tu plan de estudio.</p>

            <div className="success-details-pill">
                {task.subject && (
                    <>
                        <div className="pill-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            </svg>
                            <span>Materia: {task.subject}</span>
                        </div>
                        <div className="pill-divider"></div>
                    </>
                )}
                
                <div className="pill-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>Fecha: {task.due_date ? formatSpanishDate(task.due_date) : 'N/A'}</span>
                </div>

                {task.type && (
					<>
                        <div className="pill-divider"></div>
                        <div className="pill-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>Tipo: {task.type}</span>
                        </div>
					</>
				)}
            </div>

            <div className="success-footer-actions-large">
                <button className="btn-secondary-large" onClick={onNavigateToPanel}>
                    Volver al panel principal
                </button>
                <button className="btn-primary-large" onClick={onAddSubtasks}>
                    Añadir subtareas a esta actividad
                </button>
            </div>
        </div>
    );
};

export default SuccessTaskModal;
