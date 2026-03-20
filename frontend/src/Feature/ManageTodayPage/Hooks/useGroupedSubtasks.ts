import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Subtask } from '../Types/models';
import { todayService } from '../Services/todayService';
import { fechaToday, fechaMañana, fechaAyer } from '../Utils/DateFormatted';

interface GroupedSubtasks {
  overdue: Subtask[];
  today: Subtask[];
  upcoming: Subtask[];
  rawOverdue: Subtask[];
  rawToday: Subtask[];
  rawUpcoming: Subtask[];
  loading: boolean;
  allCourses: string[];
  reloadSubtasks: () => Promise<void>;
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
  const [rawOverdue, setRawOverdue] = useState<Subtask[]>([]);
  const [rawToday, setRawToday] = useState<Subtask[]>([]);
  const [rawUpcoming, setRawUpcoming] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);

  const sortTodaySubtasks = useCallback((list: Subtask[]) => {
    return [...list].sort((a, b) => {
      const aPostponed = a.status === 'postponed' ? 1 : 0;
      const bPostponed = b.status === 'postponed' ? 1 : 0;

      if (aPostponed !== bPostponed) {
        return bPostponed - aPostponed;
      }

      return (a.needed_hours || 0) - (b.needed_hours || 0);
    });
  }, []);

  const reloadSubtasks = useCallback(async () => {
    setLoading(true);
    try {
      const [overdueData, todayData, upcomingData] = await Promise.all([
        todayService.getFilterSubtasks({ planification_date_lte: fechaAyer }),
        todayService.getFilterSubtasks({ planification_date: fechaToday }),
        todayService.getFilterSubtasks({ planification_date_gte: fechaMañana }),
      ]);

      setRawOverdue(overdueData);
      setRawToday(sortTodaySubtasks(todayData));
      setRawUpcoming(upcomingData);
    } catch (error) {
      console.error('Error al cargar subtareas agrupadas:', error);
    } finally {
      setLoading(false);
    }
  }, [sortTodaySubtasks]);

  useEffect(() => {
    void reloadSubtasks();
  }, [reloadSubtasks]);

  const { overdue, today, upcoming, allCourses } = useMemo(() => {

    const allTasks = [...rawOverdue, ...rawToday, ...rawUpcoming];
    const uniqueCourses = Array.from(
      new Set(
        allTasks
          .map((sub) => sub.task?.subject)
          .filter((subj): subj is string => !!subj && subj.trim() !== '')
      )
    ).sort();

    const applyLocalFilters = (list: Subtask[]) => {
      if (!extraFilters || Object.keys(extraFilters).length === 0) return list;

      return list.filter((sub) => {
        let match = true;

        if (extraFilters.subject && extraFilters.subject !== '') {
          match = match && sub.task?.subject === extraFilters.subject;
        }

        if (extraFilters.status && extraFilters.status !== '') {
          match = match && sub.status === extraFilters.status;
        }

        if (extraFilters.type && extraFilters.type !== '') {
          match = match && sub.task?.type === extraFilters.type;
        }

        return match;
      });
    };

    const postponedFromAll = allTasks.filter((sub) => sub.status === 'postponed');
    const overdueWithoutPostponed = rawOverdue.filter(
      (sub) => sub.status !== 'postponed',
    );
    const upcomingWithoutPostponed = rawUpcoming.filter(
      (sub) => sub.status !== 'postponed',
    );
    const todayNonPostponed = rawToday.filter((sub) => sub.status !== 'postponed');
    const todayUnified = sortTodaySubtasks([
      ...postponedFromAll,
      ...todayNonPostponed,
    ]);

    return {
      overdue: applyLocalFilters(overdueWithoutPostponed),
      today: applyLocalFilters(todayUnified),
      upcoming: applyLocalFilters(upcomingWithoutPostponed),
      allCourses: uniqueCourses,
    };
  }, [rawOverdue, rawToday, rawUpcoming, extraFilters, sortTodaySubtasks]);

  return {
    overdue,
    today,
    upcoming,
    rawOverdue,
    rawToday,
    rawUpcoming,
    loading,
    allCourses,
    reloadSubtasks,
  };
};
