import React from 'react'
import { AlertCircle, Clock, CalendarDays } from 'lucide-react'
import type { Subtask } from '../Types/models'
import { buildFooterLabel, type CardVariant } from '../Utils/BadgeLabels'
import '../Styles/StatusCardStyles.css'

/* ── Types ─────────────────────────────────────────────── */

interface StatusCardProps {
  subtask?: Subtask
  message: string
  variant: CardVariant
  onClick?: () => void
}

/* ── Helpers ────────────────────────────────────────────── */

function FooterIcon({ variant }: { variant: CardVariant }) {
  if (variant === 'overdue') return <AlertCircle size={15} />
  if (variant === 'today') return <Clock size={15} />
  return <CalendarDays size={15} />
}

/* ── Component ──────────────────────────────────────────── */

const StatusCard: React.FC<StatusCardProps> = ({ subtask, message, variant, onClick }) => {
  // Empty state: render nothing so flex siblings expand
  if (!subtask) {
    return <div className="status-card--empty" aria-hidden="true" />
  }

  const parentTaskTitle = subtask.task?.title || 'Sin tarea principal'
  const footerLabel = buildFooterLabel(variant, subtask)

  return (
    <div 
      className={`status-card status-card--${variant}`}
      onClick={onClick}
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
  )
}

export default StatusCard