import { useState } from 'react';
import type { ConflictScenario, ConflictTask } from '../Types/conflict';
import { isResolved, excessHours } from '../Utils/conflictUtils';

export function useConflictState(initial: ConflictScenario) {
  const [tasks, setTasks] = useState<ConflictTask[]>(
    initial.case === 'new_task'
      ? [initial.newTask!, ...initial.existingTasks]
      : [...initial.existingTasks]
  );

  const updateTask = (id: string, patch: Partial<Pick<ConflictTask, 'hours' | 'date'>>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
  };

  const editableTasks = initial.case === 'new_task'
    ? tasks.filter(t => !t.isNew)
    : tasks;

  const resolved = isResolved(tasks, initial.maxHoursPerDay, initial.conflictDate);
  const excess = excessHours(tasks, initial.maxHoursPerDay, initial.conflictDate);

  const totalOnDay = tasks
    .filter(t => t.date === initial.conflictDate)
    .reduce((sum, t) => sum + t.hours, 0);

  return {
    tasks,
    editableTasks,
    updateTask,
    resolved,
    excess,
    totalOnDay,
    maxHours: initial.maxHoursPerDay,
  };
}
