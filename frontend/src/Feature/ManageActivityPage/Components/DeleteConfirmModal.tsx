import React, { useEffect, useRef } from 'react';

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
}) => {
  const titleId = 'delete-confirm-title';
  const descriptionId = 'delete-confirm-description';
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  return (
    <div
      className="subtask-edit-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="subtask-edit-modal">
        <h4 id={titleId}>
          {type === 'main-task'
            ? '¿Eliminar tarea principal?'
            : '¿Eliminar esta subtarea?'}
        </h4>
        <p id={descriptionId}>
          {type === 'main-task'
            ? 'Esta acción no se puede deshacer y eliminará la tarea completa.'
            : 'Esta acción no se puede deshacer y eliminará la subtarea seleccionada.'}
        </p>
        <div className="subtask-edit-modal-actions">
          <button
            type="button"
            className="subtask-edit-cancel"
            onClick={onCancel}
            ref={cancelButtonRef}
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
};

export default DeleteConfirmModal;
