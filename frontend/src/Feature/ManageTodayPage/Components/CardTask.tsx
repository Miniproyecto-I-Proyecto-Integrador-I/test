import React, { useState } from 'react'
import { Clock, Calendar } from 'lucide-react'
import type { Subtask } from '../Types/models'
import { buildBadgeLabel, type CardVariant } from '../Utils/BadgeLabels'
import '../Styles/CardTasks.css'

interface CardTaskProps {
  sub: Subtask
  variant: CardVariant
  onClick: () => void
}

const CardTask: React.FC<CardTaskProps> = ({ sub, variant, onClick }) => {
  const [checked, setChecked] = useState(sub.status === 'completed')

  const parentTaskTitle = sub.task?.title || 'Sin tarea asiganda'
  const timeInfo = sub.needed_hours ? `${sub.needed_hours}h` : ''
  const badgeLabel = buildBadgeLabel(variant, sub)

  let displayTimeInfo = timeInfo
  if (variant === 'overdue' && sub.planification_date) {
    const formattedDate = new Date(sub.planification_date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    displayTimeInfo = timeInfo ? `${timeInfo} • ${formattedDate}` : formattedDate
  }

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    setChecked(e.target.checked)
  }

  return (
    <div
      className={`task-card${checked ? ' task-card--done' : ''}`}
      onClick={onClick}
    >
      {variant !== 'overdue' && (
        <input
          type="checkbox"
          className="task-card__check"
          checked={checked}
          onChange={handleCheckChange}
          onClick={e => e.stopPropagation()}
          aria-label={`Marcar "${sub.description}" como completada`}
        />
      )}

      <div className="task-card__body">
        <p className="task-card__title">{sub.description}</p>
        
        {variant === 'overdue' ? (
          <div className="task-card__info-col">
            <p className="task-card__parent-task">{parentTaskTitle}</p>
            <span className="task-card__badge">
              <Clock size={13} />
              {displayTimeInfo || badgeLabel}
            </span>
          </div>
        ) : (
          <div className="task-card__info-row">
            <p className="task-card__parent-task">{parentTaskTitle}</p>
            <span className="task-card__badge">
              {variant === 'upcoming' ? <Calendar size={13} /> : <Clock size={13} />}
              {timeInfo || badgeLabel}
            </span>
          </div>
        )}
      </div>

      {variant === 'overdue' && (
        <div className="task-card__actions" onClick={e => e.stopPropagation()}>
          <button 
            className="task-card__action-btn archive-btn"
            onClick={(e) => { e.stopPropagation(); setChecked(true); }}
            aria-label={`Archivar "${sub.description}"`}
          >
            Archivar
          </button>
          <button 
            className="task-card__action-btn reschedule-btn"
            onClick={(e) => { e.stopPropagation(); }}
            aria-label={`Reprogramar "${sub.description}"`}
          >
            Reprogramar
          </button>
        </div>
      )}
    </div>
  )
}

export default CardTask