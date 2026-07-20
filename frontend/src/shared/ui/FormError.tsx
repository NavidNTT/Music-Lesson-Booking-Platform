import { AlertCircle } from 'lucide-react';

/** Form-level (non-field) error banner. */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800"
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
