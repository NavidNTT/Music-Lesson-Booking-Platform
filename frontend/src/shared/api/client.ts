import axios from 'axios';
import { env } from '@/shared/config/env';
import { tokenStorage } from './tokenStorage';
import { normalizeError } from './normalizeError';

/**
 * Called when the API reports 401 (token expired / invalid). Since the backend
 * has no refresh mechanism, expiry is a hard logout. The auth layer registers a
 * handler here to purge session state and redirect — we avoid importing the
 * store directly to keep this module free of circular dependencies.
 */
let onUnauthenticated: (() => void) | null = null;

export function setUnauthenticatedHandler(handler: () => void): void {
  onUnauthenticated = handler;
}

export const apiClient = axios.create({
  baseURL: env.apiV1Url,
  timeout: 20000,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = normalizeError(error);

    if (apiError.kind === 'unauthenticated') {
      tokenStorage.clear();
      onUnauthenticated?.();
    }

    // Always reject with the normalized error so callers get one shape.
    return Promise.reject(apiError);
  },
);
