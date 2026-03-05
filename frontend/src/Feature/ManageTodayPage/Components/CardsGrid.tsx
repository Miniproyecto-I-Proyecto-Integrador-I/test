import React from 'react'
import { AlertCircle, CalendarCheck, CalendarClock } from 'lucide-react'
import type { Subtask } from '../Types/models'
import CardTask from './CardTask'
import EmptyState from './EmptyState'

import '../Styles/CardTasks.css'

interface CardsGridProps {
  setSelectedSubtask: (sub: Subtask) => void
  overdue: Subtask[]
  today: Subtask[]
  upcoming: Subtask[]
  loading: boolean
}

/* ── Section header ─────────────────────────────────────── */

interface SectionHeaderProps {
  icon: React.ReactNode
  label: string
  count: number
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, label, count }) => (
  <div className="task-section__header">
    {icon}
    <span>{label} ({count})</span>
  </div>
)

/* ── Main component ─────────────────────────────────────── */

const CardsGrid: React.FC<CardsGridProps> = ({ 
  setSelectedSubtask, 
  overdue, 
  today, 
  upcoming, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="today-loading-state">
        <div className="spinner" />
        <p>Cargando tareas…</p>
      </div>
    )
  }

  const isEmpty = overdue.length === 0 && today.length === 0 && upcoming.length === 0

  if (isEmpty) {
    return <EmptyState />
  }

  return (
    <div className="grouped-cards">

      {/* ── VENCIDAS ─────────────────────────────────────── */}
      {overdue.length > 0 && (
        <section className="task-section task-section--overdue">
          <SectionHeader
            icon={<AlertCircle size={14} />}
            label="Vencidas"
            count={overdue.length}
          />
          {overdue.map(sub => (
            <CardTask
              key={sub.id}
              sub={sub}
              variant="overdue"
              onClick={() => setSelectedSubtask(sub)}
            />
          ))}
        </section>
      )}

      {/* ── PARA HOY ─────────────────────────────────────── */}
      {today.length > 0 && (
        <section className="task-section task-section--today">
          <SectionHeader
            icon={<CalendarCheck size={14} />}
            label="Para hoy"
            count={today.length}
          />
          {today.map(sub => (
            <CardTask
              key={sub.id}
              sub={sub}
              variant="today"
              onClick={() => setSelectedSubtask(sub)}
            />
          ))}
        </section>
      )}

      {/* ── PRÓXIMAS ─────────────────────────────────────── */}
      {upcoming.length > 0 && (
        <section className="task-section task-section--upcoming">
          <SectionHeader
            icon={<CalendarClock size={14} />}
            label="Próximas"
            count={upcoming.length}
          />
          {upcoming.map(sub => (
            <CardTask
              key={sub.id}
              sub={sub}
              variant="upcoming"
              onClick={() => setSelectedSubtask(sub)}
            />
          ))}
        </section>
      )}

    </div>
  )
}

export default CardsGrid