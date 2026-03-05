import { useState, useEffect } from 'react';
import type { Subtask } from '../Types/models';
import { todayService } from '../Services/todayService';
import { fechaToday, fechaMañana, fechaAyer } from '../Utils/DateFormatted';

interface GroupedSubtasks {
  overdue: Subtask[];
  today: Subtask[];
  upcoming: Subtask[];
  loading: boolean;
}

/**
 * Fetches subtasks grouped in three buckets:
 *  - overdue   (planification_date <= yesterday)
 *  - today     (planification_date == today)
 *  - upcoming  (planification_date >= tomorrow)
 *
 * Accepts optional extra `filters` (e.g. from SelectedFilter in TodayPage)
 * which are merged into each query.
 */
export const useGroupedSubtasks = (
  extraFilters?: Record<string, string>
): GroupedSubtasks => {
  const [overdue, setOverdue] = useState<Subtask[]>([]);
  const [today, setToday] = useState<Subtask[]>([]);
  const [upcoming, setUpcoming] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const extra = extraFilters ?? {};

        const [overdueData, todayData, upcomingData] = await Promise.all([
          todayService.getFilterSubtasks({ ...extra, planification_date_lte: fechaAyer }),
          todayService.getFilterSubtasks({ ...extra, planification_date: fechaToday }),
          todayService.getFilterSubtasks({ ...extra, planification_date_gte: fechaMañana }),
        ]);

        setOverdue(overdueData);
        setToday(todayData);
        setUpcoming(upcomingData);
      } catch (error) {
        console.error('Error al cargar subtareas agrupadas:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  // Re-fetch whenever the filter object reference changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(extraFilters)]);

  return { overdue, today, upcoming, loading };
};
