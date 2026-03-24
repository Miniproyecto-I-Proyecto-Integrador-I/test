import { useState } from 'react';
import type { ConflictScenario, ConflictTask } from '../Types/conflict';
import { isResolved, excessHours } from '../Utils/conflictUtils';

export function useConflictState(initial: ConflictScenario) {
  const [tasks, setTasks] = useState<ConflictTask[]>(
    initial.case === 'new_task'
      ? [initial.newTask!, ...initial.existingTasks]
      : [...initial.existingTasks],
  );

  const updateTask = (
    id: string,
    patch: Partial<Pick<ConflictTask, 'hours' | 'date'>>,
  ) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const toggleTaskPendingDelete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, pendingDelete: !t.pendingDelete }
          : t,
      ),
    );
  };

  const activeTasks = tasks.filter((t) => !t.pendingDelete);

  const editableTasks =
    initial.case === 'new_task'
      ? tasks.filter((t) => !t.isNew)
      : tasks;

  const resolved = isResolved(
    activeTasks,
    initial.maxHoursPerDay,
    initial.conflictDate,
  );
  const excess = excessHours(
    activeTasks,
    initial.maxHoursPerDay,
    initial.conflictDate,
  );

  const totalOnDay = activeTasks
    .filter((t) => t.date === initial.conflictDate)
    .reduce((sum, t) => sum + t.hours, 0);

  return {
    tasks,
    activeTasks,
    editableTasks,
    updateTask,
    toggleTaskPendingDelete,
    resolved,
    excess,
    totalOnDay,
    maxHours: initial.maxHoursPerDay,
  };
}
