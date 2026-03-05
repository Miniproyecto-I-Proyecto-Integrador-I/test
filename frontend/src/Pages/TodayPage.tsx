import React, { useState } from 'react';

import { useAuth } from '../Context/AuthContext';
import type { Subtask } from '../Feature/ManageTodayPage/Types/models';
import '../Feature/ManageTodayPage/Styles/TodayPage.css';
import SelectedSubtask from '../Feature/ManageTodayPage/Components/SelectedSubtask';
import CardsGrid from '@/Feature/ManageTodayPage/Components/CardsGrid';
import SelectedFilter from '@/Feature/ManageTodayPage/Components/SelectedFilter';
import { fecha } from '../Feature/ManageTodayPage/Utils/DateFormatted';
import StatusCardGrid from '@/Feature/ManageTodayPage/Components/StatusCardGrid';

const TodayPage: React.FC = () => {
  /** Which subtask is open in the detail panel */
  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);

  /** Filters driven by SelectedFilter; passed down to CardsGrid → useGroupedSubtasks */
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { user } = useAuth();

  /* ── Filter handlers ──────────────────────────────────── */

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => {
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

  const onClose = () => setSelectedSubtask(null);

  return (
    <div className="today-page">
      <header className="today-header">
        <h1 className="today-greeting">Hola, {user?.username}!</h1>
        <div className="today-subtitle">
          <span className="today-subtitle-title">Mi día</span>
          <span className="today-subtitle-separator">•</span>
          <span className="today-date">
            {fecha.charAt(0).toUpperCase() + fecha.slice(1)}
          </span>
        </div>
      </header>

      <StatusCardGrid />

      <SelectedFilter
        handleFilterChange={handleFilterChange}
        applyFilters={() => {/* filters already reactive via state */}}
        clearFilters={clearFilters}
        filters={filters}
      />

      <CardsGrid
        setSelectedSubtask={setSelectedSubtask}
        filters={filters}
      />

      {selectedSubtask && (
        <SelectedSubtask onClose={onClose} selectedSubtask={selectedSubtask} />
      )}
    </div>
  );
};

export default TodayPage;
