/**
 * Centralized, typed access to build-time environment configuration.
 * Never hardcode backend URLs elsewhere — always read from here.
 */
const rawApiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

// Strip trailing slash so we can safely append the versioned path.
const apiBase = rawApiUrl.replace(/\/+$/, '');

export const env = {
  /** e.g. http://localhost:8000 */
  apiBaseUrl: apiBase,
  /** e.g. http://localhost:8000/api/v1 */
  apiV1Url: `${apiBase}/api/v1`,
} as const;
