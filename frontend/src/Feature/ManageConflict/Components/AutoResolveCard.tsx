import React from 'react';
import { Lightbulb } from 'lucide-react';

interface AutoResolveCardProps {
  overflowHours: number;
  newTaskHours?: number;
  totalTasksCount: number;
  maxHours: number;
}

const AutoResolveCard: React.FC<AutoResolveCardProps> = ({
  overflowHours,
  newTaskHours,
  totalTasksCount,
  maxHours
}) => {
  const equalHours = Math.floor(maxHours / totalTasksCount);
  const canDistributeEqually = equalHours >= 1;
  const targetNewTaskHours = newTaskHours ? newTaskHours - overflowHours : 0;
  const canReduceNewTask = targetNewTaskHours >= 1;

  return (
    <div className="conflict-autoresolve">
      <Lightbulb size={18} className="conflict-autoresolve__icon" />
      <div className="conflict-autoresolve__body">
        <p className="conflict-autoresolve__label">Sugerencia inteligente</p>
        <div className="conflict-autoresolve__desc">
          <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {canReduceNewTask && (
              <li>
                Reduce el tiempo de la actividad en edición a <strong>{targetNewTaskHours}h</strong> (una reducción de {overflowHours}h).
              </li>
            )}
            {canDistributeEqually && totalTasksCount > 1 && (
              <li>
                Asigna <strong>{equalHours}h</strong> a cada una de las {totalTasksCount} actividades del día.
              </li>
            )}
            {!canReduceNewTask && (!canDistributeEqually || totalTasksCount <= 1) && (
              <li>
                Mueve algunas tareas a otro día utilizando el calendario.
              </li>
            )}
            {/* Always show this generic advice as the user requested */}
            <li>Recuerda que puedes usar horas decimales.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AutoResolveCard;
