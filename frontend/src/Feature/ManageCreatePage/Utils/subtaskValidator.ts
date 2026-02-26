import type { SubtaskFormData, ValidationErrors } from '../Types/subtask.types';

/**
 * Valida que la fecha no sea en el pasado
 */
export const validateDate = (date: string): boolean => {
    if (!date) return false;
    
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
    
    return selectedDate >= today;
};

/**
 * Valida que la descripción no esté vacía
 */
export const validateDescription = (description: string): boolean => {
    return description.trim().length > 0;
};

/**
 * Valida que las horas sean mayores que 0
 */
export const validateHours = (hours: number): boolean => {
    return hours > 0;
};

/**
 * Valida todos los campos del formulario de subtarea
 */
export const validateSubtaskForm = (formData: SubtaskFormData): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    if (!validateDescription(formData.description)) {
        errors.description = 'La descripción no puede estar vacía';
    }
    
    if (!validateDate(formData.planification_date)) {
        errors.planification_date = 'La fecha no puede ser en el pasado';
    }
    
    if (!validateHours(formData.needed_hours)) {
        errors.needed_hours = 'El tiempo debe ser mayor que 0 horas';
    }
    
    return errors;
};

/**
 * Verifica si hay errores en el objeto de validación
 */
export const hasValidationErrors = (errors: ValidationErrors): boolean => {
    return Object.keys(errors).length > 0;
};
