import React from 'react'
import type { Subtask } from '../Types/models';
import StatusCard from './StatusCard';
import '../Styles/StatusCardStyles.css';

interface StatusCardGridProps {
  defeatedSubTask?: Subtask;
  todaySubTask?: Subtask;
  nextSubTask?: Subtask;
  viewOptions?: { overdue: boolean; today: boolean; upcoming: boolean };
  onSubtaskClick?: (sub: Subtask) => void;
}

const StatusCardGrid: React.FC<StatusCardGridProps> = ({
  defeatedSubTask,
  todaySubTask,
  nextSubTask,
  viewOptions = { overdue: true, today: true, upcoming: true },
  onSubtaskClick,
}) => {
  return (
    <div className="status-card-grid">
      {/* Column 1 — Most overdue */}
      {viewOptions.overdue && (
        <StatusCard
          subtask={defeatedSubTask}
          message="Vencida · Más antigua"
          variant="overdue"
          onClick={defeatedSubTask ? () => onSubtaskClick?.(defeatedSubTask) : undefined}
        />
      )}

      {/* Column 2 — Today */}
      {viewOptions.today && (
        <StatusCard
          subtask={todaySubTask}
          message="Hoy · Rápida de completar"
          variant="today"
          onClick={todaySubTask ? () => onSubtaskClick?.(todaySubTask) : undefined}
        />
      )}

      {/* Column 3 — Upcoming */}
      {viewOptions.upcoming && (
        <StatusCard
          subtask={nextSubTask}
          message="Próxima · La más cercana"
          variant="upcoming"
          onClick={nextSubTask ? () => onSubtaskClick?.(nextSubTask) : undefined}
        />
      )}
    </div>
  )
}

export default StatusCardGrid