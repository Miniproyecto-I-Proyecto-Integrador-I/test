import { useState, useCallback, useRef } from 'react';
import type { ToastVariant } from '../Components/Toast';

export interface ToastState {
  id: number;
  title: string;
  subtitle?: string;
  variant: ToastVariant;
  duration: number;
  showProgress: boolean;
  loading: boolean;
}

/** Min time a toast is visible before it can be auto-dismissed (ms) */
const MIN_VISIBLE_MS = 800;

let _id = 0;
const nextId = () => ++_id;

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const shownAt = useRef<Map<number, number>>(new Map());

  const show = useCallback(
    ({
      title,
      subtitle,
      variant = 'success',
      duration = 4000,
      showProgress = true,
      loading = false,
    }: Omit<ToastState, 'id'>): number => {
      const id = nextId();
      shownAt.current.set(id, Date.now());
      setToasts((prev) => [...prev, { id, title, subtitle, variant, duration, showProgress, loading }]);
      return id;
    },
    [],
  );

  const dismiss = useCallback((id: number) => {
    const shownTime = shownAt.current.get(id) ?? 0;
    const elapsed = Date.now() - shownTime;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      shownAt.current.delete(id);
    }, remaining);
  }, []);

  /** Convenience helpers */
  const success = useCallback(
    (title: string, subtitle?: string, duration?: number) =>
      show({ title, subtitle, variant: 'success', duration: duration ?? 4000, showProgress: true, loading: false }),
    [show],
  );

  const error = useCallback(
    (title: string, subtitle?: string, duration?: number) =>
      show({ title, subtitle, variant: 'error', duration: duration ?? 5000, showProgress: true, loading: false }),
    [show],
  );

  const loading = useCallback(
    (title: string, subtitle?: string): number =>
      show({ title, subtitle, variant: 'loading', duration: 0, showProgress: false, loading: true }),
    [show],
  );

  const warning = useCallback(
    (title: string, subtitle?: string, duration?: number) =>
      show({ title, subtitle, variant: 'warning', duration: duration ?? 4500, showProgress: true, loading: false }),
    [show],
  );

  return { toasts, show, dismiss, success, error, loading, warning };
}
