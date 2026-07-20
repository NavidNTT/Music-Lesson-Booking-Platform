import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  push: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = ++counter;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (title, description) => push({ tone: 'success', title, description }),
      error: (title, description) => push({ tone: 'error', title, description }),
      info: (title, description) => push({ tone: 'info', title, description }),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => remove(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const toneStyles: Record<ToastTone, { icon: typeof Info; ring: string; iconColor: string }> = {
  success: { icon: CheckCircle2, ring: 'border-emerald-200', iconColor: 'text-emerald-500' },
  error: { icon: XCircle, ring: 'border-red-200', iconColor: 'text-red-500' },
  info: { icon: Info, ring: 'border-ink-200', iconColor: 'text-ink-500' },
};

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const { icon: Icon, ring, iconColor } = toneStyles[toast.tone];

  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-sm animate-fade-in items-start gap-3 rounded-xl border bg-white p-4 shadow-card-hover',
        ring,
      )}
      role="status"
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconColor)} aria-hidden />
      <div className="flex-1">
        <p className="text-sm font-semibold text-ink-900">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-sm text-ink-500">{toast.description}</p>}
      </div>
      <button
        onClick={onDismiss}
        className="rounded-lg p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-600"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
