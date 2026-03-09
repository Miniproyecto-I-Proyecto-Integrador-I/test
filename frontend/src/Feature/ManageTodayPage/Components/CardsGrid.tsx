import React from 'react'
import { AlertCircle, CalendarCheck, CalendarClock, SearchX, CheckCircle2 } from 'lucide-react'
import type { Subtask } from '../Types/models'
import CardTask from './CardTask'
import InfoTooltip from '../../../shared/Components/InfoTooltip'

import '../Styles/CardTasks.css'

interface CardsGridProps {
  onSubtaskClick: (sub: Subtask) => void
  overdue: Subtask[]
  today: Subtask[]
  upcoming: Subtask[]
  filters?: Record<string, string>
  viewOptions?: { overdue: boolean; today: boolean; upcoming: boolean }
}

/* ── Section header ─────────────────────────────────────── */

interface SectionHeaderProps {
  icon: React.ReactNode
  label: string
  count: number
  tooltipInfo?: string
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, label, count, tooltipInfo }) => (
  <div className="task-section__header">
    {icon}
    <span>{label} ({count})</span>
    {tooltipInfo && <InfoTooltip content={tooltipInfo} />}
  </div>
)

/* ── Main component ─────────────────────────────────────── */

const CardsGrid: React.FC<CardsGridProps> = ({ 
  onSubtaskClick, 
  overdue, 
  today, 
  upcoming,
  filters,
  viewOptions = { overdue: true, today: true, upcoming: true }
}) => {

  const isEmpty = 
    (!viewOptions.overdue || overdue.length === 0) && 
    (!viewOptions.today || today.length === 0) && 
    (!viewOptions.upcoming || upcoming.length === 0);
  const isFiltered = filters && Object.values(filters).some(val => val !== '')
  const isCompletedFilter = filters?.status === 'completed'

  if (isEmpty) {
    if (isFiltered) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 20px', color: '#94a3b8', textAlign: 'center' }}>
          <SearchX size={48} strokeWidth={1} style={{ marginBottom: '16px', opacity: 0.6 }} />
          <p style={{ fontFamily: 'var(--font-family)', fontSize: '15px', maxWidth: '300px' }}>
            No se encontraron tareas con las características de los filtros aplicados.
          </p>
        </div>
      )
    }
    return null
  }

  // Combined render for completed items
  if (isCompletedFilter) {
    const allCompleted = [...overdue, ...today, ...upcoming];
    return (
      <div className="grouped-cards">
        <section className="task-section task-section--completed">
          <SectionHeader
            icon={<CheckCircle2 size={18} />}
            label="Realizadas"
            count={allCompleted.length}
            tooltipInfo="Todas tus tareas completadas."
          />
          {allCompleted.map(sub => (
            <CardTask
              key={sub.id}
              sub={sub}
              variant="today" // Use today variant for standard visualization of completed items (since it shows duration)
              onClick={() => onSubtaskClick(sub)}
            />
          ))}
        </section>
      </div>
    )
  }

  return (
    <div className="grouped-cards">

      {/* ── VENCIDAS ─────────────────────────────────────── */}
      {viewOptions.overdue && overdue.length > 0 && (
        <section className="task-section task-section--overdue">
          <SectionHeader
            icon={<AlertCircle size={18} />}
            label="Vencidas"
            count={overdue.length}
            tooltipInfo="Organizadas desde la más antigua a la más reciente."
          />
          {overdue.map(sub => (
            <CardTask
              key={sub.id}
              sub={sub}
              variant="overdue"
              onClick={() => onSubtaskClick(sub)}
            />
          ))}
        </section>
      )}

      {/* ── PARA HOY ─────────────────────────────────────── */}
      {viewOptions.today && today.length > 0 && (
        <section className="task-section task-section--today">
          <SectionHeader
            icon={<CalendarCheck size={18} />}
            label="Para hoy"
            count={today.length}
            tooltipInfo="Organizadas por el menor esfuerzo o tiempo requerido."
          />
          {today.map(sub => (
            <CardTask
              key={sub.id}
              sub={sub}
              variant="today"
              onClick={() => onSubtaskClick(sub)}
            />
          ))}
        </section>
      )}

      {/* ── PRÓXIMAS ─────────────────────────────────────── */}
      {viewOptions.upcoming && upcoming.length > 0 && (
        <section className="task-section task-section--upcoming">
          <SectionHeader
            icon={<CalendarClock size={18} />}
            label="Próximas"
            count={upcoming.length}
            tooltipInfo="Organizadas para que la más próxima esté primero."
          />
          {upcoming.map(sub => (
            <CardTask
              key={sub.id}
              sub={sub}
              variant="upcoming"
              onClick={() => onSubtaskClick(sub)}
            />
          ))}
        </section>
      )}

    </div>
  )
}

export default CardsGrid