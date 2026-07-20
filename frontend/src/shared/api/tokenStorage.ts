/**
 * Token persistence.
 *
 * We use localStorage for the Sanctum personal-access (Bearer) token. This is
 * the accepted tradeoff for a token-based SPA: the backend issues Bearer tokens
 * (not stateful cookies) and CORS runs with supports_credentials=false, so a
 * cookie-based approach is not available without backend changes.
 */
const TOKEN_KEY = 'cadenza.token';

// In-module cache avoids repeated synchronous localStorage reads on every request.
let cached: string | null | undefined;

export const tokenStorage = {
  get(): string | null {
    if (cached === undefined) {
      cached = localStorage.getItem(TOKEN_KEY);
    }
    return cached;
  },
  set(token: string): void {
    cached = token;
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    cached = null;
    localStorage.removeItem(TOKEN_KEY);
  },
};
