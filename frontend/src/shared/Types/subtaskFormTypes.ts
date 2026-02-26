/**
 * Tipos para el formulario dinámico de subtareas
 */

export interface SubtaskFormField {
  description: string;
  planification_date: string;
  needed_hours: number | string;
}

export interface SubtaskListItem extends SubtaskFormField {
  id: string; // ID temporal para el listado antes de guardar
}

export interface ValidationErrors {
  description?: string;
  planification_date?: string;
  needed_hours?: string;
}

export interface SubtaskFormState {
  subtasks: SubtaskListItem[];
  currentForm: SubtaskFormField;
  isSubmitting: boolean;
  errors: ValidationErrors;
}
