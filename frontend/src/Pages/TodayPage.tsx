import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { todayService } from '../Feature/ManageTodayPage/Services/todayService';
import { useAuth } from '../Context/AuthContext';
import type { Subtask } from '../Feature/ManageTodayPage/Types/models';
import './TodayPage.css';

const TodayPage: React.FC = () => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchSubtasks = async (customFilters?: Record<string, string>) => {
    setLoading(true);
    try {
      const filtersToUse =
        customFilters !== undefined ? customFilters : filters;
      const data = await todayService.getTodaySubtasks(filtersToUse);
      console.log('DATA:', data);
      setSubtasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubtasks();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters };
    if (value) {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    setFilters(newFilters);
  };

  const applyFilters = () => {
    fetchSubtasks();
  };

  const clearFilters = () => {
    setFilters({});
    fetchSubtasks({});
  };

  if (loading) {
    return (
      <div className="today-loading-state">
        <div className="spinner"></div>
        <p>Cargando tus tareas de hoy...</p>
      </div>
    );
  }

  const now = new Date();
  const colombia = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  const fecha = colombia.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="today-page">
      <header className="today-header">
        <div>
          <h2 className="today-greeting">Hola, {user?.username}!</h2>
          <h1 className="today-title">Mi Día</h1>
        </div>
        <p className="today-date">
          {fecha.charAt(0).toUpperCase() + fecha.slice(1)}
        </p>
      </header>

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

      {subtasks.length === 0 ? (
        <div className="today-empty-state">
          <div className="empty-content">
            <h2>No hay resultados</h2>
            <p>No se encontraron tareas con los filtros aplicados.</p>
            <button className="btn-primary" onClick={() => navigate('/create')}>
              Crear actividad
            </button>
          </div>
        </div>
      ) : (
        <div className="today-grid">
          {subtasks.map((sub) => (
            <div
              key={sub.id}
              className="today-card"
              onClick={() => setSelectedSubtask(sub)}
            >
              <div className="card-top">
                {sub.task && (
                  <span className="parent-badge">{sub.task.title}</span>
                )}
                <span className={`status-dot ${sub.status}`}></span>
              </div>

              <h4 className="card-title">{sub.description}</h4>

              <div className="card-bottom">
                <span className="time-badge">⏱ {sub.needed_hours} hrs</span>
                <span className="time-badge">
                  Para {new Date(sub.planification_date).toLocaleDateString()}
                </span>
                <span className="view-more">Ver detalles ➔</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedSubtask && (
        <div className="modal-overlay" onClick={() => setSelectedSubtask(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setSelectedSubtask(null)}
            >
              ×
            </button>

            <div className="modal-header">
              <h2>{selectedSubtask.description}</h2>
              <div className="modal-tags">
                <span className="tag status-tag">
                  Estado: {selectedSubtask.status}
                </span>
                <span className="tag time-tag">
                  Horas necesarias: {selectedSubtask.needed_hours}
                </span>
              </div>
            </div>

            {selectedSubtask.task && (
              <div className="parent-task-info">
                <h3>Información de la Tarea Principal</h3>

                <div className="info-grid">
                  <div className="info-item">
                    <strong>Título:</strong>
                    <span>{selectedSubtask.task.title}</span>
                  </div>
                  <div className="info-item">
                    <strong>Estado:</strong>
                    <span>{selectedSubtask.task.status}</span>
                  </div>
                  {selectedSubtask.task.priority && (
                    <div className="info-item">
                      <strong>Prioridad:</strong>
                      <span
                        className={`priority ${selectedSubtask.task.priority}`}
                      >
                        {selectedSubtask.task.priority}
                      </span>
                    </div>
                  )}
                  {selectedSubtask.task.subject && (
                    <div className="info-item">
                      <strong>Materia:</strong>
                      <span>{selectedSubtask.task.subject}</span>
                    </div>
                  )}
                  {selectedSubtask.task.type && (
                    <div className="info-item">
                      <strong>Tipo:</strong>
                      <span>{selectedSubtask.task.type}</span>
                    </div>
                  )}
                  {selectedSubtask.task.due_date && (
                    <div className="info-item">
                      <strong>Fecha de entrega:</strong>
                      <span>
                        {new Date(
                          selectedSubtask.task.due_date,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {selectedSubtask.task.description && (
                  <div className="info-item full-width">
                    <strong>Descripción de la tarea:</strong>
                    <p>{selectedSubtask.task.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayPage;
