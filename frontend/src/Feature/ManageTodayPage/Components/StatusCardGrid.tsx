import React from 'react'
import type { Subtask } from '../Types/models';
import StatusCard from './StatusCard';
import '../Styles/StatusCardStyles.css';

interface StatusCardGridProps {
  defeatedSubTask?: Subtask;
  todaySubTask?: Subtask;
  nextSubTask?: Subtask;
  viewOptions?: { overdue: boolean; today: boolean; upcoming: boolean };
}

const StatusCardGrid: React.FC<StatusCardGridProps> = ({
  defeatedSubTask,
  todaySubTask,
  nextSubTask,
  viewOptions = { overdue: true, today: true, upcoming: true },
}) => {
  return (
    <div className="status-card-grid">
      {/* Column 1 — Most overdue */}
      {viewOptions.overdue && (
        <StatusCard
          subtask={defeatedSubTask}
          message="Más antigua"
          variant="overdue"
        />
      )}

      {/* Column 2 — Today */}
      {viewOptions.today && (
        <StatusCard
          subtask={todaySubTask}
          message="Hoy"
          variant="today"
        />
      )}

      {/* Column 3 — Upcoming */}
      {viewOptions.upcoming && (
        <StatusCard
          subtask={nextSubTask}
          message="Por venir"
          variant="upcoming"
        />
      )}
    </div>
  )
}

export default StatusCardGrid