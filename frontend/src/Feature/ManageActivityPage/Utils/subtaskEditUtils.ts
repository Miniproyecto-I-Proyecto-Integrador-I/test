export const getTodayDateStr = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatShortDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    let date: Date;
    if (dateString.includes('T')) {
      date = new Date(dateString);
    } else {
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatTaskDueDate = (dateString?: string) => {
  if (!dateString) return 'Sin fecha';
  try {
    let date: Date;
    if (dateString.includes('T')) {
      date = new Date(dateString);
    } else {
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const isDateBeforeToday = (dateString?: string) => {
  if (!dateString) return false;
  try {
    let date: Date;
    if (dateString.includes('T')) {
      date = new Date(dateString);
    } else {
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return taskDate < today;
  } catch {
    return false;
  }
};

export const formatHours = (hours: number) => {
  return `${hours} ${hours === 1 ? 'Hora' : 'Horas'}`;
};

export const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  };
  return labels[priority] || priority;
};
