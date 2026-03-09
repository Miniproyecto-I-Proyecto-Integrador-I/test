import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Plus, AlertCircle, CalendarClock } from 'lucide-react';

interface EmptyStateProps {
  hiddenOverdueCount?: number;
  hiddenUpcomingCount?: number;
  onViewOverdue?: () => void;
  onViewUpcoming?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  hiddenOverdueCount = 0,
  hiddenUpcomingCount = 0,
  onViewOverdue,
  onViewUpcoming
}) => {
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
                No tienes actividades pendientes en esta vista. Aprovecha para<br />
                descansar o planificar tu próxima meta.
            </p>
            
            <button className="btn-primary empty-state-btn" onClick={() => navigate('/create')}>
                <Plus size={18} strokeWidth={2.5} />
                Crear nueva actividad
            </button>

            {(hiddenOverdueCount > 0 || hiddenUpcomingCount > 0) && (
                <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {hiddenOverdueCount > 0 && (
                        <button 
                            className="empty-state-hidden-btn overdue-btn"
                            onClick={onViewOverdue}
                        >
                            <AlertCircle size={16} />
                            Tienes {hiddenOverdueCount} {hiddenOverdueCount === 1 ? 'tarea vencida' : 'tareas vencidas'}
                        </button>
                    )}
                    {hiddenUpcomingCount > 0 && (
                        <button 
                            className="empty-state-hidden-btn upcoming-btn"
                            onClick={onViewUpcoming}
                        >
                            <CalendarClock size={16} />
                            Tienes {hiddenUpcomingCount} {hiddenUpcomingCount === 1 ? 'tarea próxima' : 'tareas próximas'}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default EmptyState;