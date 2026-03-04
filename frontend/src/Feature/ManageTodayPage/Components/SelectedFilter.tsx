import React from 'react'

interface SelectedFilter{
    handleFilterChange:(key: string, value: string) => void
    applyFilters: () => void
    clearFilters: () => void
    filters: Record<string, string>
}

const SelectedFilter: React.FC<SelectedFilter> = ({
    handleFilterChange,
    applyFilters,
    clearFilters,
    filters
}) => {
  return (
    <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <label>Después de:</label>
        <input
          type="date"
          value={filters.planification_date_gte || ''}
          onChange={(e) =>
            handleFilterChange('planification_date_gte', e.target.value)
          }
        />
        <label>Antes de:</label>
        <input
          type="date"
          value={filters.planification_date_lte || ''}
          onChange={(e) =>
            handleFilterChange('planification_date_lte', e.target.value)
          }
        />
        <select
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <input
          type="number"
          placeholder="ID Tarea"
          value={filters.task || ''}
          onChange={(e) => handleFilterChange('task', e.target.value)}
        />
        <input
          type="text"
          placeholder="Título Tarea"
          value={filters.task_title || ''}
          onChange={(e) => handleFilterChange('task_title', e.target.value)}
        />
        <input
          type="text"
          placeholder="Materia"
          value={filters.subject || ''}
          onChange={(e) => handleFilterChange('subject', e.target.value)}
        />
        <input
          type="text"
          placeholder="Tipo"
          value={filters.type || ''}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        />
        <select
          value={filters.priority || ''}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
        >
          <option value="">Todas las prioridades</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="number"
          placeholder="Horas min"
          value={filters.needed_hours_min || ''}
          onChange={(e) =>
            handleFilterChange('needed_hours_min', e.target.value)
          }
        />
        <input
          type="number"
          placeholder="Horas max"
          value={filters.needed_hours_max || ''}
          onChange={(e) =>
            handleFilterChange('needed_hours_max', e.target.value)
          }
        />
        <button onClick={applyFilters}>Filtrar</button>
        <button onClick={clearFilters}>Limpiar</button>
      </div>
  )
}

export default SelectedFilter