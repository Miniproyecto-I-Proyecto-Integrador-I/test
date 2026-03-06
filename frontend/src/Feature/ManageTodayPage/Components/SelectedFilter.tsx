import React from 'react'
import { XCircle } from 'lucide-react'
import '../Styles/SelectedFilter.css'

interface SelectedFilterProps {
  handleFilterChange: (key: string, value: string) => void
  clearFilters: () => void
  filters: Record<string, string>
  allCourses: string[]
}

const SelectedFilter: React.FC<SelectedFilterProps> = ({
  handleFilterChange,
  clearFilters,
  filters,
  allCourses
}) => {
  const hasActiveFilters = Object.values(filters).some(val => val !== '')

  return (
    <div className="filter-divider-container">
      <div className="selected-filter-wrapper">
        <div className="filter-group">
          <label className="filter-label">Filtrar por Curso</label>
          <select
            className="filter-select"
            value={filters.subject || ''}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
          >
            <option value="">Todos los cursos</option>
            {allCourses.map((course, idx) => (
              <option key={idx} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Filtrar por Estado</label>
          <select
            className="filter-select"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En progreso</option>
            <option value="postponed">Pospuesto</option>
            <option value="completed">Completado</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Filtrar por Tipo</label>
          <select
            className="filter-select"
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="ensayo">Ensayo</option>
            <option value="examen">Examen</option>
            <option value="proyecto">Proyecto</option>
            <option value="tarea">Tarea</option>
            <option value="lectura">Lectura</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button className="filter-clear-btn" onClick={clearFilters}>
            <XCircle size={18} /> Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}

export default SelectedFilter