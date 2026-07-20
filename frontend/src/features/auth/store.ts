import { create } from 'zustand';
import { tokenStorage } from '@/shared/api/tokenStorage';
import type { User } from './schemas';

/**
 * Minimal client-side session state. Server data lives in TanStack Query;
 * this store only tracks the authenticated identity and token lifecycle.
 */
interface AuthState {
  user: User | null;
  /** true until the initial /me fetch (or "no token" check) resolves */
  initializing: boolean;
  setSession: (user: User, token: string) => void;
  setUser: (user: User | null) => void;
  setInitializing: (value: boolean) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initializing: true,
  setSession: (user, token) => {
    tokenStorage.set(token);
    set({ user, initializing: false });
  },
  setUser: (user) => set({ user, initializing: false }),
  setInitializing: (value) => set({ initializing: value }),
  clearSession: () => {
    tokenStorage.clear();
    set({ user: null, initializing: false });
  },
}));
