import React from 'react';
import { AlertCircle, Clock, CalendarDays } from 'lucide-react';
import type { Subtask } from '../Types/models';
import { buildFooterLabel, type CardVariant } from '../Utils/BadgeLabels';
import '../Styles/StatusCardStyles.css';

/* ── Types ─────────────────────────────────────────────── */

interface StatusCardProps {
  subtask?: Subtask;
  message: string;
  variant: CardVariant;
  onClick?: () => void;
}

/* ── Helpers ────────────────────────────────────────────── */

function FooterIcon({ variant }: { variant: CardVariant }) {
  if (variant === 'overdue')
    return <AlertCircle size={15} aria-hidden="true" />;
  if (variant === 'today') return <Clock size={15} aria-hidden="true" />;
  return <CalendarDays size={15} aria-hidden="true" />;
}

/* ── Component ──────────────────────────────────────────── */

const StatusCard: React.FC<StatusCardProps> = ({
  subtask,
  message,
  variant,
  onClick,
}) => {
  // Empty state: render nothing so flex siblings expand
  if (!subtask) {
    return <div className="status-card--empty" aria-hidden="true" />;
  }

  const parentTaskTitle = subtask.task?.title || 'Sin tarea principal';
  const footerLabel = buildFooterLabel(variant, subtask);
  const isClickable = Boolean(onClick);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isClickable) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={`status-card status-card--${variant}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={
        isClickable ? `Abrir subtarea ${subtask.description}` : undefined
      }
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Badge */}
      <p className="status-card__badge">{message}</p>

      {/* Title = subtask description */}
      <h3 className="status-card__title" title={subtask.description}>
        {subtask.description}
      </h3>

      <div className="status-card__info-row">
        <p className="status-card__parent-task">{parentTaskTitle}</p>
      </div>

      {/* Footer with icon + contextual label */}
      <div className="status-card__footer">
        <FooterIcon variant={variant} />
        <span>{footerLabel}</span>
      </div>
    </div>
  );
};

export default StatusCard;
