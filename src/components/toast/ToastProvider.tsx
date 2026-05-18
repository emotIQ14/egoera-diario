'use client';

/**
 * Sistema de toasts con voz Egoera.
 *
 * Uso:
 *   const toast = useToast();
 *   toast.success('Entrada guardada · escucharte cuenta.');
 *   toast.error('Algo falló. Tu texto sigue aquí.', { retry: () => save() });
 *   toast.info('Estamos preparándolo.');
 *   toast.action('Borrado.', { actionLabel: 'Deshacer', onAction: undo });
 *
 * Reemplaza completamente window.alert() en la app. Accesible
 * (role="status" / "alert"), respetuoso con prefers-reduced-motion,
 * y con haptic feedback opcional en confirm.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type ToastTone = 'success' | 'error' | 'info' | 'action';

interface ToastInternal {
  id: number;
  message: string;
  tone: ToastTone;
  actionLabel?: string;
  onAction?: () => void;
  duration: number;
}

interface ToastOptions {
  duration?: number;
  haptic?: boolean;
}

interface ActionToastOptions extends ToastOptions {
  actionLabel: string;
  onAction: () => void;
}

interface ErrorToastOptions extends ToastOptions {
  retry?: () => void;
}

interface ToastAPI {
  success: (msg: string, opts?: ToastOptions) => void;
  error: (msg: string, opts?: ErrorToastOptions) => void;
  info: (msg: string, opts?: ToastOptions) => void;
  action: (msg: string, opts: ActionToastOptions) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastAPI | null>(null);

function vibrate(pattern: number | number[]) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch { /* no-op */ }
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast: Omit<ToastInternal, 'id'>) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { ...toast, id }]);
      if (toast.duration > 0) {
        window.setTimeout(() => dismiss(id), toast.duration);
      }
    },
    [dismiss],
  );

  const api = useMemo<ToastAPI>(() => ({
    success(msg, opts) {
      if (opts?.haptic !== false) vibrate(15);
      push({ message: msg, tone: 'success', duration: opts?.duration ?? 3000 });
    },
    error(msg, opts) {
      vibrate([20, 40, 20]);
      push({
        message: msg,
        tone: 'error',
        duration: opts?.duration ?? 5000,
        actionLabel: opts?.retry ? 'Reintentar' : undefined,
        onAction: opts?.retry,
      });
    },
    info(msg, opts) {
      push({ message: msg, tone: 'info', duration: opts?.duration ?? 3500 });
    },
    action(msg, opts) {
      push({
        message: msg,
        tone: 'action',
        duration: opts.duration ?? 5500,
        actionLabel: opts.actionLabel,
        onAction: opts.onAction,
      });
    },
    dismiss,
  }), [push, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>');
  }
  return ctx;
}

/* ---------- Viewport ---------- */

function ToastViewport({
  toasts,
  dismiss,
}: {
  toasts: ToastInternal[];
  dismiss: (id: number) => void;
}) {
  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
      <style jsx>{`
        .toast-viewport {
          position: fixed;
          left: 0;
          right: 0;
          bottom: calc(96px + env(safe-area-inset-bottom, 0px));
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 0 16px;
          pointer-events: none;
          z-index: 1000;
        }
      `}</style>
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastInternal;
  onDismiss: () => void;
}) {
  const role = toast.tone === 'error' ? 'alert' : 'status';
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`toast toast-${toast.tone} ${entered ? 'entered' : ''}`}
      role={role}
    >
      <p className="toast-msg">{toast.message}</p>
      {toast.actionLabel && toast.onAction ? (
        <button
          type="button"
          className="toast-action"
          onClick={() => {
            toast.onAction?.();
            onDismiss();
          }}
        >
          {toast.actionLabel}
        </button>
      ) : null}
      <style jsx>{`
        .toast {
          pointer-events: auto;
          max-width: 460px;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-radius: 16px;
          background: var(--ink, #0d0f3d);
          color: var(--crema, #f1ead8);
          font-family: var(--font-body), -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 14px;
          line-height: 1.4;
          box-shadow: 0 8px 28px rgba(13, 15, 61, 0.25);
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.22s ease, transform 0.22s ease;
        }
        .toast.entered {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .toast { transition: none; transform: none; }
        }
        .toast-success {
          background: var(--cobalto, #1d2bdb);
        }
        .toast-error {
          background: #b34a2c; /* coral oscuro, no rojo agresivo */
        }
        .toast-info {
          background: var(--ink, #0d0f3d);
        }
        .toast-action {
          background: var(--ink, #0d0f3d);
        }
        .toast-msg {
          flex: 1;
          margin: 0;
          font-family: var(--font-display), Georgia, serif;
          font-style: italic;
          font-size: 15px;
        }
        .toast-action {
          flex-shrink: 0;
          background: transparent;
          border: 1px solid currentColor;
          color: inherit;
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 6px 12px;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 600;
          opacity: 0.9;
        }
        .toast-action:hover,
        .toast-action:focus-visible {
          opacity: 1;
          outline: none;
        }
      `}</style>
    </div>
  );
}
