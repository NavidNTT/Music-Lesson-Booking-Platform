import { AlertTriangle } from 'lucide-react';
import { ApiError } from '@/shared/api/errors';
import { Button } from './Button';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const message =
    error instanceof ApiError ? error.message : 'Something went wrong while loading this content.';

  return (
    <div
      className={
        'flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center ' +
        (className ?? '')
      }
      role="alert"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </div>
      <p className="max-w-sm text-sm font-medium text-red-800">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
