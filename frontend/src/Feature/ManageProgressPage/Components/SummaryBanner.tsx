import { getMonthName } from '../Utils/progressUtils';

interface SummaryBannerProps {
  totalPending: number;
  totalCompleted: number;
}

const SummaryBanner = ({ totalPending, totalCompleted }: SummaryBannerProps) => {
  return (
    <div className="progress-summary-banner">
      <div className="progress-summary-left">
        <div className="progress-summary-left-title">
          <span>Estado General</span>
        </div>
        <p>Tienes {totalPending} tareas <strong>por completar para</strong> este {getMonthName()}.</p>
      </div>
      
      <div className="progress-summary-right">
        <div className="progress-summary-stat">
          <h2>{totalCompleted}</h2>
          <span>Completadas</span>
        </div>
        <div className="progress-summary-divider" />
        <div className="progress-summary-stat">
          <h2>{totalPending}</h2>
          <span>Por completar</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryBanner;
