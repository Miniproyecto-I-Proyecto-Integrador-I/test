import React from 'react';
import { AlertTriangle } from 'lucide-react';
import '../Styles/OverdueTasksAlert.css';

interface OverdueTasksAlertProps {
  count: number;
  onSolve: () => void;
}

const OverdueTasksAlert: React.FC<OverdueTasksAlertProps> = ({ count, onSolve }) => {
  if (count <= 0) return null;

  return (
    <div className="overdue-alert-container">
      <div className="overdue-alert-main">
        <div className="overdue-alert-icon-wrapper">
          <AlertTriangle size={20} className="overdue-alert-icon" />
        </div>
        <div className="overdue-alert-content">
          <h3 className="overdue-alert-title">Tienes {count} actividades vencidas</h3>
          <p className="overdue-alert-subtitle">Tu progreso semanal podría verse afectado.</p>
        </div>
      </div>
      <button className="overdue-alert-button" onClick={onSolve}>
        Solucionar ahora
      </button>
    </div>
  );
};

export default OverdueTasksAlert;
