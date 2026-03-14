import { useState, useEffect } from 'react';
import Calendar from '../shared/Components/Calendar';
import { useCalendarData } from '../Feature/ManageCalendarPage/Hooks/useCalendarData';
import CalendarDayCell, {
  CalendarDayCellSkeleton,
} from '../Feature/ManageCalendarPage/Components/CalendarDayCell';
import DayDetailPanel from '../Feature/ManageCalendarPage/Components/DayDetailPanel';
import { toISODate } from '../Feature/ManageCalendarPage/Utils/calendarUtils';
import '../Feature/ManageCalendarPage/Styles/DayDetailPanel.css';
import type { Subtask } from '../Feature/ManageTodayPage/Types/models';

const SKELETON_FADE_MS = 350;

const CalendarPage = () => {
  const today = new Date();
  const [activeMonth, setActiveMonth] = useState<Date>(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSubtasks, setSelectedSubtasks] = useState<Subtask[]>([]);

  const { dayMap, subtasksByDate, isLoading } = useCalendarData(activeMonth);
  const todayISO = toISODate(today);

  const [showSkeleton, setShowSkeleton] = useState(false);
  const [skeletonFading, setSkeletonFading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true);
      setSkeletonFading(false);
    } else {
      setSkeletonFading(true);
      const t = setTimeout(() => {
        setShowSkeleton(false);
        setSkeletonFading(false);
      }, SKELETON_FADE_MS);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  // Keep panel subtasks in sync when data refreshes
  useEffect(() => {
    if (!selectedDate) return;
    const key = toISODate(selectedDate);
    setSelectedSubtasks(subtasksByDate[key] ?? []);
  }, [subtasksByDate, selectedDate]);

  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
    const key = toISODate(date);
    setSelectedSubtasks(subtasksByDate[key] ?? []);
  };

  return (
    <section className="page">
      <div className="calendar-page__layout">
        <div className="calendar-page__main">
          <Calendar
            month={activeMonth}
            onMonthChange={(m) => {
              setActiveMonth(m);
              setSelectedDate(null);
              setSelectedSubtasks([]);
            }}
            onDaySelect={handleDaySelect}
            renderDay={(date) => {
              const dateISO = toISODate(date);
              if (dateISO < todayISO) return null;

              if (showSkeleton) {
                return <CalendarDayCellSkeleton fading={skeletonFading} />;
              }

              const summary = dayMap[dateISO];
              if (!summary) return null;

              return <CalendarDayCell summary={summary} />;
            }}
          />
        </div>

        <DayDetailPanel
          selectedDate={selectedDate}
          subtasks={selectedSubtasks}
        />
      </div>
    </section>
  );
};

export default CalendarPage;
