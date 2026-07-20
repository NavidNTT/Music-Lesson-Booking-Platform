import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Don't retry client errors (auth, validation, not-found, etc.).
        if (error instanceof ApiError) {
          if (['unauthenticated', 'forbidden', 'not_found', 'validation'].includes(error.kind)) {
            return false;
          }
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Mutations (bookings, wallet, etc.) are never auto-retried — they are
      // not idempotent and involve money/state transitions.
      retry: false,
    },
  },
});
