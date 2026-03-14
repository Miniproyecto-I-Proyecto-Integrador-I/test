import React from 'react';

interface ConflictProgressBarProps {
  totalHours: number;
  maxHours: number;
}

const ConflictProgressBar: React.FC<ConflictProgressBarProps> = ({
  totalHours,
  maxHours,
}) => {
  const ratio = maxHours > 0 ? totalHours / maxHours : 0;
  const widthPct = Math.min(ratio * 100, 100);

  const status = ratio <= 1 ? 'ok' : 'error';

  const statusLabel =
    status === 'ok'
      ? 'Disponible'
      : `+${(totalHours - maxHours).toFixed(1)}h de exceso`;

  return (
    <div className="conflict-progress">
      <div className="conflict-progress__bar-wrap">
        <div
          className={`conflict-progress__bar conflict-progress__bar--${status}`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <span
        className={`conflict-progress__label conflict-progress__label--${status}`}
      >
        {totalHours.toFixed(1)}h / {maxHours}h — {statusLabel}
      </span>
    </div>
  );
};

export default ConflictProgressBar;
