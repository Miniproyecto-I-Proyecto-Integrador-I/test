import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../Context/AuthContext';
import type { Subtask } from '../Feature/ManageTodayPage/Types/models';
import '../Feature/ManageTodayPage/Styles/TodayPage.css';
import CardsGrid from '@/Feature/ManageTodayPage/Components/CardsGrid';
import SelectedFilter from '@/Feature/ManageTodayPage/Components/SelectedFilter';
import { fecha } from '../Feature/ManageTodayPage/Utils/DateFormatted';
import { useGroupedSubtasks } from '../Feature/ManageTodayPage/Hooks/useGroupedSubtasks';
import StatusCardGrid from '@/Feature/ManageTodayPage/Components/StatusCardGrid';
import ViewMenu from '@/Feature/ManageTodayPage/Components/ViewMenu';
import OverdueTasksAlert from '@/Feature/ManageTodayPage/Components/OverdueTasksAlert';
import TodaySummaryCard from '@/Feature/ManageTodayPage/Components/TodaySummaryCard';
import { ArrowLeft } from 'lucide-react';
import LoadingScreen from '../shared/Components/LoadingScreen';
import EmptyState from '@/Feature/ManageTodayPage/Components/EmptyState';

const TodayPage: React.FC = () => {
  const navigate = useNavigate();

  /** Filters driven by SelectedFilter; passed down to CardsGrid → useGroupedSubtasks */
  const [filters, setFilters] = useState<Record<string, string>>({});

  const [viewOptions, setViewOptions] = useState({
    overdue: false,
    today: true,
    upcoming: false,
  });
  const [previousViewOptions, setPreviousViewOptions] = useState<{
    overdue: boolean;
    today: boolean;
    upcoming: boolean;
  } | null>(null);
  const [showViewMenu, setShowViewMenu] = useState(false);

  const { user } = useAuth();
  const {
    overdue,
    today,
    upcoming,
    rawOverdue,
    rawToday,
    rawUpcoming,
    loading,
    allCourses,
    reloadSubtasks,
  } = useGroupedSubtasks(filters);

  const hasAnyTasks =
    rawOverdue.length > 0 || rawToday.length > 0 || rawUpcoming.length > 0;

  const summaryTodaySubtasks = rawToday.filter(
    (sub) => sub.status !== 'postponed' && sub.status !== 'completed',
  );

  const allThreeSelected =
    viewOptions.overdue &&
    overdue.length > 0 &&
    viewOptions.today &&
    today.length > 0 &&
    viewOptions.upcoming &&
    upcoming.length > 0;

  const isFiltered = Object.values(filters).some((val) => val !== '');
  const isGridEmpty =
    (!viewOptions.overdue || overdue.length === 0) &&
    (!viewOptions.today || today.length === 0) &&
    (!viewOptions.upcoming || upcoming.length === 0);

  /* ── Filter handlers ──────────────────────────────────── */

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value) {
        next[key] = value;
      } else {
        delete next[key];
      }
      return next;
    });
  };

  const clearFilters = () => setFilters({});

  const handleSubtaskClick = (sub: Subtask) => {
    if (sub.task?.id) {
      navigate(`/activity/${sub.task.id}`);
    }
  };

  const handleRescheduleSubtask = (sub: Subtask) => {
    if (sub.task?.id) {
      navigate(`/activity/${sub.task.id}`, {
        state: { focusSubtaskId: sub.id },
      });
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando tus actividades del día..." />;
  }

  return (
    <div className="today-page">
      <header className="today-header">
        <div>
          <h1 className="today-greeting">Hola, {user?.username}!</h1>
          <div className="today-subtitle">
            <span className="today-subtitle-title">Mi día</span>
            <span className="today-subtitle-separator">•</span>
            <span className="today-date">
              {fecha.charAt(0).toUpperCase() + fecha.slice(1)}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ViewMenu
            viewOptions={viewOptions}
            setViewOptions={setViewOptions}
            showViewMenu={showViewMenu}
            setShowViewMenu={setShowViewMenu}
          />
          <button
            className="btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              borderRadius: '8px',
            }}
            onClick={() => navigate('/create')}
          >
            + Nueva Tarea
          </button>
        </div>
      </header>

      {isGridEmpty && !isFiltered ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            padding: '60px 20px',
            flexGrow: 1,
          }}
        >
          <EmptyState
            hiddenOverdueCount={!viewOptions.overdue ? rawOverdue.length : 0}
            hiddenUpcomingCount={!viewOptions.upcoming ? rawUpcoming.length : 0}
            onViewOverdue={() =>
              setViewOptions({ overdue: true, today: false, upcoming: false })
            }
            onViewUpcoming={() =>
              setViewOptions({ overdue: false, today: false, upcoming: true })
            }
          />
        </div>
      ) : (
        <div
          className={`today-content-layout ${allThreeSelected ? 'layout-full-width' : ''}`}
        >
          {/* Main Column */}
          <div className="today-main-column">
            <StatusCardGrid
              defeatedSubTask={overdue[0]}
              todaySubTask={today[0]}
              nextSubTask={upcoming[0]}
              viewOptions={viewOptions}
              onSubtaskClick={handleSubtaskClick}
            />

            <CardsGrid
              onSubtaskClick={handleSubtaskClick}
              onRescheduleSubtask={handleRescheduleSubtask}
              onSubtaskUpdated={reloadSubtasks}
              overdue={overdue}
              today={today}
              upcoming={upcoming}
              filters={filters}
              viewOptions={viewOptions}
            />
          </div>

          {/* Sidebar Column */}
          <div className="today-side-column">
            {!viewOptions.overdue && rawOverdue.length > 0 && (
              <OverdueTasksAlert
                count={rawOverdue.length}
                onSolve={() => {
                  setPreviousViewOptions(viewOptions);
                  setViewOptions({
                    overdue: true,
                    today: false,
                    upcoming: false,
                  });
                }}
              />
            )}

            {viewOptions.overdue &&
              !viewOptions.today &&
              !viewOptions.upcoming && (
                <div className="overdue-return-banner">
                  <div className="overdue-return-main">
                    <div className="overdue-return-icon-wrapper">
                      <ArrowLeft size={20} color="var(--primary-color)" />
                    </div>
                    <div className="overdue-return-content">
                      <span className="overdue-return-title">
                        Resolviendo tareas vencidas
                      </span>
                      <span className="overdue-return-subtitle">
                        Ponte al día para no afectar tu progreso.
                      </span>
                    </div>
                  </div>
                  <button
                    className="overdue-return-button"
                    onClick={() => {
                      if (previousViewOptions) {
                        setViewOptions(previousViewOptions);
                        setPreviousViewOptions(null);
                      } else {
                        setViewOptions({
                          overdue: false,
                          today: true,
                          upcoming: true,
                        });
                      }
                    }}
                  >
                    <ArrowLeft size={16} />
                    Volver a mi día
                  </button>
                </div>
              )}

            {summaryTodaySubtasks.length > 0 && (
              <TodaySummaryCard
                pendingCount={summaryTodaySubtasks.length}
                totalNeededHours={summaryTodaySubtasks.reduce(
                  (acc, curr) => acc + (curr.needed_hours || 0),
                  0,
                )}
              />
            )}

            {hasAnyTasks && (
              <SelectedFilter
                handleFilterChange={handleFilterChange}
                clearFilters={clearFilters}
                filters={filters}
                allCourses={allCourses}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayPage;
