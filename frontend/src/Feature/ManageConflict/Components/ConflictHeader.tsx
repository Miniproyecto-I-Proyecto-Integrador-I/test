import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConflictHeaderProps {
  isNewTask: boolean;
  conflictDate: string;
  resolved?: boolean;
}

const ConflictHeader: React.FC<ConflictHeaderProps> = ({
  isNewTask,
  conflictDate,
  resolved = false,
}) => {
  const [year, month, day] = conflictDate.split('-').map(Number);
  const formattedDate = new Date(year, month - 1, day).toLocaleDateString(
    'es-ES',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    },
  );

  const subtitle = isNewTask
    ? 'Ajusta la duración o la fecha de las tareas existentes para que quepan en tu jornada junto con la nueva tarea.'
    : 'El día tiene más horas planificadas de las disponibles. Ajusta la duración o reactiva las tareas a otro día para resolver el conflicto.';

  return (
    <div className="conflict-header">
      <div
        className={`conflict-header__back${resolved ? ' conflict-header__back--resolved' : ''}`}
      >
        <AlertTriangle size={13} />
        {resolved ? 'Conflicto resuelto' : 'Conflicto detectado'}
      </div>
      <h1 className="conflict-header__title">Resolver conflicto de tareas</h1>
      <p className="conflict-header__subtitle">
        <strong style={{ fontWeight: 600 }}>
          {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
        </strong>
        {' — '}
        {subtitle}
      </p>
    </div>
  );
};

export default ConflictHeader;
