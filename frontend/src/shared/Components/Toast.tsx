import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-react';
import '../Styles/Toast.css';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastProps {
  /** Título principal en negrita */
  title: string;
  /** Texto secundario descriptivo */
  subtitle?: string;
  /** Variante visual que determina el color e ícono */
  variant?: ToastVariant;
  /** Duración en ms antes de cerrarse automáticamente (0 = no auto-close) */
  duration?: number;
  /** Muestra la barra de progreso de tiempo */
  showProgress?: boolean;
  /** Muestra un spinner de carga en lugar del ícono estático */
  loading?: boolean;
  /** Callback al cerrarse */
  onClose?: () => void;
}

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 size={22} strokeWidth={2.2} />,
  error: <XCircle size={22} strokeWidth={2.2} />,
  warning: <AlertTriangle size={22} strokeWidth={2.2} />,
  info: <Info size={22} strokeWidth={2.2} />,
  loading: <Loader2 size={22} strokeWidth={2.2} className="toast-spin" />,
};

const Toast: React.FC<ToastProps> = ({
  title,
  subtitle,
  variant = 'success',
  duration = 4000,
  showProgress = true,
  loading = false,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const effectiveVariant: ToastVariant = loading ? 'loading' : variant;

  // Slide-in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Auto-close + progress bar
  useEffect(() => {
    if (duration <= 0 || loading) return;

    const tick = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    closeTimer.current = setTimeout(() => handleClose(), duration);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, loading]);

  const handleClose = () => {
    if (exiting) return;
    setExiting(true);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTimeout(() => onClose?.(), 320);
  };

  const cls = [
    'toast',
    `toast--${effectiveVariant}`,
    visible ? 'toast--visible' : '',
    exiting ? 'toast--exiting' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} role="alert" aria-live="polite">
      <div className={`toast__accent toast__accent--${effectiveVariant}`} />
      <div className={`toast__icon-wrap toast__icon-wrap--${effectiveVariant}`}>
        {ICONS[effectiveVariant]}
      </div>
      <div className="toast__body">
        <span className="toast__title">{title}</span>
        {subtitle && <span className="toast__subtitle">{subtitle}</span>}
      </div>
      <button
        className="toast__close"
        onClick={handleClose}
        aria-label="Cerrar notificación"
        type="button"
      >
        <X size={16} strokeWidth={2} />
      </button>
      {showProgress && duration > 0 && !loading && (
        <div className="toast__progress">
          <div
            className={`toast__progress-fill toast__progress-fill--${effectiveVariant}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default Toast;
