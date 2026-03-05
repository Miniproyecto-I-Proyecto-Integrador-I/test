import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Plus } from 'lucide-react';

const EmptyState: React.FC = () => {
    const navigate = useNavigate();
    
    return (
        <div className="today-empty-state">
            <div className="empty-state-visual">
                <div className="empty-state-bubble empty-state-bubble-outer"></div>
                <div className="empty-state-bubble empty-state-bubble-inner"></div>
                <div className="empty-state-icon-wrapper">
                    <Check className="empty-state-icon" size={48} strokeWidth={2.5} />
                </div>
                {/* Acentos / brillos flotantes según el diseño */}
                <div className="empty-state-accent accent-top-right"></div>
                <div className="empty-state-accent accent-bottom-left"></div>
            </div>
            
            <h2 className="empty-state-title">¡Estás al día!</h2>
            <p className="empty-state-text">
                No tienes tareas pendientes para estas categorías. Aprovecha para<br />
                descansar o planificar tu próxima meta.
            </p>
            
            <button className="btn-primary empty-state-btn" onClick={() => navigate('/create')}>
                <Plus size={18} strokeWidth={2.5} />
                Crear nueva tarea
            </button>
        </div>
    )
}

export default EmptyState;