import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageLoader } from '@/shared/ui';
import { UserRole } from '@/shared/types/api';
import { homePathForRole, useAuth } from '@/features/auth/hooks';

/** Requires an authenticated session; otherwise redirects to /login. */
export function RequireAuth() {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <PageLoader label="Restoring your session" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

/** Requires the session to hold one of the allowed roles; otherwise shows 403. */
export function RequireRole({ allow }: { allow: UserRole[] }) {
  const { user, initializing } = useAuth();

  if (initializing) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/forbidden" replace />;

  return <Outlet />;
}

/** For /login and /register: authenticated users are bounced to their home. */
export function RedirectIfAuthenticated() {
  const { user, initializing } = useAuth();

  if (initializing) return <PageLoader />;
  if (user) return <Navigate to={homePathForRole(user.role)} replace />;

  return <Outlet />;
}
