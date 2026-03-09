import { useState, useEffect } from 'react';
import { calendarService } from '../Services/calendarService';
import { buildDayMap, buildSubtasksByDate, getMonthRange } from '../Utils/calendarUtils';
import type { DayMap, SubtasksByDate } from '../Types/calendarTypes';

export function useCalendarData(activeMonth: Date) {
  const [dayMap, setDayMap] = useState<DayMap>({});
  const [subtasksByDate, setSubtasksByDate] = useState<SubtasksByDate>({});
  const [isLoading, setIsLoading] = useState(false);

  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();

  useEffect(() => {
    const { from, to } = getMonthRange(new Date(year, month, 1));

    if (from > to) {
      setDayMap({});
      setSubtasksByDate({});
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    calendarService
      .getSubtasksByRange(from, to)
      .then((subtasks) => {
        if (!cancelled) {
          setDayMap(buildDayMap(subtasks));
          setSubtasksByDate(buildSubtasksByDate(subtasks));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDayMap({});
          setSubtasksByDate({});
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [year, month]);

  return { dayMap, subtasksByDate, isLoading };
}
