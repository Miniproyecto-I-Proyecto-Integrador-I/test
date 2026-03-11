import React from 'react';
import { Lightbulb } from 'lucide-react';

interface AutoResolveCardProps {
  onAutoResolve: () => void;
}

const AutoResolveCard: React.FC<AutoResolveCardProps> = ({ onAutoResolve }) => {
  return (
    <div className="conflict-autoresolve">
      <Lightbulb size={18} className="conflict-autoresolve__icon" />
      <div className="conflict-autoresolve__body">
        <p className="conflict-autoresolve__label">Sugerencia inteligente</p>
        <p className="conflict-autoresolve__desc">
          Deja que el sistema reorganice automáticamente las tareas del día para
          liberar la agenda.
        </p>
        <button className="conflict-autoresolve__btn" onClick={onAutoResolve}>
          Resolver conflicto automáticamente &rsaquo;
        </button>
      </div>
    </div>
  );
};

export default AutoResolveCard;
