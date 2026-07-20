import { forwardRef, useId } from 'react';
import { cn } from '@/shared/lib/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 shadow-sm transition',
            'placeholder:text-ink-400 min-h-[96px]',
            error ? 'border-red-400 focus:border-red-500' : 'border-ink-200 focus:border-gold-400',
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
        {error && (
          <p id={errorId} className="mt-1 text-xs font-medium text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
