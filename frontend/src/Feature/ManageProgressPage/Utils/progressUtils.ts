import type { Task } from './types';

export const getMonthName = () => {
  return new Date().toLocaleString('es-ES', { month: 'long' });
};

export const formatDateLabel = (dateString?: string) => {
  if (!dateString) return "SIN FECHA";
  
  // Bugfix: NaN INVALID DATE
  const isIsoFull = dateString.includes('T');
  let finalDateStr = dateString;
  
  if (!isIsoFull && dateString.length === 10) {
    finalDateStr = `${dateString}T00:00:00`;
  }
  
  const dateObj = new Date(finalDateStr);
  
  if (isNaN(dateObj.getTime())) return "FECHA INVÁLIDA";
  
  return `${dateObj.getDate()} ${dateObj.toLocaleString('es-ES', { month: 'short' }).toUpperCase()}, ${dateObj.getFullYear()}`;
};

export const filterTasks = (tasks: Task[], statusFilter: string) => {
  const todayDate = new Date().toISOString().split('T')[0];

  return tasks.filter(task => {
    const progress = task.progress_percentage || 0;
    const isCompleted = task.status === 'completed' || progress === 100;
    const cleanDueDate = task.due_date ? task.due_date.split('T')[0] : '';
    const isOverdue = !isCompleted && cleanDueDate && cleanDueDate < todayDate;

    if (statusFilter === 'active') return !isCompleted && !isOverdue;
    if (statusFilter === 'completed') return isCompleted;
    if (statusFilter === 'overdue') return isOverdue;
    return true;
  });
};

export const getProjectSummary = (tasks: Task[]) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const isCompletedTask = (task: Task) =>
    task.status === 'completed' || task.progress_percentage === 100;

  const isInCurrentMonth = (task: Task) => {
    if (!task.due_date) return false;
    const dateString = task.due_date.includes('T')
      ? task.due_date
      : `${task.due_date}T00:00:00`;
    const dueDate = new Date(dateString);
    if (Number.isNaN(dueDate.getTime())) return false;
    return (
      dueDate.getMonth() === currentMonth &&
      dueDate.getFullYear() === currentYear
    );
  };

  const totalCompleted = tasks.filter(isCompletedTask).length;
  const totalPending = tasks.filter(
    (task) => !isCompletedTask(task) && isInCurrentMonth(task),
  ).length;

  return { totalCompleted, totalPending };
};
