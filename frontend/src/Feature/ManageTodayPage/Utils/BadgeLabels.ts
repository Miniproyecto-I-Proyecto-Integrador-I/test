import type { Subtask } from '../Types/models'

export type CardVariant = 'overdue' | 'today' | 'upcoming'

/**
 * Builds the short badge label shown on the right side of a task row (CardTask).
 *  - overdue  → "Hace 1d" / "Hace Xd"
 *  - today    → "Xm" / "Xh"
 *  - upcoming → "Mañana" / weekday abbreviation (e.g. "Mié")
 */
export function buildBadgeLabel(variant: CardVariant, sub: Subtask): string {
  const date = sub.planification_date

  if (variant === 'overdue') {
    const diffMs = Date.now() - new Date(date + 'T00:00:00').getTime()
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24))
    return days <= 1 ? 'Hace 1d' : `Hace ${days}d`
  }

  if (variant === 'today') {
    const hrs = sub.needed_hours
    if (hrs < 1) return `${Math.round(hrs * 60)}m`
    return `${hrs}h`
  }

  // upcoming → weekday abbreviation or "Mañana"
  const d = new Date(date + 'T00:00:00')
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (d.toDateString() === tomorrow.toDateString()) return 'Mañana'

  return d
    .toLocaleDateString('es-ES', { weekday: 'short' })
    .replace('.', '')
    .replace(/^\w/, c => c.toUpperCase())
}

/**
 * Builds the longer footer label shown inside a StatusCard.
 *  - overdue  → "Hace 1 día" / "Hace X días"
 *  - today    → "X min" / "X h"
 *  - upcoming → "Mañana, 08:00 AM" / formatted short date (e.g. "6 mar")
 */
export function buildFooterLabel(variant: CardVariant, subtask: Subtask): string {
  const date = subtask.planification_date

  if (variant === 'overdue') {
    const diffMs = Date.now() - new Date(date).getTime()
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24))
    return days === 1 ? 'Hace 1 día' : `Hace ${days} días`
  }

  if (variant === 'today') {
    const hrs = subtask.needed_hours
    if (hrs < 1) return `${Math.round(hrs * 60)} min`
    return `${hrs} h`
  }

  // upcoming
  const d = new Date(date + 'T00:00:00')
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (d.toDateString() === tomorrow.toDateString()) return 'Mañana'

  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}
