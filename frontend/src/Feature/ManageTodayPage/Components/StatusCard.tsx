import React from 'react'
import { AlertCircle, Clock, CalendarDays } from 'lucide-react'
import type { Subtask } from '../Types/models'
import '../Styles/StatusCardStyles.css'

/* ── Types ─────────────────────────────────────────────── */

type Variant = 'overdue' | 'today' | 'upcoming'

interface StatusCardProps {
  subtask?: Subtask
  message: string
  variant: Variant
}

/* ── Helpers ────────────────────────────────────────────── */

/**
 * Returns a human-friendly footer string based on the variant
 * and the subtask's planification_date / needed_hours.
 */
function buildFooterLabel(variant: Variant, subtask: Subtask): string {
  const date = subtask.planification_date   // "YYYY-MM-DD"

  if (variant === 'overdue') {
    // Calculate how many days ago
    const diffMs = Date.now() - new Date(date).getTime()
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24))
    return days === 1 ? 'Hace 1 día' : `Hace ${days} días`
  }

  if (variant === 'today') {
    const hrs = subtask.needed_hours
    if (hrs < 1) return `${Math.round(hrs * 60)} min`
    return `${hrs} h`
  }

  // upcoming → show formatted date
  const d = new Date(date + 'T00:00:00')
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (d.toDateString() === tomorrow.toDateString()) {
    return 'Mañana, 08:00 AM'
  }
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function FooterIcon({ variant }: { variant: Variant }) {
  if (variant === 'overdue') return <AlertCircle size={15} />
  if (variant === 'today') return <Clock size={15} />
  return <CalendarDays size={15} />
}

/* ── Component ──────────────────────────────────────────── */

const StatusCard: React.FC<StatusCardProps> = ({ subtask, message, variant }) => {
  // Empty state: render nothing so flex siblings expand
  if (!subtask) {
    return <div className="status-card--empty" aria-hidden="true" />
  }

  const subject = subtask.task?.subject == '' ? 'No asignado' : subtask.task?.subject
  const footerLabel = buildFooterLabel(variant, subtask)

  return (
    <div className={`status-card status-card--${variant}`}>
      {/* Badge */}
      <p className="status-card__badge">{message}</p>

      {/* Title = subtask description */}
      <h3 className="status-card__title" title={subtask.description}>
        {subtask.description}
      </h3>

      {/* Subject from the parent task */}
      <p className="status-card__subject">Curso: {subject}</p>

      {/* Footer with icon + contextual label */}
      <div className="status-card__footer">
        <FooterIcon variant={variant} />
        <span>{footerLabel}</span>
      </div>
    </div>
  )
}

export default StatusCard