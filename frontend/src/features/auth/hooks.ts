import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { queryClient } from '@/app/providers/queryClient';
import { setUnauthenticatedHandler } from '@/shared/api/client';
import { tokenStorage } from '@/shared/api/tokenStorage';
import { UserRole } from '@/shared/types/api';
import { useToast } from '@/shared/ui';
import { authApi } from './api';
import { useAuthStore } from './store';
import type { AuthPayload, User } from './schemas';

/** Where each role lands after login. */
export function homePathForRole(role: UserRole): string {
  switch (role) {
    case UserRole.Admin:
      return '/admin';
    case UserRole.Teacher:
      return '/teacher';
    case UserRole.Student:
      return '/student';
  }
}

export function useAuth() {
  const { user, initializing } = useAuthStore();
  return {
    user,
    initializing,
    isAuthenticated: user !== null,
    isStudent: user?.role === UserRole.Student,
    isTeacher: user?.role === UserRole.Teacher,
    isAdmin: user?.role === UserRole.Admin,
  };
}

/**
 * Bootstraps the session on app start: if a token exists, fetch /me.
 * Also registers the global 401 handler (hard logout — no refresh tokens
 * exist on this backend).
 */
export function useSessionBootstrap() {
  const { setUser, clearSession, setInitializing } = useAuthStore();

  useEffect(() => {
    setUnauthenticatedHandler(() => {
      useAuthStore.getState().clearSession();
      queryClient.clear();
    });

    const token = tokenStorage.get();
    if (!token) {
      setInitializing(false);
      return;
    }

    authApi
      .me()
      .then((user) => setUser(user))
      .catch(() => clearSession());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function applySession(payload: AuthPayload): User {
  useAuthStore.getState().setSession(payload.user, payload.token);
  return payload.user;
}

export function useLogin() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (payload) => {
      const user = applySession(payload);
      navigate(homePathForRole(user.role), { replace: true });
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (payload) => {
      const user = applySession(payload);
      navigate(homePathForRole(user.role), { replace: true });
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const toast = useToast();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      // Even if the API call fails (e.g. token already dead), clear locally.
      useAuthStore.getState().clearSession();
      queryClient.clear();
      toast.info('Signed out', 'See you next time.');
      navigate('/', { replace: true });
    },
  });
}

export function useUpdateProfile() {
  const toast = useToast();
  return useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: (user) => {
      useAuthStore.getState().setUser(user);
      toast.success('Profile updated');
    },
  });
}
