import React from 'react'
import { AlertCircle, CalendarCheck, CalendarClock, SearchX, CheckCircle2 } from 'lucide-react'
import type { Subtask } from '../Types/models'
import CardTask from './CardTask'
import EmptyState from './EmptyState'
import LoadingScreen from '../../../shared/Components/LoadingScreen';

import '../Styles/CardTasks.css'

interface CardsGridProps {
  setSelectedSubtask: (sub: Subtask) => void
  overdue: Subtask[]
  today: Subtask[]
  upcoming: Subtask[]
  loading: boolean
  filters?: Record<string, string>
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
  loading,
  filters 
}) => {
  if (loading) {
    return <LoadingScreen message="Cargando tus actividades del día..." />;
  }

  const isEmpty = overdue.length === 0 && today.length === 0 && upcoming.length === 0
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
    return <EmptyState />
  }

  // Combined render for completed items
  if (isCompletedFilter) {
    const allCompleted = [...overdue, ...today, ...upcoming];
    return (
      <div className="grouped-cards">
        <section className="task-section task-section--completed">
          <SectionHeader
            icon={<CheckCircle2 size={14} />}
            label="Realizadas"
            count={allCompleted.length}
          />
          {allCompleted.map(sub => (
            <CardTask
              key={sub.id}
              sub={sub}
              variant="today" // Use today variant for standard visualization of completed items (since it shows duration)
              onClick={() => setSelectedSubtask(sub)}
            />
          ))}
        </section>
      </div>
    )
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