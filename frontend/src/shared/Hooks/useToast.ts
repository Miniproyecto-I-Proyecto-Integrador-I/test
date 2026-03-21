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
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
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
      actionLabel,
      onAction,
      id: customId,
    }: Omit<ToastState, 'id'> & { id?: number }): number => {
      const id = customId ?? nextId();
      shownAt.current.set(id, Date.now());
      setToasts((prev) => {
        const index = prev.findIndex((t) => t.id === id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = {
            id,
            title,
            subtitle,
            variant,
            duration,
            showProgress,
            loading,
            actionLabel,
            onAction,
          };
          return next;
        }
        return [
          ...prev,
          {
            id,
            title,
            subtitle,
            variant,
            duration,
            showProgress,
            loading,
            actionLabel,
            onAction,
          },
        ];
      });
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

  const success = useCallback(
    (title: string, subtitle?: string, duration?: number, id?: number) =>
      show({ title, subtitle, variant: 'success', duration: duration ?? 4000, showProgress: true, loading: false, id }),
    [show],
  );

  const error = useCallback(
    (title: string, subtitle?: string, duration?: number, id?: number) =>
      show({ title, subtitle, variant: 'error', duration: duration ?? 5000, showProgress: true, loading: false, id }),
    [show],
  );

  const loading = useCallback(
    (title: string, subtitle?: string, id?: number): number =>
      show({ title, subtitle, variant: 'loading', duration: 0, showProgress: false, loading: true, id }),
    [show],
  );

  const warning = useCallback(
    (title: string, subtitle?: string, duration?: number, id?: number) =>
      show({ title, subtitle, variant: 'warning', duration: duration ?? 4500, showProgress: true, loading: false, id }),
    [show],
  );

  return { toasts, show, dismiss, success, error, loading, warning };
}
