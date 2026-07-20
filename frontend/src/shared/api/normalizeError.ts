import { AxiosError } from 'axios';
import { ApiError, type ApiErrorKind, type FieldErrors } from './errors';

interface LaravelErrorBody {
  message?: string;
  errors?: FieldErrors;
}

function kindFromStatus(status: number): ApiErrorKind {
  switch (status) {
    case 401:
      return 'unauthenticated';
    case 403:
      return 'forbidden';
    case 404:
      return 'not_found';
    case 409:
      return 'conflict';
    case 422:
      return 'validation';
    case 429:
      return 'rate_limited';
    default:
      return status >= 500 ? 'server' : 'unknown';
  }
}

const DEFAULT_MESSAGES: Record<ApiErrorKind, string> = {
  validation: 'Please check the highlighted fields.',
  unauthenticated: 'Your session has expired. Please sign in again.',
  forbidden: 'You do not have permission to do that.',
  not_found: 'We could not find what you were looking for.',
  conflict: 'That action conflicts with the current state.',
  rate_limited: 'Too many attempts. Please wait a moment and try again.',
  server: 'Something went wrong on our end. Please try again shortly.',
  network: 'Cannot reach the server. Check your connection and try again.',
  timeout: 'The request took too long. Please try again.',
  unknown: 'An unexpected error occurred.',
};

/** Convert any thrown value (usually an AxiosError) into an ApiError. */
export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof AxiosError) {
    if (error.code === 'ECONNABORTED') {
      return new ApiError({ kind: 'timeout', message: DEFAULT_MESSAGES.timeout });
    }

    if (!error.response) {
      return new ApiError({ kind: 'network', message: DEFAULT_MESSAGES.network });
    }

    const status = error.response.status;
    const kind = kindFromStatus(status);
    const body = (error.response.data ?? {}) as LaravelErrorBody;

    return new ApiError({
      kind,
      status,
      message: body.message?.trim() || DEFAULT_MESSAGES[kind],
      fieldErrors: kind === 'validation' ? body.errors ?? {} : {},
    });
  }

  if (error instanceof Error) {
    return new ApiError({ kind: 'unknown', message: error.message });
  }

  return new ApiError({ kind: 'unknown', message: DEFAULT_MESSAGES.unknown });
}
