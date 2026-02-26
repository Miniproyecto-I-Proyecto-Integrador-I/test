import { useState } from 'react';
import type { SubtaskFormData, SubtaskItem, ValidationErrors } from '../Types/subtask.types';
import { validateSubtaskForm, hasValidationErrors } from '../Utils/subtaskValidator';

export const useSubtaskForm = () => {
    const [subtasks, setSubtasks] = useState<SubtaskItem[]>([]);
    const [formData, setFormData] = useState<SubtaskFormData>({
        description: '',
        planification_date: '',
        needed_hours: 0,
    });
    const [errors, setErrors] = useState<ValidationErrors>({});

    /**
     * Actualiza un campo del formulario
     */
    const handleFieldChange = (field: keyof SubtaskFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Limpiar error del campo cuando el usuario empieza a escribir
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    /**
     * Añade una nueva subtarea a la lista
     */
    const addSubtask = (): boolean => {
        const validationErrors = validateSubtaskForm(formData);
        
        if (hasValidationErrors(validationErrors)) {
            setErrors(validationErrors);
            return false;
        }

        const newSubtask: SubtaskItem = {
            ...formData,
            id: `temp-${Date.now()}` // ID temporal para manipular en el frontend
        };

        setSubtasks(prev => [...prev, newSubtask]);
        
        // Limpiar el formulario
        setFormData({
            description: '',
            planification_date: '',
            needed_hours: 0,
        });
        setErrors({});
        
        return true;
    };

    /**
     * Elimina una subtarea de la lista
     */
    const removeSubtask = (id: string) => {
        setSubtasks(prev => prev.filter(subtask => subtask.id !== id));
    };

    /**
     * Reordena subtareas por drag and drop
     */
    const reorderSubtasks = (dragId: string, dropId: string) => {
        setSubtasks(prev => {
            const dragIndex = prev.findIndex(subtask => subtask.id === dragId);
            const dropIndex = prev.findIndex(subtask => subtask.id === dropId);

            if (dragIndex === -1 || dropIndex === -1 || dragIndex === dropIndex) {
                return prev;
            }

            const updated = [...prev];
            const [moved] = updated.splice(dragIndex, 1);
            updated.splice(dropIndex, 0, moved);
            return updated;
        });
    };

    /**
     * Limpia todas las subtareas y el formulario
     */
    const resetForm = () => {
        setSubtasks([]);
        setFormData({
            description: '',
            planification_date: '',
            needed_hours: 0,
        });
        setErrors({});
    };

    return {
        subtasks,
        formData,
        errors,
        handleFieldChange,
        addSubtask,
        removeSubtask,
        reorderSubtasks,
        resetForm,
    };
};
