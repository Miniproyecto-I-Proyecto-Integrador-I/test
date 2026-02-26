/**
 * AddSubtask Component - Formulario dinámico para agregar múltiples subtareas
 * Estructura:
 * - Header: Información de la tarea principal
 * - Form: Formulario dinámico para agregar subtareas
 * - List: Lista de subtareas agregadas
 * - Footer: Botón para finalizar planificación
 */

import React, { useEffect } from 'react';
import type { SubtaskListItem } from '../Types/subtaskFormTypes';
import { useSubtaskForm } from '../Hooks/useSubtaskForm';
import { formatDate, formatHours } from '../Utils/subtaskUtils';
import './AddSubtask.css';

interface AddSubtaskProps {
  taskTitle: string;
  taskDescription?: string;
  totalTaskHours?: number;
  onSubmit: (subtasks: SubtaskListItem[]) => Promise<void>;
  isLoading?: boolean;
}

export const AddSubtask: React.FC<AddSubtaskProps> = ({
  taskTitle,
  taskDescription,
  totalTaskHours = 0,
  onSubmit,
  isLoading = false,
}) => {
  const {
    currentForm,
    subtasks,
    errors,
    isSubmitting,
    updateFormField,
    addSubtask,
    removeSubtask,
    getTotalHours,
    setIsSubmitting,
  } = useSubtaskForm();

  const totalAddedHours = getTotalHours();

  const handleAddSubtask = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    addSubtask();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (subtasks.length === 0) {
      alert('Debes agregar al menos una subtarea');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(subtasks);
    } catch (error) {
      console.error('Error al guardar subtareas:', error);
      alert('Error al guardar las subtareas. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubtask = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta subtarea?')) {
      removeSubtask(id);
    }
  };

  const isFormValid =
    currentForm.description &&
    currentForm.planification_date &&
    currentForm.needed_hours &&
    Object.keys(errors).length === 0;

  return (
    <div className="subtask-container">
      {/* Header */}
      <div className="subtask-header">
        <div className="subtask-header__content">
          <div className="subtask-header__icon-wrapper">
            <div className="subtask-header__icon">
              {/* Aquí va el icono SVG */}
            </div>
          </div>

          <div className="subtask-header__info">
            <div className="subtask-header__label">Tarea Principal</div>
            <div className="subtask-header__title">{taskTitle}</div>
          </div>
        </div>

        <div className="subtask-header__time">
          <div className="subtask-header__time-label">Tiempo Total</div>
          <div className="subtask-header__time-value">
            {formatHours(totalTaskHours)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <form className="subtask-content" onSubmit={handleSubmit}>
        {/* Section Title */}
        <div className="subtask-section">
          <div className="subtask-section__header">
            <h2 className="subtask-section__title">Desglose de Subtareas</h2>
            <p className="subtask-section__description">
              Divide tu tarea principal en pasos manejables. Asigna una fecha y
              el tiempo necesario a cada uno.
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="subtask-form">
          {/* Description Field */}
          <div className="subtask-form__field">
            <label className="subtask-form__label">
              Descripción del paso a realizar
            </label>
            <textarea
              className={`subtask-form__input subtask-form__textarea ${
                errors.description ? 'subtask-form__input-error' : ''
              }`}
              placeholder="Ej. Buscar 3 referencias bibliográficas en la biblioteca"
              value={currentForm.description}
              onChange={(e) =>
                updateFormField('description', e.target.value)
              }
              maxLength={300}
              rows={2}
            />
            {errors.description && (
              <span className="subtask-form__error-message">
                {errors.description}
              </span>
            )}
            <div className="subtask-form__input-help">
              {currentForm.description.length}/300 caracteres
            </div>
          </div>

          {/* Date and Time Row */}
          <div className="subtask-form__row">
            {/* Date Field */}
            <div className="subtask-form__column">
              <label className="subtask-form__label">
                ¿Qué día planeas hacer esto?
              </label>
              <input
                type="date"
                className={`subtask-form__input ${
                  errors.planification_date
                    ? 'subtask-form__input-error'
                    : ''
                }`}
                value={currentForm.planification_date}
                onChange={(e) =>
                  updateFormField('planification_date', e.target.value)
                }
              />
              {errors.planification_date && (
                <span className="subtask-form__error-message">
                  {errors.planification_date}
                </span>
              )}
            </div>

            {/* Hours Field */}
            <div className="subtask-form__column">
              <label className="subtask-form__label">
                Tiempo estimado (Horas)
              </label>
              <input
                type="number"
                className={`subtask-form__input ${
                  errors.needed_hours ? 'subtask-form__input-error' : ''
                }`}
                placeholder="0.0"
                step="0.5"
                min="0.5"
                max="24"
                value={currentForm.needed_hours}
                onChange={(e) =>
                  updateFormField('needed_hours', e.target.value)
                }
              />
              {errors.needed_hours && (
                <span className="subtask-form__error-message">
                  {errors.needed_hours}
                </span>
              )}
            </div>
          </div>

          {/* Add Button */}
          <button
            type="button"
            className="subtask-form__add-button"
            onClick={handleAddSubtask}
            disabled={!isFormValid || isSubmitting}
          >
            <div className="subtask-form__add-icon">+</div>
            Añadir este paso
          </button>
        </div>

        {/* Subtasks List */}
        {subtasks.length > 0 ? (
          <div className="subtask-list">
            {subtasks.map((subtask, index) => (
              <div key={subtask.id} className="subtask-item">
                <div className="subtask-item__drag-handle">⋮</div>

                <div className="subtask-item__content">
                  <p className="subtask-item__description">
                    {subtask.description}
                  </p>

                  <div className="subtask-item__meta">
                    <span className="subtask-item__badge">
                      <span className="subtask-item__badge-icon">📅</span>
                      {formatDate(subtask.planification_date)}
                    </span>
                    <span className="subtask-item__badge">
                      <span className="subtask-item__badge-icon">⏱️</span>
                      {formatHours(subtask.needed_hours)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="subtask-item__delete-button"
                  onClick={() => handleDeleteSubtask(subtask.id)}
                  title="Eliminar subtarea"
                >
                  🗑️
                </button>
              </div>
            ))}

            {/* Summary */}
            <div
              style={{
                padding: '16px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                marginTop: '16px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#059669',
                }}
              >
                Total de horas planificadas: {formatHours(totalAddedHours)}
              </p>
            </div>
          </div>
        ) : (
          <div className="subtask-empty">
            <div className="subtask-empty__icon">📋</div>
            <p className="subtask-empty__text">
              Aún no has agregado ninguna subtarea. Completa el formulario
              anterior para empezar.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="subtask-footer">
          <button
            type="submit"
            className="subtask-submit-button"
            disabled={subtasks.length === 0 || isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? 'Guardando...' : 'Finalizar planificación'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSubtask;
