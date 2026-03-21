import React from 'react';
import { Clock3, FileText } from 'lucide-react';
import type { Subtask } from '../Types/models';
import '../Styles/PostponeModal.css';

interface PostponeModalProps {
	isOpen: boolean;
	mode: 'write' | 'read';
	subtask: Subtask | null;
	noteValue: string;
	loading?: boolean;
	onClose: () => void;
	onNoteChange?: (value: string) => void;
	onConfirm?: () => void;
}

const PostponeModal: React.FC<PostponeModalProps> = ({
	isOpen,
	mode,
	subtask,
	noteValue,
	loading = false,
	onClose,
	onNoteChange,
	onConfirm,
}) => {
	if (!isOpen || !subtask) {
		return null;
	}

	const title =
		mode === 'write' ? 'Posponer Subtarea' : 'Nota de subtarea pospuesta';
	const description =
		mode === 'write'
			? 'Indica el motivo por el cual deseas reprogramar esta actividad.'
			: 'Esta es la nota registrada al posponer la actividad.';

	return (
		<div
			className="postpone-modal-overlay"
			role="dialog"
			aria-modal="true"
			onClick={onClose}
		>
			<div
				className="postpone-modal-card"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="postpone-modal-header">
					<h3>{title}</h3>
					<p>{description}</p>
				</div>

				<div className="postpone-modal-subtask">
					<Clock3 size={14} />
					<span className="postpone-modal-subtask-title">{subtask.description}</span>
				</div>

				<label className="postpone-modal-label" htmlFor="postpone-note-input">
					<FileText size={14} />
					Notas
				</label>

				<textarea
					id="postpone-note-input"
					className="postpone-modal-textarea"
					placeholder="Escribe el motivo de la posposición (Opcional)"
					value={noteValue}
					onChange={(event) => onNoteChange?.(event.target.value)}
					readOnly={mode === 'read'}
					rows={7}
				/>

				<div className="postpone-modal-actions">
					{mode === 'write' ? (
						<>
							<button
								className="postpone-modal-confirm"
								type="button"
								disabled={loading}
								onClick={onConfirm}
							>
								{loading ? 'Guardando...' : 'Confirmar'}
							</button>
							<button
								className="postpone-modal-cancel"
								type="button"
								disabled={loading}
								onClick={onClose}
							>
								Cancelar
							</button>
						</>
					) : (
						<button
							className="postpone-modal-close"
							type="button"
							onClick={onClose}
						>
							Cerrar
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default PostponeModal;
