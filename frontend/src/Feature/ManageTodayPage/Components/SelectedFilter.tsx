import React from 'react';
import {
  XCircle,
  GraduationCap,
  ClipboardList,
  Shapes,
  Filter,
} from 'lucide-react';
import '../Styles/SelectedFilter.css';

interface SelectedFilterProps {
  handleFilterChange: (key: string, value: string) => void;
  clearFilters: () => void;
  filters: Record<string, string>;
  allCourses: string[];
}

const SelectedFilter: React.FC<SelectedFilterProps> = ({
  handleFilterChange,
  clearFilters,
  filters,
  allCourses,
}) => {
  const hasActiveFilters = Object.values(filters).some((val) => val !== '');

  return (
    <div className="filter-sidebar-container">
      <div className="filter-sidebar-header">
        <h3 className="filter-sidebar-title">
          <Filter size={16} aria-hidden="true" /> Filtros
        </h3>
        {hasActiveFilters && (
          <button
            className="filter-clear-btn-icon"
            onClick={clearFilters}
            title="Limpiar filtros"
            aria-label="Limpiar filtros"
          >
            <XCircle size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="filter-sidebar-body">
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-subject">
            <GraduationCap
              size={14}
              className="filter-label-icon"
              aria-hidden="true"
            />
            Por Curso
          </label>
          <select
            id="filter-subject"
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

        <div className="filter-divider"></div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-status">
            <ClipboardList
              size={14}
              className="filter-label-icon"
              aria-hidden="true"
            />
            Por Estado
          </label>
          <select
            id="filter-status"
            className="filter-select"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="postponed">Pospuesto</option>
          </select>
        </div>

        <div className="filter-divider"></div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-type">
            <Shapes
              size={14}
              className="filter-label-icon"
              aria-hidden="true"
            />
            Por Tipo
          </label>
          <select
            id="filter-type"
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
      </div>
    </div>
  );
};

export default SelectedFilter;
