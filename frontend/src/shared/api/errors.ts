/**
 * Normalized frontend error model.
 *
 * The backend returns two shapes:
 *   1. { message: string }
 *   2. { message: string, errors: { field: string[] } }   (Laravel 422)
 * plus 401 / 403 / 404 / 409 / 429 / 5xx / network / timeout conditions.
 *
 * Everything is funneled into a single ApiError so UI code has one contract.
 */
export type ApiErrorKind =
  | 'validation'
  | 'unauthenticated'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'server'
  | 'network'
  | 'timeout'
  | 'unknown';

export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly fieldErrors: FieldErrors;

  constructor(params: {
    kind: ApiErrorKind;
    message: string;
    status?: number | null;
    fieldErrors?: FieldErrors;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.kind = params.kind;
    this.status = params.status ?? null;
    this.fieldErrors = params.fieldErrors ?? {};
  }

  /** First error for a field, if any (handy for inline form messages). */
  fieldError(field: string): string | undefined {
    return this.fieldErrors[field]?.[0];
  }

  get isValidation(): boolean {
    return this.kind === 'validation';
  }
}
