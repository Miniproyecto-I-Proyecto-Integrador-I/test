import React, { useState } from 'react';
import type { ConflictScenario } from '../Feature/ManageConflict/Types/conflict';
import { useConflictState } from '../Feature/ManageConflict/Hooks/useConflictState';
import ConflictHeader from '../Feature/ManageConflict/Components/ConflictHeader';
import ConflictProgressBar from '../Feature/ManageConflict/Components/ConflictProgressBar';
import ConflictTaskRow from '../Feature/ManageConflict/Components/ConflictTaskRow';
import AutoResolveCard from '../Feature/ManageConflict/Components/AutoResolveCard';
import {
  mockNewTaskConflict,
  mockDayOverloadConflict,
} from '../Feature/ManageConflict/Services/mockData';
import '../Feature/ManageConflict/Styles/ConflictPage.css';

// ---------------------------------------------------------------------------
// Inner view — renders the full conflict UI for a given scenario
// ---------------------------------------------------------------------------

interface ConflictViewProps {
  scenario: ConflictScenario;
}

const ConflictView: React.FC<ConflictViewProps> = ({ scenario }) => {
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
          <p className="conflict-section__title">Nueva sub-Tarea</p>
          <ConflictTaskRow
            task={newTask}
            conflictDate={scenario.conflictDate}
            allTasksOnDay={tasksOnConflictDay}
            maxHoursPerDay={maxHours}
            editableHours={true}
            editableDate={false}
            resolved={resolved}
            onChangeHours={(id, hours) => updateTask(id, { hours })}
            onChangeDate={(id, date) => updateTask(id, { date })}
          />
        </div>
      )}

      {/* ---- Existing tasks section ---- */}
      <div className="conflict-section">
        <p className="conflict-section__title">
          {isNewTaskCase ? 'Sub-Tareas Existentes' : 'sub-Tareas del día'}
        </p>
        {existingTasks.map((task) => (
          <ConflictTaskRow
            key={task.id}
            task={task}
            conflictDate={scenario.conflictDate}
            allTasksOnDay={tasksOnConflictDay}
            maxHoursPerDay={maxHours}
            editableHours={true}
            editableDate={true}
            onChangeHours={(id, hours) => updateTask(id, { hours })}
            onChangeDate={(id, date) => updateTask(id, { date })}
          />
        ))}
      </div>

      {/* ---- Auto resolve ---- */}
      {!resolved && (
        <AutoResolveCard
          onAutoResolve={() => {
            /* feature not yet implemented */
          }}
        />
      )}

      {/* ---- Footer actions ---- */}
      <div className="conflict-footer">
        <button className="conflict-btn-cancel">Cancelar</button>
        <button className="conflict-btn-save" disabled={!resolved}>
          Guardar Cambios
        </button>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// ConflictPage — top-level page, includes a dev tab switcher for demo
// ---------------------------------------------------------------------------

const SCENARIOS: Record<string, ConflictScenario> = {
  new_task: mockNewTaskConflict,
  day_overload: mockDayOverloadConflict,
};

const ConflictPage: React.FC = () => {
  const [activeCase, setActiveCase] = useState<'new_task' | 'day_overload'>(
    'new_task',
  );
  const scenario = SCENARIOS[activeCase];

  return (
    <div className="conflict-page">
      {/* Dev switcher — lets reviewers toggle between both cases */}
      <div className="conflict-case-switcher">
        <button
          className={`conflict-case-tab ${activeCase === 'new_task' ? 'conflict-case-tab--active' : ''}`}
          onClick={() => setActiveCase('new_task')}
        >
          Caso 1: tarea nueva
        </button>
        <button
          className={`conflict-case-tab ${activeCase === 'day_overload' ? 'conflict-case-tab--active' : ''}`}
          onClick={() => setActiveCase('day_overload')}
        >
          Caso 2: sobrecarga del día
        </button>
      </div>

      {/* key forces full remount when scenario switches, resetting hook state */}
      <ConflictView key={activeCase} scenario={scenario} />
    </div>
  );
};

export default ConflictPage;
