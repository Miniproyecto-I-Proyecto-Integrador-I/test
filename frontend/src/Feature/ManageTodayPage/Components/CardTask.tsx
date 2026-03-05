import React, { useState } from 'react'
import type { Subtask } from '../Types/models'
import { buildBadgeLabel, type CardVariant } from '../Utils/BadgeLabels'
import '../Styles/CardTasks.css'

interface CardTaskProps {
  sub: Subtask
  variant: CardVariant
  onClick: () => void
}

/* ── Component ───────────────────────────────────────────── */

const CardTask: React.FC<CardTaskProps> = ({ sub, variant, onClick }) => {
  const [checked, setChecked] = useState(sub.status === 'completed')

  const subject = sub.task?.subject === '' || !sub.task?.subject
    ? 'No asignado'
    : sub.task.subject

  const badgeLabel = buildBadgeLabel(variant, sub)

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()          // don't bubble to card click
    setChecked(e.target.checked)
  }

  return (
    <div
      className={`task-card${checked ? ' task-card--done' : ''}`}
      onClick={onClick}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        className="task-card__check"
        checked={checked}
        onChange={handleCheckChange}
        onClick={e => e.stopPropagation()}
        aria-label={`Marcar "${sub.description}" como completada`}
      />

      {/* Title + subject */}
      <div className="task-card__body">
        <p className="task-card__title">{sub.description}</p>
        <p className="task-card__subject">{subject}</p>
      </div>

      {/* Right-side badge */}
      <span className="task-card__badge">{badgeLabel}</span>
    </div>
  )
}

export default CardTask