/**
 * Hook personalizado para manejar la lógica del formulario de subtareas
 */
import { useState, useCallback } from 'react';
import type {
  SubtaskFormField,
  SubtaskFormState,
  SubtaskListItem,
} from '../Types/subtaskFormTypes';
import {
  validateSubtaskForm,
  generateTempId,
} from '../Utils/subtaskUtils';

const initialFormState: SubtaskFormField = {
  description: '',
  planification_date: '',
  needed_hours: '',
};

export const useSubtaskForm = () => {
  const [state, setState] = useState<SubtaskFormState>({
    subtasks: [],
    currentForm: initialFormState,
    isSubmitting: false,
    errors: {},
  });

  const updateFormField = useCallback(
    (field: keyof SubtaskFormField, value: string | number) => {
      setState((prevState) => ({
        ...prevState,
        currentForm: {
          ...prevState.currentForm,
          [field]: value,
        },
        errors: {
          ...prevState.errors,
          [field]: '', // Limpiar error del campo al modificar
        },
      }));
    },
    []
  );

  const addSubtask = useCallback(() => {
    const formData = state.currentForm;
    const validationErrors = validateSubtaskForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setState((prevState) => ({
        ...prevState,
        errors: validationErrors,
      }));
      return;
    }

    const newSubtask: SubtaskListItem = {
      ...formData,
      id: generateTempId(),
      needed_hours: Number(formData.needed_hours),
    };

    setState((prevState) => ({
      ...prevState,
      subtasks: [...prevState.subtasks, newSubtask],
      currentForm: initialFormState,
      errors: {},
    }));
  }, [state.currentForm]);

  const removeSubtask = useCallback((id: string) => {
    setState((prevState) => ({
      ...prevState,
      subtasks: prevState.subtasks.filter((subtask) => subtask.id !== id),
    }));
  }, []);

  const clearForm = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      currentForm: initialFormState,
      errors: {},
    }));
  }, []);

  const getTotalHours = useCallback(() => {
    return state.subtasks.reduce((total, subtask) => {
      return total + Number(subtask.needed_hours);
    }, 0);
  }, [state.subtasks]);

  const getSubtasks = useCallback(() => {
    return state.subtasks;
  }, [state.subtasks]);

  return {
    // State
    currentForm: state.currentForm,
    subtasks: state.subtasks,
    errors: state.errors,
    isSubmitting: state.isSubmitting,

    // Actions
    updateFormField,
    addSubtask,
    removeSubtask,
    clearForm,
    getTotalHours,
    getSubtasks,

    // Setters
    setIsSubmitting: (value: boolean) =>
      setState((prev) => ({ ...prev, isSubmitting: value })),
  };
};
