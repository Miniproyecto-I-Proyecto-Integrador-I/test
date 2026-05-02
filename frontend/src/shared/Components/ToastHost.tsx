import React from 'react';
import ReactDOM from 'react-dom';
import Toast from './Toast';
import type { ToastState } from '../Hooks/useToast';

interface ToastHostProps {
  toasts: ToastState[];
  onDismiss: (id: number) => void;
}

/**
 * Renders all active toasts in a fixed bottom-right portal.
 * Place <ToastHost> once near the root of the component that owns useToast().
 */
const ToastHost: React.FC<ToastHostProps> = ({ toasts, onDismiss }) => {
  const container = document.body;

  return ReactDOM.createPortal(
    <div className="toast-host" aria-label="Notificaciones">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          title={t.title}
          subtitle={t.subtitle}
          variant={t.variant}
          duration={t.duration}
          showProgress={t.showProgress}
          loading={t.loading}
          actionLabel={t.actionLabel}
          onAction={t.onAction}
          onClose={() => onDismiss(t.id)}
        />
      ))}
    </div>,
    container,
  );
};

export default ToastHost;
