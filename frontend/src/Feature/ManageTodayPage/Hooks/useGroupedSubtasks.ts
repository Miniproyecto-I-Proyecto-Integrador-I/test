import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  hasError: boolean;
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
  const [hasError, setHasError] = useState(false);
  const hasLoadedOnceRef = useRef(false);

  const areSubtasksEquivalent = useCallback((a: Subtask, b: Subtask) => {
    return (
      a.id === b.id &&
      a.description === b.description &&
      a.status === b.status &&
      a.planification_date === b.planification_date &&
      a.needed_hours === b.needed_hours &&
      (a.note ?? null) === (b.note ?? null) &&
      (a.task?.id ?? null) === (b.task?.id ?? null) &&
      (a.task?.title ?? null) === (b.task?.title ?? null) &&
      (a.task?.status ?? null) === (b.task?.status ?? null) &&
      (a.task?.due_date ?? null) === (b.task?.due_date ?? null) &&
      (a.task?.description ?? null) === (b.task?.description ?? null) &&
      (a.task?.priority ?? null) === (b.task?.priority ?? null) &&
      (a.task?.subject ?? null) === (b.task?.subject ?? null) &&
      (a.task?.type ?? null) === (b.task?.type ?? null) &&
      (a.task?.total_hours ?? null) === (b.task?.total_hours ?? null)
    );
  }, []);

  const reconcileSubtasks = useCallback(
    (previous: Subtask[], next: Subtask[]) => {
      const previousById = new Map(previous.map((item) => [item.id, item]));
      let changed = previous.length !== next.length;

      const merged = next.map((incoming, index) => {
        const prev = previousById.get(incoming.id);
        if (!prev) {
          changed = true;
          return incoming;
        }

        if (!areSubtasksEquivalent(prev, incoming)) {
          changed = true;
          return incoming;
        }

        if (previous[index]?.id !== incoming.id) {
          changed = true;
        }

        return prev;
      });

      return changed ? merged : previous;
    },
    [areSubtasksEquivalent],
  );

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
    if (!hasLoadedOnceRef.current) {
      setLoading(true);
    }

    try {
      setHasError(false);
      const [overdueData, todayData, upcomingData] = await Promise.all([
        todayService.getFilterSubtasks({ planification_date_lte: fechaAyer }),
        todayService.getFilterSubtasks({ planification_date: fechaToday }),
        todayService.getFilterSubtasks({ planification_date_gte: fechaMañana }),
      ]);

      setRawOverdue((previous) => reconcileSubtasks(previous, overdueData));
      setRawToday((previous) =>
        reconcileSubtasks(previous, sortTodaySubtasks(todayData)),
      );
      setRawUpcoming((previous) => reconcileSubtasks(previous, upcomingData));
      hasLoadedOnceRef.current = true;
    } catch (error) {
      console.error('Error al cargar subtareas agrupadas:', error);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, [reconcileSubtasks, sortTodaySubtasks]);

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
    const isCompletedFilter = extraFilters?.status === 'completed';

    if (isCompletedFilter) {
      return {
        overdue: applyLocalFilters(rawOverdue.filter((sub) => sub.status === 'completed')),
        today: applyLocalFilters(sortTodaySubtasks(rawToday.filter((sub) => sub.status === 'completed'))),
        upcoming: applyLocalFilters(rawUpcoming.filter((sub) => sub.status === 'completed')),
        allCourses: uniqueCourses,
      };
    }

    const overdueWithoutPostponed = rawOverdue.filter(
      (sub) => sub.status !== 'postponed' && sub.status !== 'completed',
    );
    const upcomingWithoutPostponed = rawUpcoming.filter(
      (sub) => sub.status !== 'postponed' && sub.status !== 'completed',
    );
    const todayNonPostponed = rawToday.filter(
      (sub) => sub.status !== 'postponed' && sub.status !== 'completed',
    );
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
    hasError,
    allCourses,
    reloadSubtasks,
  };
};
