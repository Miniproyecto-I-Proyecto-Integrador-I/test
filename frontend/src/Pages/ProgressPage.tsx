import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingScreen from '../shared/Components/LoadingScreen';
import { useProgressTasks } from '../Feature/ManageProgressPage/Hooks/useProgressTasks';
import {
  filterTasks,
  getProjectSummary,
} from '../Feature/ManageProgressPage/Utils/progressUtils';
import TaskCard from '../Feature/ManageProgressPage/Components/TaskCard';
import SummaryBanner from '../Feature/ManageProgressPage/Components/SummaryBanner';
import EmptyState from '../Feature/ManageProgressPage/Components/EmptyState';
import ErrorState from '../Feature/ManageProgressPage/Components/ErrorState';
import '../Feature/ManageProgressPage/Styles/ProgressPage.css';

const ProgressPage = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    try {
      return sessionStorage.getItem('progress.statusFilter') || 'active';
    } catch (e) {
      return 'active';
    }
  });

  const { tasks, loading, hasError } = useProgressTasks();

  const filteredTasks = filterTasks(tasks, statusFilter);
  const overdueCount = filterTasks(tasks, 'overdue').length;
  const { totalCompleted, totalPending } = getProjectSummary(tasks);

  const getThemeClass = () => {
    if (statusFilter === 'active') return 'theme-active';
    if (statusFilter === 'completed') return 'theme-completed';
    if (statusFilter === 'overdue') return 'theme-overdue';
    return 'theme-active';
  };
  const themeClass = getThemeClass();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth / 2
          : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Persist filter changes
  useEffect(() => {
    try {
      sessionStorage.setItem('progress.statusFilter', statusFilter);
    } catch (e) {
      // ignore
    }
  }, [statusFilter]);

  // Save scroll position when user scrolls
  const handleScroll = () => {
    if (scrollRef.current) {
      try {
        sessionStorage.setItem(
          'progress.scrollLeft',
          String(scrollRef.current.scrollLeft),
        );
      } catch (e) {
        // ignore
      }
    }
  };

  // Restore scroll position after tasks load
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('progress.scrollLeft');
      if (saved && scrollRef.current) {
        scrollRef.current.scrollLeft = parseFloat(saved);
      }
    } catch (e) {
      // ignore
    }
  }, [tasks.length]);

  if (loading) {
    return <LoadingScreen message="Cargando el progreso de tus tareas..." />;
  }

  if (hasError) {
    return <ErrorState />;
  }

  return (
    <div className={`progress-page-container ${themeClass}`}>
      <header className="progress-header">
        <div className="progress-title-wrapper">
          <h1>Progreso de las tareas</h1>
        </div>

        <div className="progress-filter-wrapper">
          <label htmlFor="status-filter" className="progress-filter-label">
            Filtrar por:
          </label>
          <select
            id="status-filter"
            className="progress-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="active">Vigentes</option>
            <option value="completed">Completadas</option>
            <option value="overdue">Vencidas</option>
          </select>
        </div>
      </header>

      {tasks.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="progress-section-header">
            <h2 className="progress-section-title">
              {statusFilter === 'active'
                ? 'EN PROGRESO'
                : statusFilter === 'completed'
                  ? 'COMPLETADAS'
                  : 'VENCIDAS'}
            </h2>
            <div className="progress-carousel-nav">
              <button
                aria-label="Ver anteriores"
                onClick={() => scroll('left')}
              >
                <ChevronLeft size={20} strokeWidth={3} />
              </button>
              <button
                aria-label="Ver siguientes"
                onClick={() => scroll('right')}
              >
                <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div
            className="progress-cards-container"
            ref={scrollRef}
            onScroll={handleScroll}
          >
            {filteredTasks.length === 0 ? (
              <div
                style={{
                  width: '100%',
                  padding: '4rem',
                  textAlign: 'center',
                  color: '#9ca3af',
                  border: '1px dashed #e5e7eb',
                  borderRadius: '12px',
                }}
              >
                No se encontraron tareas con estos filtros.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </div>

          <SummaryBanner
            totalPending={totalPending}
            totalCompleted={totalCompleted}
            overdueCount={overdueCount}
            statusFilter={statusFilter}
          />
        </>
      )}
    </div>
  );
};

export default ProgressPage;
