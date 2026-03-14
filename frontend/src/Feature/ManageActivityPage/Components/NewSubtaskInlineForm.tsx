import React, { useState } from 'react';
import { Calendar, X, Check } from 'lucide-react';
import type { SubtaskFormData, ValidationErrors } from '../../ManageCreatePage/Types/subtask.types';
import {
  validateSubtaskForm,
  hasValidationErrors,
} from '../../ManageCreatePage/Utils/subtaskValidator';
import { formatShortDate } from '../Utils/subtaskEditUtils';
import apiClient from '../../../Services/ApiClient';
import DatePickerModal from '../../ManageCalendarPage/Components/DatePickerModal';
import { useToast } from '../../../shared/Hooks/useToast';
import ToastHost from '../../../shared/Components/ToastHost';

interface NewSubtaskInlineFormProps {
  taskDueDate?: string;
  maxHours: number;
  onSave: (data: SubtaskFormData) => Promise<void>;
  onCancel: () => void;
  onResolveConflict?: (data: SubtaskFormData) => void;
}

const EMPTY_FORM: SubtaskFormData = {
  description: '',
  planification_date: '',
  needed_hours: 0,
};

const NewSubtaskInlineForm: React.FC<NewSubtaskInlineFormProps> = ({
  taskDueDate,
  maxHours,
  onSave,
  onCancel,
  onResolveConflict,
}) => {
  const [formData, setFormData] = useState<SubtaskFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [hourLimitError, setHourLimitError] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toasts, dismiss, error: toastError, show: toastShow } = useToast();
  const [conflictToastId, setConflictToastId] = useState<number | null>(null);

  const setField = (field: keyof SubtaskFormData, value: string | number) => {
    if (conflictToastId) {
      dismiss(conflictToastId);
      setConflictToastId(null);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  };

  const handleHoursChange = (value: number) => {
    if (conflictToastId) {
      dismiss(conflictToastId);
      setConflictToastId(null);
    }
    if (value <= 0 || isNaN(value)) {
      setHourLimitError('El tiempo debe ser mayor que 0 horas.');
    } else if (value > maxHours) {
      setHourLimitError(
        `No puedes asignar más de ${maxHours}h en un día. Considera dividir esta actividad en varios días.`,
      );
    } else {
      setHourLimitError('');
    }
    setField('needed_hours', value);
  };

  const handleSubmit = async () => {
    // Validación de formulario
    const validationErrors = validateSubtaskForm(formData);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      toastError('Datos incompletos', 'Por favor, llena la descripción y el tiempo correctamente.');
      return;
    }
    if (hourLimitError) return;

    // Validar que la fecha no supere la fecha de entrega de la tarea
    if (taskDueDate && formData.planification_date > taskDueDate) {
      setErrors((prev) => ({
        ...prev,
        planification_date: `La fecha no puede ser posterior a la entrega de la tarea (${taskDueDate}).`,
      }));
      return;
    }

    // Chequeo de conflicto de horas del día contra la BD
    setIsChecking(true);
    try {
      const url = `/api/subtasks/?planification_date=${formData.planification_date}`;
      const response = await apiClient.get<Array<{ needed_hours: number }>>(url);
      const backendHours = response.data.reduce(
        (sum, st) => sum + (Number(st.needed_hours) || 0),
        0,
      );
      const total = parseFloat((backendHours + Number(formData.needed_hours)).toFixed(2));
      if (total > maxHours) {
        const id = toastShow({
          title: 'Límite excedido',
          subtitle: 'La carga horaria de este día superaría tu límite.',
          variant: 'warning',
          duration: 0,
          showProgress: false,
          loading: false,
        });
        setConflictToastId(id);
        return;
      }
    } catch {
      // Si falla el chequeo, igual guardamos
    } finally {
      setIsChecking(false);
    }

    if (conflictToastId) {
      dismiss(conflictToastId);
      setConflictToastId(null);
    }
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const activeErrors = {
    ...errors,
    needed_hours: hourLimitError || errors.needed_hours,
  };

  return (
    <>
      <div
        className={`subtask-edit-item is-editing subtask-new-form ${conflictToastId ? 'has-conflict' : ''}`}
        role="group"
        aria-label="Nueva actividad"
      >
        <div className="subtask-edit-inline-form">
          {/* Banner de conflicto eliminado según solicitud - ahora se usa Toast persistente */}

          {/* Descripción */}
          <div className="subtask-edit-input-group grow">
            <label>Descripción de actividad</label>
            <input
              type="text"
              placeholder="¿Qué vas a hacer?"
              value={formData.description}
              onChange={(e) => setField('description', e.target.value)}
              className={activeErrors.description ? 'error' : ''}
              maxLength={300}
              autoFocus
            />
            {activeErrors.description && (
              <span className="subtask-edit-error">{activeErrors.description}</span>
            )}
          </div>

          {/* Horas — ahora antes que fecha */}
          <div className="subtask-edit-input-group small">
            <label>Tiempo a invertir</label>
            <input
              type="number"
              min="1"
              max={maxHours}
              step="1"
              value={formData.needed_hours || ''}
              onChange={(e) => handleHoursChange(parseFloat(e.target.value) || 0)}
              className={activeErrors.needed_hours ? 'error' : ''}
            />
            {activeErrors.needed_hours && (
              <span className="subtask-edit-error">{activeErrors.needed_hours}</span>
            )}
          </div>

          {/* Fecha */}
          <div className="subtask-edit-input-group">
            <label>Día de realización</label>
            <button
              type="button"
              className={`subtask-edit-date-btn${activeErrors.planification_date ? ' error' : ''}`}
              onClick={() => setIsDatePickerOpen(true)}
            >
              <Calendar size={14} aria-hidden="true" />
              {formData.planification_date
                ? formatShortDate(formData.planification_date)
                : 'Elegir fecha'}
            </button>
            {activeErrors.planification_date && (
              <span className="subtask-edit-error">{activeErrors.planification_date}</span>
            )}
          </div>

          {/* Acciones */}
          <div className="subtask-edit-inline-actions">
            <button
              type="button"
              className="subtask-edit-round-btn"
              onClick={() => {
                if (conflictToastId) {
                  dismiss(conflictToastId);
                  setConflictToastId(null);
                }
                onCancel();
              }}
              aria-label="Cancelar"
            >
              <X size={14} />
            </button>
            {conflictToastId ? (
              <button
                type="button"
                className="subtask-edit-round-btn conflict"
                onClick={() => onResolveConflict?.(formData)}
                aria-label="Resolver conflicto"
              >
                Resolver conflicto
              </button>
            ) : (
              <button
                type="button"
                className="subtask-edit-round-btn success"
                onClick={handleSubmit}
                disabled={isChecking || isSaving || !!activeErrors.needed_hours}
                aria-label="Agregar actividad"
              >
                {isChecking || isSaving ? '…' : <Check size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>

      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onConfirm={(date) => {
          setField('planification_date', date);
          setErrors((prev) => {
            const next = { ...prev };
            delete next.planification_date;
            return next;
          });
          setIsDatePickerOpen(false);
        }}
        newSubtaskDescription={formData.description}
        newSubtaskHours={formData.needed_hours}
        maxDate={taskDueDate || undefined}
        confirmLabel="Elegir esta fecha"
        excludeIds={[]}
      />

      <ToastHost toasts={toasts} onDismiss={dismiss} />
    </>
  );
};

export default NewSubtaskInlineForm;
