import type { ConflictScenario } from '../Types/conflict';

export const MOCK_AVAILABLE_DATES: string[] = [
  '2026-03-11',
  '2026-03-12',
  '2026-03-13',
  '2026-03-14',
  '2026-03-15',
];

/** Case 1: A new task is creating a conflict on a day that already has tasks */
export const mockNewTaskConflict: ConflictScenario = {
  case: 'new_task',
  conflictDate: '2026-03-11',
  maxHoursPerDay: 8,
  newTask: {
    id: 'new-1',
    title: 'Análisis de datos',
    parentTask: 'Proyecto Alpha',
    hours: 3,
    date: '2026-03-11',
    isNew: true,
  },
  existingTasks: [
    {
      id: 'task-1',
      title: 'Reunión de sincronización Equipo',
      parentTask: 'Gestión de equipo',
      hours: 3,
      date: '2026-03-11',
    },
    {
      id: 'task-2',
      title: 'Revisión técnica en backend',
      parentTask: 'Proyecto Alpha',
      hours: 3,
      date: '2026-03-11',
    },
  ],
};

/** Case 2: Day already exceeds max hours without a new task */
export const mockDayOverloadConflict: ConflictScenario = {
  case: 'day_overload',
  conflictDate: '2026-03-11',
  maxHoursPerDay: 8,
  existingTasks: [
    {
      id: 'task-1',
      title: 'Reunión de sincronización Equipo',
      parentTask: 'Gestión de equipo',
      hours: 3,
      date: '2026-03-11',
    },
    {
      id: 'task-2',
      title: 'Revisión técnica en backend',
      parentTask: 'Proyecto Alpha',
      hours: 3,
      date: '2026-03-11',
    },
    {
      id: 'task-3',
      title: 'Configurar entorno de testing',
      parentTask: 'Infraestructura',
      hours: 4,
      date: '2026-03-11',
    },
  ],
};
