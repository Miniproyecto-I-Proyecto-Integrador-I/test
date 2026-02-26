export interface SubtaskFormData {
    description: string;
    planification_date: string;
    needed_hours: number;
}

export interface SubtaskItem extends SubtaskFormData {
    id: string; // ID temporal para manipular en el frontend antes de guardar
}

export interface SubtaskPayload {
    description: string;
    planification_date: string;
    needed_hours: number;
    task: number;
}

export interface ValidationErrors {
    description?: string;
    planification_date?: string;
    needed_hours?: string;
}
