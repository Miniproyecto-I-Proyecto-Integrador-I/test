import { getMonthName } from '../Utils/progressUtils';

interface SummaryBannerProps {
  totalPending: number;
  totalCompleted: number;
  overdueCount?: number;
  statusFilter?: string;
}

const SummaryBanner = ({
  totalPending,
  totalCompleted,
  overdueCount = 0,
  statusFilter = 'active',
}: SummaryBannerProps) => {
  const isOverdueView = statusFilter === 'overdue';
  const isCompletedView = statusFilter === 'completed';
  const rightValue = isOverdueView
    ? overdueCount
    : isCompletedView
      ? totalCompleted
      : totalPending;

  return (
    <div
      className={`progress-summary-banner ${isOverdueView ? 'progress-summary-banner--overdue' : ''}`}
    >
      <div className="progress-summary-left">
        <div className="progress-summary-left-title">
          <span>Estado General</span>
        </div>
        {isOverdueView ? (
          <p>
            Tienes {overdueCount}{' '}
            {overdueCount === 1 ? 'tarea vencida' : 'tareas vencidas'}{' '}
            <strong>
              pendiente{overdueCount === 1 ? '' : 's'} por resolver
            </strong>
            .
          </p>
        ) : isCompletedView ? (
          <p>
            Has completado {totalCompleted}{' '}
            {totalCompleted === 1 ? 'tarea' : 'tareas'}{' '}
            <strong>en total</strong>.
          </p>
        ) : (
          <p>
            Tienes {totalPending} tareas <strong>por completar para</strong>{' '}
            este {getMonthName()}.
          </p>
        )}
      </div>

      <div
        className={`progress-summary-right ${isOverdueView ? 'progress-summary-right--overdue' : ''}`}
      >
        {!isOverdueView && !isCompletedView && (
          <>
            <div className="progress-summary-stat">
              <h2>{totalCompleted}</h2>
              <span>Completadas</span>
            </div>
            <div className="progress-summary-divider" />
          </>
        )}
        <div className="progress-summary-stat">
          <h2>{rightValue}</h2>
          <span>
            {isOverdueView
              ? 'Vencidas'
              : isCompletedView
                ? 'Completadas'
                : 'Por completar'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryBanner;
