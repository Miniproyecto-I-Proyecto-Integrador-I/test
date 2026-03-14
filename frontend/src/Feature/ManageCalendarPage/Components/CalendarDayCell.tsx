import { LayoutGrid, Clock } from 'lucide-react';
import type { DaySummary } from '../Types/calendarTypes';
import '../Styles/CalendarDayCell.css';

interface CalendarDayCellProps {
  summary: DaySummary;
}

/** Renders the task-count + hours badges inside a calendar cell. */
const CalendarDayCell = ({ summary }: CalendarDayCellProps) => (
  <div className="cdc">
    <span className="cdc__badge cdc__badge--tasks">
      <LayoutGrid size={12} />
      {summary.count}
    </span>
    <span className="cdc__badge cdc__badge--hours">
      <Clock size={12} />
      {summary.totalHours}h
    </span>
  </div>
);

/** Skeleton shown while data is loading. */
export const CalendarDayCellSkeleton = ({
  fading = false,
}: {
  fading?: boolean;
}) => (
  <div className={`cdc-skeleton${fading ? ' cdc-skeleton--fading' : ''}`}>
    <div className="cdc-skeleton__bar" />
    <div className="cdc-skeleton__bar" />
  </div>
);

export default CalendarDayCell;
