import { forwardRef, useId } from 'react';
import { cn } from '@/shared/lib/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          className={cn(
            'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 shadow-sm transition',
            error ? 'border-red-400' : 'border-ink-200 focus:border-gold-400',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
