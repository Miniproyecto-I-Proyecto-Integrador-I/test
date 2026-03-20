import React, { useState, useEffect } from 'react';
import type {
  ConflictScenario,
  ConflictTask,
} from '../Feature/ManageConflict/Types/conflict';
import { useConflictState } from '../Feature/ManageConflict/Hooks/useConflictState';
import ConflictHeader from '../Feature/ManageConflict/Components/ConflictHeader';
import ConflictProgressBar from '../Feature/ManageConflict/Components/ConflictProgressBar';
import ConflictTaskRow from '../Feature/ManageConflict/Components/ConflictTaskRow';
import AutoResolveCard from '../Feature/ManageConflict/Components/AutoResolveCard';
import { useAuth } from '../Context/AuthContext';
import apiClient from '../Services/ApiClient';
import LoadingScreen from '../shared/Components/LoadingScreen';
import '../Feature/ManageConflict/Styles/ConflictPage.css';

// ---------------------------------------------------------------------------
// Inner view — renders the full conflict UI for a given scenario
// ---------------------------------------------------------------------------

interface ConflictViewProps {
  scenario: ConflictScenario;
  isEditingMode?: boolean;
  onSave?: (tasks: ConflictTask[]) => void;
  onCancel?: () => void;
}

export const ConflictView: React.FC<ConflictViewProps> = ({
  scenario,
  isEditingMode,
  onSave,
  onCancel,
}) => {
  const { tasks, updateTask, resolved, totalOnDay, maxHours } =
    useConflictState(scenario);

  const isNewTaskCase = scenario.case === 'new_task';

  const newTask = isNewTaskCase ? tasks.find((t) => t.isNew) : undefined;
  const existingTasks = isNewTaskCase ? tasks.filter((t) => !t.isNew) : tasks;
  const tasksOnConflictDay = tasks.filter(
    (t) => t.date === scenario.conflictDate,
  );

  return (
    <>
      <ConflictHeader
        isNewTask={isNewTaskCase}
        conflictDate={scenario.conflictDate}
        resolved={resolved}
      />
      <ConflictProgressBar totalHours={totalOnDay} maxHours={maxHours} />

      {/* ---- Case 1: New task section ---- */}
      {isNewTaskCase && newTask && (
        <div className="conflict-section">
          <p className="conflict-section__title">
            {isEditingMode ? 'Actividad en Edición' : 'Nueva sub-Tarea'}
          </p>
          <ConflictTaskRow
            task={newTask}
            conflictDate={scenario.conflictDate}
            allTasksOnDay={tasksOnConflictDay}
            allLocalTasks={tasks}
            maxHoursPerDay={maxHours}
            editableHours={true}
            editableDate={false}
            resolved={resolved}
            maxDate={newTask.parentDueDate}
            onChangeHours={(id, hours) => updateTask(id, { hours })}
            onChangeDate={(id, date) => updateTask(id, { date })}
          />
        </div>
      )}

      {/* ---- Existing tasks section ---- */}
      <div className="conflict-section">
        <p className="conflict-section__title">
          {isNewTaskCase ? 'Actividades Existentes' : 'Actividades del día'}
        </p>
        {existingTasks.map((task) => (
          <ConflictTaskRow
            key={task.id}
            task={task}
            conflictDate={scenario.conflictDate}
            allTasksOnDay={tasksOnConflictDay}
            allLocalTasks={tasks}
            maxHoursPerDay={maxHours}
            editableHours={true}
            editableDate={true}
            maxDate={task.parentDueDate}
            onChangeHours={(id, hours) => updateTask(id, { hours })}
            onChangeDate={(id, date) => updateTask(id, { date })}
          />
        ))}
      </div>

      {/* ---- Auto resolve ---- */}
      {!resolved && (
        <AutoResolveCard
          overflowHours={totalOnDay - maxHours}
          newTaskHours={newTask ? newTask.hours : undefined}
          totalTasksCount={tasksOnConflictDay.length}
          maxHours={maxHours}
        />
      )}

      {/* ---- Footer actions ---- */}
      <div className="conflict-footer">
        <button className="conflict-btn-cancel" onClick={onCancel}>
          Cancelar
        </button>
        <button
          className="conflict-btn-save"
          disabled={!resolved}
          onClick={() => onSave?.(tasks)}
        >
          Guardar Cambios
        </button>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// ConflictPage — top-level page, fetches real data on mount
// ---------------------------------------------------------------------------

export interface ConflictPageProps {
  activityTasks?: import('../Feature/ManageActivityPage/Hooks/useSubtaskEdit').EditableSubtask[];
  editingTask?:
    | import('../Feature/ManageCreatePage/Types/subtask.types').SubtaskFormData
    | import('../Feature/ManageActivityPage/Hooks/useSubtaskEdit').EditableSubtask;
  taskTitle?: string;
  parentDueDate?: string;
  isEditingMode?: boolean;
  onSave?: (tasks: ConflictTask[]) => void;
  onCancel?: () => void;
}

const ConflictPage: React.FC<ConflictPageProps> = ({
  activityTasks,
  editingTask,
  taskTitle,
  parentDueDate,
  isEditingMode,
  onSave,
  onCancel,
}) => {
  const { user } = useAuth();
  const maxHours = user?.daily_hours ?? 8;

  const [scenario, setScenario] = useState<ConflictScenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Todo: Use real data when fully implemented natively
  console.log('--- CONFLICT PAGE MOUNT ---');
  console.log('editingTask (La "Nueva" o "En Edición" recibida):', editingTask);
  console.log('activityTasks (Lista del board base):', activityTasks);

  useEffect(() => {
    if (!editingTask || !editingTask.planification_date) {
      setIsLoading(false);
      return;
    }

    const loadRealData = async () => {
      setIsLoading(true);
      try {
        const conflictDate = editingTask.planification_date;

        // Fetch tasks specific to the conflicting date
        const response = await apiClient.get(
          `/api/subtasks/?planification_date=${conflictDate}`,
        );
        const dbSubtasks: any[] = response.data;

        // Transform Real backend tasks to ConflictTasks
        const editingTaskId = 'id' in editingTask ? editingTask.id : undefined;

        const existingTasks = dbSubtasks
          .filter((st) => {
            const hasNote = Boolean(st.note && String(st.note).trim() !== '');
            return st.status !== 'postponed' && !hasNote;
          })
          .filter(
            (st) => editingTaskId === undefined || st.id !== editingTaskId,
          ) // Avoid duplicates
          .map((st) => ({
            id: String(st.id),
            title: st.description,
            parentTask: st.task?.title || 'Sin tarea',
            hours: Number(st.needed_hours),
            date: st.planification_date,
            parentDueDate: st.task?.due_date
              ? String(st.task.due_date).split('T')[0]
              : undefined,
          }));

        // Transform the incoming/edited task causing the conflict
        const mappedEditingTask = {
          id: editingTaskId !== undefined ? String(editingTaskId) : 'new-draft',
          title: editingTask.description || 'Actividad sin nombre',
          parentTask: taskTitle || 'Sin tarea',
          hours: Number(editingTask.needed_hours),
          date: editingTask.planification_date,
          isNew: true, // we treat the edited/created task as the new incoming change
          parentDueDate: parentDueDate
            ? String(parentDueDate).split('T')[0]
            : undefined,
        };

        const newScenario: ConflictScenario = {
          case: 'new_task',
          conflictDate,
          maxHoursPerDay: maxHours,
          newTask: mappedEditingTask,
          existingTasks,
        };

        setScenario(newScenario);
      } catch (error) {
        console.error('Error fetching tasks for conflict page', error);
        // Fallback or handle error scenario empty state if needed
      } finally {
        setIsLoading(false);
      }
    };

    loadRealData();
  }, [editingTask, maxHours, taskTitle]);

  if (isLoading) {
    return (
      <div
        className="conflict-page"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
        }}
      >
        <LoadingScreen message="" />
      </div>
    );
  }

  if (!scenario) {
    return (
      <div
        className="conflict-page"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
        }}
      >
        <p>No se encontraron detalles de la tarea.</p>
        <button
          className="conflict-btn-cancel"
          onClick={onCancel}
          style={{ marginTop: '1rem' }}
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="conflict-page">
      <ConflictView
        scenario={scenario}
        isEditingMode={isEditingMode}
        onSave={onSave}
        onCancel={onCancel}
      />
    </div>
  );
};

export default ConflictPage;
