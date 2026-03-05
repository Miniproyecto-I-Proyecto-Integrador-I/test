import React from 'react'
import { useStatusCard } from '../Hooks/useStatusCard'
import StatusCard from './StatusCard'
import '../Styles/StatusCardStyles.css'

const StatusCardGrid: React.FC = () => {
  const {
    defeatedSubTask,
    todaySubTask,
    nextSubTask,
    loading,
  } = useStatusCard()

  if (loading) {
    return (
      <div className="status-card-loading">
        <div className="spinner" />
        <p>Cargando cards…</p>
      </div>
    )
  }

  return (
    <div className="status-card-grid">
      {/* Column 1 — Most overdue */}
      <StatusCard
        subtask={defeatedSubTask}
        message="Más antigua"
        variant="overdue"
      />

      {/* Column 2 — Today */}
      <StatusCard
        subtask={todaySubTask}
        message="Hoy"
        variant="today"
      />

      {/* Column 3 — Upcoming */}
      <StatusCard
        subtask={nextSubTask}
        message="Por venir"
        variant="upcoming"
      />
    </div>
  )
}

export default StatusCardGrid