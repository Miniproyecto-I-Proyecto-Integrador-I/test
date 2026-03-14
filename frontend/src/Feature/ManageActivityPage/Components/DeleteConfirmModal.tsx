import React from 'react';

type DeleteTargetType = 'subtask' | 'main-task';

interface DeleteConfirmModalProps {
  type: DeleteTargetType;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  type,
  isDeleting,
  onConfirm,
  onCancel,
}) => (
  <div
    className="subtask-edit-modal-overlay"
    role="dialog"
    aria-modal="true"
  >
    <div className="subtask-edit-modal">
      <h4>
        {type === 'main-task'
          ? '¿Eliminar tarea principal?'
          : '¿Eliminar esta subtarea?'}
      </h4>
      <p>
        {type === 'main-task'
          ? 'Esta acción no se puede deshacer y eliminará la tarea completa.'
          : 'Esta acción no se puede deshacer y eliminará la subtarea seleccionada.'}
      </p>
      <div className="subtask-edit-modal-actions">
        <button
          type="button"
          className="subtask-edit-cancel"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="subtask-edit-delete-confirm"
          onClick={onConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </div>
  </div>
);

export default DeleteConfirmModal;
