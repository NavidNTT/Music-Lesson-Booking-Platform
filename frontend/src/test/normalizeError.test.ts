import { describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { normalizeError } from '@/shared/api/normalizeError';
import { ApiError } from '@/shared/api/errors';

function axiosErrorWith(status: number, data: unknown): AxiosError {
  return new AxiosError('Request failed', String(status), undefined, undefined, {
    status,
    statusText: '',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
    data,
  });
}

describe('normalizeError', () => {
  it('maps Laravel 422 with field errors to a validation ApiError', () => {
    const err = normalizeError(
      axiosErrorWith(422, {
        message: 'The given data was invalid.',
        errors: { email: ['The email has already been taken.'] },
      }),
    );

    expect(err).toBeInstanceOf(ApiError);
    expect(err.kind).toBe('validation');
    expect(err.fieldError('email')).toBe('The email has already been taken.');
    expect(err.message).toBe('The given data was invalid.');
  });

  it('maps 422 with message only (service catch shape) to validation with no field errors', () => {
    const err = normalizeError(axiosErrorWith(422, { message: 'Insufficient wallet balance.' }));

    expect(err.kind).toBe('validation');
    expect(err.message).toBe('Insufficient wallet balance.');
    expect(Object.keys(err.fieldErrors)).toHaveLength(0);
  });

  it('maps 401 to unauthenticated', () => {
    const err = normalizeError(axiosErrorWith(401, { message: 'Unauthenticated.' }));
    expect(err.kind).toBe('unauthenticated');
  });

  it('maps 403 to forbidden', () => {
    const err = normalizeError(
      axiosErrorWith(403, { message: 'Access denied. You do not have the required role.' }),
    );
    expect(err.kind).toBe('forbidden');
    expect(err.message).toContain('Access denied');
  });

  it('maps 404 to not_found', () => {
    const err = normalizeError(axiosErrorWith(404, { message: 'Resource not found.' }));
    expect(err.kind).toBe('not_found');
  });

  it('maps 429 to rate_limited', () => {
    const err = normalizeError(axiosErrorWith(429, { message: 'Too Many Attempts.' }));
    expect(err.kind).toBe('rate_limited');
  });

  it('maps 500 to server', () => {
    const err = normalizeError(axiosErrorWith(500, { message: 'Server Error' }));
    expect(err.kind).toBe('server');
  });

  it('maps a request with no response to network', () => {
    const err = normalizeError(new AxiosError('Network Error'));
    expect(err.kind).toBe('network');
  });

  it('maps timeouts to timeout', () => {
    const timeoutError = new AxiosError('timeout exceeded', 'ECONNABORTED');
    const err = normalizeError(timeoutError);
    expect(err.kind).toBe('timeout');
  });

  it('passes ApiError instances through unchanged', () => {
    const original = new ApiError({ kind: 'conflict', message: 'nope' });
    expect(normalizeError(original)).toBe(original);
  });

  it('falls back to a default message when the body has none', () => {
    const err = normalizeError(axiosErrorWith(500, {}));
    expect(err.message.length).toBeGreaterThan(0);
  });
});
