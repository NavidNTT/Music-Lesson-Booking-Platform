import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from '@/shared/api/errors';

/**
 * Maps a normalized ApiError's field errors onto a react-hook-form instance.
 * Returns a top-level message suitable for a form-level banner/toast when the
 * error is not field-specific (e.g. the "catch-and-rewrap" 422 shape the
 * backend uses in some controllers, which has no `errors` object).
 */
export function applyApiErrorToForm<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): string | null {
  if (!(error instanceof ApiError)) {
    return 'An unexpected error occurred.';
  }

  if (error.isValidation && Object.keys(error.fieldErrors).length > 0) {
    for (const [field, messages] of Object.entries(error.fieldErrors)) {
      if (messages?.length) {
        setError(field as Path<T>, { type: 'server', message: messages[0] });
      }
    }
    return null;
  }

  // Non-field error (auth, conflict, generic 422 message, network, etc.)
  return error.message;
}
