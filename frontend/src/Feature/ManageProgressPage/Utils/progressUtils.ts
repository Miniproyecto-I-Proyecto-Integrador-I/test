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
  const totalCompleted = tasks.filter(t => t.status === 'completed' || t.progress_percentage === 100).length;
  const totalPending = tasks.length - totalCompleted;
  return { totalCompleted, totalPending };
};
