import React, { useEffect, useMemo, useState } from 'react';
import type { SubtaskFormData, ValidationErrors } from '../Types/subtask.types';
import { hasValidationErrors, validateSubtaskForm } from '../Utils/subtaskValidator';
import { deleteTask } from '../Services/subtaskService';
import '../Styles/SubtaskEdit.css';

export interface EditableSubtask {
	id: string | number;
	description: string;
	planification_date: string;
	needed_hours: number;
	is_completed?: boolean;
}

interface SubtaskEditProps {
	taskId: number;
	initialSubtasks: EditableSubtask[];
	onSubtasksChange?: (subtasks: EditableSubtask[]) => void;
	onSaveChanges?: (subtasks: EditableSubtask[]) => Promise<void> | void;
	onDeleteSubtask?: (subtask: EditableSubtask) => Promise<void> | void;
	onTaskDeleted?: () => void;
	onClose?: () => void;
	onAddNewSubtask?: () => void;
	taskTitle?: string;
	taskCategory?: string;
	taskDueDate?: string;
	totalHours?: number;
}

type DeleteTarget =
	| { type: 'main-task' }
	| { type: 'subtask'; subtask: EditableSubtask };

const SubtaskEdit: React.FC<SubtaskEditProps> = ({
	taskId,
	initialSubtasks,
	onSubtasksChange,
	onSaveChanges,
	onDeleteSubtask,
	onTaskDeleted,
	onClose,
	onAddNewSubtask,
	taskTitle = 'Ensayo sobre la Revolución Francesa',
	taskCategory = 'HISTORIA',
	taskDueDate,
	totalHours,
}) => {
	const [subtasks, setSubtasks] = useState<EditableSubtask[]>(initialSubtasks ?? []);
	const [editingId, setEditingId] = useState<string | number | null>(null);
	const [editData, setEditData] = useState<SubtaskFormData>({
		description: '',
		planification_date: '',
		needed_hours: 0,
	});
	const [errors, setErrors] = useState<ValidationErrors>({});
	const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		setSubtasks(initialSubtasks ?? []);
		setEditingId(null);
		setErrors({});
	}, [initialSubtasks]);

	useEffect(() => {
		if (onSubtasksChange) {
			onSubtasksChange(subtasks);
		}
	}, [onSubtasksChange, subtasks]);

	const computedTotalHours = useMemo(() => {
		if (typeof totalHours === 'number') {
			return totalHours;
		}
		return subtasks.reduce((acc, item) => acc + (Number(item.needed_hours) || 0), 0);
	}, [subtasks, totalHours]);

	const formatShortDate = (dateString: string) => {
		if (!dateString) return '';
		try {
			let date: Date;
			if (dateString.includes('T')) {
				date = new Date(dateString);
			} else {
				const [year, month, day] = dateString.split('-').map(Number);
				date = new Date(year, month - 1, day, 0, 0, 0, 0);
			}
			return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
		} catch {
			return dateString;
		}
	};

	const formatTaskDueDate = (dateString?: string) => {
		if (!dateString) return 'Sin fecha';
		try {
			let date: Date;
			if (dateString.includes('T')) {
				date = new Date(dateString);
			} else {
				const [year, month, day] = dateString.split('-').map(Number);
				date = new Date(year, month - 1, day, 0, 0, 0, 0);
			}
			return date.toLocaleDateString('es-ES', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			});
		} catch {
			return dateString;
		}
	};

	const formatHours = (hours: number) => {
		return `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
	};

	const startEditing = (subtask: EditableSubtask) => {
		setEditingId(subtask.id);
		setEditData({
			description: subtask.description,
			planification_date: subtask.planification_date,
			needed_hours: subtask.needed_hours,
		});
		setErrors({});
	};

	const cancelEditing = () => {
		setEditingId(null);
		setErrors({});
		setEditData({
			description: '',
			planification_date: '',
			needed_hours: 0,
		});
	};

	const handleEditFieldChange = (field: keyof SubtaskFormData, value: string | number) => {
		setEditData((prev) => ({
			...prev,
			[field]: value,
		}));

		if (errors[field]) {
			setErrors((prev) => {
				const updated = { ...prev };
				delete updated[field];
				return updated;
			});
		}
	};

	const saveEditedSubtask = () => {
		if (editingId === null) return;

		const validationErrors = validateSubtaskForm(editData);
		if (hasValidationErrors(validationErrors)) {
			setErrors(validationErrors);
			return;
		}

		setSubtasks((prev) =>
			prev.map((item) =>
				item.id === editingId
					? {
						...item,
						description: editData.description.trim(),
						planification_date: editData.planification_date,
						needed_hours: Number(editData.needed_hours),
					}
					: item
			)
		);
		cancelEditing();
	};

	const openDeleteSubtaskModal = (subtask: EditableSubtask) => {
		setDeleteTarget({ type: 'subtask', subtask });
	};

	const openDeleteMainTaskModal = () => {
		setDeleteTarget({ type: 'main-task' });
	};

	const closeDeleteModal = () => {
		if (isDeleting) return;
		setDeleteTarget(null);
	};

	const confirmDelete = async () => {
		if (!deleteTarget) return;

		setIsDeleting(true);
		try {
			if (deleteTarget.type === 'main-task') {
				// Eliminar la tarea completa usando el servicio
				await deleteTask(taskId);
				// Notificar al padre que la tarea fue eliminada
				if (onTaskDeleted) {
					onTaskDeleted();
				}
				// Cerrar el componente
				if (onClose) {
					onClose();
				}
			} else {
				if (onDeleteSubtask) {
					await onDeleteSubtask(deleteTarget.subtask);
				}
				setSubtasks((prev) => prev.filter((item) => item.id !== deleteTarget.subtask.id));
				if (editingId === deleteTarget.subtask.id) {
					cancelEditing();
				}
			}
			setDeleteTarget(null);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleSaveChanges = async () => {
		if (!onSaveChanges) return;
		setIsSaving(true);
		try {
			await onSaveChanges(subtasks);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="subtask-edit-wrapper">
			<div className="subtask-edit-container">
				<header className="subtask-edit-header">
					<button
						type="button"
						className="subtask-edit-delete-main"
						onClick={openDeleteMainTaskModal}
					>
						<svg viewBox="0 0 20 20" aria-hidden="true">
							<path d="M4 6h12" />
							<path d="M7 6v9M10 6v9M13 6v9" />
							<path d="M7 6l1-2h4l1 2" />
							<rect x="5" y="6" width="10" height="11" rx="1.5" />
						</svg>
						Eliminar Tarea Principal
					</button>
				</header>

				<div className="subtask-edit-task-row">
					<div>
						<h2 className="subtask-edit-title">{taskTitle}</h2>
						<div className="subtask-edit-meta">
							<span className="subtask-edit-category">{taskCategory}</span>
							<span className="subtask-edit-meta-item">
								<svg viewBox="0 0 20 20" aria-hidden="true">
									<rect x="3" y="5" width="14" height="12" rx="2" />
									<path d="M3 8h14" />
									<path d="M7 3v4M13 3v4" />
								</svg>
								Fecha: {formatTaskDueDate(taskDueDate)}
							</span>
							<span className="subtask-edit-meta-item">
								<svg viewBox="0 0 20 20" aria-hidden="true">
									<circle cx="10" cy="10" r="7" />
									<path d="M10 6v4l3 2" />
								</svg>
								{computedTotalHours.toFixed(1)} Horas totales
							</span>
						</div>
					</div>
				</div>

				<section className="subtask-edit-list-section">
					<h3 className="subtask-edit-section-title">Pasos de la tarea</h3>

					<div className="subtask-edit-list">
						{subtasks.map((subtask) => {
							const isEditing = editingId === subtask.id;
							return (
								<div
									key={subtask.id}
									className={`subtask-edit-item ${isEditing ? 'is-editing' : ''}`}
								>
									{!isEditing ? (
										<>
											<div className="subtask-edit-item-left">
												<span className="subtask-edit-item-circle" aria-hidden="true" />
												<div className="subtask-edit-item-content">
													<p className="subtask-edit-item-title">{subtask.description}</p>
													<p className="subtask-edit-item-meta">
														Due: {formatShortDate(subtask.planification_date)} • {formatHours(subtask.needed_hours)}
													</p>
												</div>
											</div>
											<div className="subtask-edit-item-actions">
												<button
													type="button"
													className="subtask-edit-icon-btn"
													onClick={() => startEditing(subtask)}
													aria-label="Editar subtarea"
												>
													<svg viewBox="0 0 20 20" aria-hidden="true">
														<path d="M4 13.5V16h2.5L15 7.5 12.5 5 4 13.5z" />
														<path d="M11.8 5.7l2.5 2.5" />
													</svg>
												</button>
												<button
													type="button"
													className="subtask-edit-icon-btn danger"
													onClick={() => openDeleteSubtaskModal(subtask)}
													aria-label="Eliminar subtarea"
												>
													<svg viewBox="0 0 20 20" aria-hidden="true">
														<path d="M4 6h12" />
														<path d="M7 6v9M10 6v9M13 6v9" />
														<path d="M7 6l1-2h4l1 2" />
														<rect x="5" y="6" width="10" height="11" rx="1.5" />
													</svg>
												</button>
											</div>
										</>
									) : (
										<div className="subtask-edit-inline-form" role="group" aria-label="Editar subtarea">
											{/* Campo 1: Descripción */}
											<div className="subtask-edit-input-group grow">
												<label>Descripción</label>
												<input
													type="text"
													value={editData.description}
													onChange={(event) =>
														handleEditFieldChange('description', event.target.value)
													}
													className={errors.description ? 'error' : ''}
													maxLength={300}
												/>
												{errors.description && <span className="subtask-edit-error">{errors.description}</span>}
											</div>

											{/* Campo 2: Fecha */}
											<div className="subtask-edit-input-group">
												<label>Fecha</label>
												<input
													type="date"
													value={editData.planification_date}
													onChange={(event) =>
														handleEditFieldChange('planification_date', event.target.value)
													}
													className={errors.planification_date ? 'error' : ''}
												/>
												{errors.planification_date && (
													<span className="subtask-edit-error">{errors.planification_date}</span>
												)}
											</div>

											{/* Campo 3: Horas */}
											<div className="subtask-edit-input-group small">
												<label>Horas</label>
												<input
													type="number"
													min="0.1"
													step="0.1"
													value={editData.needed_hours || ''}
													onChange={(event) =>
														handleEditFieldChange(
															'needed_hours',
															parseFloat(event.target.value) || 0
														)
													}
													className={errors.needed_hours ? 'error' : ''}
												/>
												{errors.needed_hours && <span className="subtask-edit-error">{errors.needed_hours}</span>}
											</div>

											{/* Botones */}
											<div className="subtask-edit-inline-actions">
												<button
													type="button"
													className="subtask-edit-round-btn"
													onClick={cancelEditing}
													aria-label="Cancelar edición"
												>
													<svg viewBox="0 0 20 20" aria-hidden="true">
														<path d="M6 6l8 8M14 6l-8 8" />
													</svg>
												</button>
												<button
													type="button"
													className="subtask-edit-round-btn success"
													onClick={saveEditedSubtask}
													aria-label="Guardar edición"
												>
													<svg viewBox="0 0 20 20" aria-hidden="true">
														<path d="M5 10.5l3.2 3.2L15 7" />
													</svg>
												</button>
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>

					{onAddNewSubtask && (
						<button type="button" className="subtask-edit-add-row" onClick={onAddNewSubtask}>
							+ Agregar nuevo paso
						</button>
					)}
				</section>

				<footer className="subtask-edit-footer">
					<button type="button" className="subtask-edit-cancel" onClick={onClose}>
						Cancelar
					</button>
					<button
						type="button"
						className="subtask-edit-save"
						onClick={handleSaveChanges}
						disabled={isSaving || !onSaveChanges}
					>
						{isSaving ? 'Guardando...' : 'Guardar Cambios'}
					</button>
				</footer>
			</div>

			{deleteTarget && (
				<div className="subtask-edit-modal-overlay" role="dialog" aria-modal="true">
					<div className="subtask-edit-modal">
						<h4>
							{deleteTarget.type === 'main-task'
								? '¿Eliminar tarea principal?'
								: '¿Eliminar esta subtarea?'}
						</h4>
						<p>
							{deleteTarget.type === 'main-task'
								? 'Esta acción no se puede deshacer y eliminará la tarea completa.'
								: 'Esta acción no se puede deshacer y eliminará la subtarea seleccionada.'}
						</p>
						<div className="subtask-edit-modal-actions">
							<button type="button" className="subtask-edit-cancel" onClick={closeDeleteModal}>
								Cancelar
							</button>
							<button
								type="button"
								className="subtask-edit-delete-confirm"
								onClick={confirmDelete}
								disabled={isDeleting}
							>
								{isDeleting ? 'Eliminando...' : 'Eliminar'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default SubtaskEdit;
