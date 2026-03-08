import React from 'react';
import {Clock } from 'lucide-react';
import { useAuth } from '../../../Context/AuthContext';
/* import InfoTooltip from '../../../shared/Components/InfoTooltip'; */
import '../Styles/TodaySummaryCard.css';

interface TodaySummaryCardProps {
  pendingCount: number;
  totalNeededHours: number;
}

const TodaySummaryCard: React.FC<TodaySummaryCardProps> = ({ pendingCount, totalNeededHours }) => {
  const { user } = useAuth();
  
  // Utiliza las horas diarias del usuario o un valor por defecto (ej. 8 horas)
  const dailyHoursLimit = user?.daily_hours || 8; 
  const percentage = Math.min(100, Math.round((totalNeededHours / dailyHoursLimit) * 100)) || 0;

  return (
    <div className="summary-card-container">
      <h3 className="summary-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
         Resumen de hoy
      </h3>
      
      <div className="summary-stats-grid">
        <div className="summary-stat-box">
          <span className="summary-stat-value">{pendingCount}</span>
          <span className="summary-stat-label">Actividades<br/>Pendientes</span>
        </div>
        <div className="summary-stat-box">
          <span className="summary-stat-value">{totalNeededHours}h</span>
          <span className="summary-stat-label">Carga total<br/>Estimada</span>
        </div>
      </div>

      <div className="summary-progress-section">
        <div className="summary-progress-header">
          <span className="summary-progress-label">
            <Clock size={14} /> Tu capacidad diaria normal ({dailyHoursLimit}h)
          </span>
          <span className="summary-progress-percentage">{percentage}%</span>
        </div>
        <div className="summary-progress-bar-bg">
          <div 
            className="summary-progress-bar-fill" 
            style={{ 
              width: `${percentage}%`,
              backgroundColor: percentage >= 100 ? 'var(--error-color)' : percentage > 80 ? 'var(--warning-color)' : 'var(--primary-color)'
            }} 
          ></div>
        </div>
        <p className="summary-progress-hint">
          {percentage >= 100 
            ? "Peligro: El tiempo estimado para hoy satura tu límite de horas diarias (o lo excede)." 
            : percentage > 80 
              ? "Cuidado: Te aproximas bastante a tu disponibilidad de tiempo máxima diaria." 
              : "Ideal: La cantidad de trabajo encaja perfectamente en tu margen diario de horas."}
        </p>
      </div>
    </div>
  );
};

export default TodaySummaryCard;
