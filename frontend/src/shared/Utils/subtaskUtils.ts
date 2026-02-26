/**
 * Utilidades para validación del formulario de subtareas
 */
import type { SubtaskFormField, ValidationErrors } from '../Types/subtaskFormTypes';

export const validateSubtaskForm = (data: SubtaskFormField): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validar descripción
  if (!data.description || data.description.trim() === '') {
    errors.description = 'La descripción es obligatoria';
  } else if (data.description.length < 5) {
    errors.description = 'La descripción debe tener al menos 5 caracteres';
  } else if (data.description.length > 300) {
    errors.description = 'La descripción no puede exceder 300 caracteres';
  }

  // Validar fecha
  if (!data.planification_date) {
    errors.planification_date = 'La fecha es obligatoria';
  } else {
    const selectedDate = new Date(data.planification_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.planification_date = 'La fecha no puede ser anterior a hoy';
    }
  }

  // Validar horas
  const hours = Number(data.needed_hours);
  if (!data.needed_hours || hours === 0) {
    errors.needed_hours = 'El tiempo estimado es obligatorio';
  } else if (hours < 0.5) {
    errors.needed_hours = 'El tiempo mínimo es 0.5 horas';
  } else if (hours > 24) {
    errors.needed_hours = 'La duración no puede superar 24 horas';
  }

  return errors;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatHours = (hours: number | string): string => {
  const h = Number(hours);
  return `${h.toFixed(1)}h`;
};

export const generateTempId = (): string => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
