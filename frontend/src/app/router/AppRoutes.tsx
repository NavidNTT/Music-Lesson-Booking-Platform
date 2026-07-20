import { Route, Routes } from 'react-router-dom';
import { UserRole } from '@/shared/types/api';
import { useSessionBootstrap } from '@/features/auth/hooks';

import { PublicLayout } from '@/app/layouts/PublicLayout';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { RedirectIfAuthenticated, RequireAuth, RequireRole } from './guards';
import { ForbiddenPage, NotFoundPage } from './ErrorPages';

import { LandingPage } from '@/features/marketing/LandingPage';
import { InstrumentsPage } from '@/features/instruments/InstrumentsPage';
import { TeachersPage } from '@/features/teachers/TeachersPage';
import { TeacherDetailPage } from '@/features/teachers/TeacherDetailPage';

import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { SettingsPage } from '@/features/profile/SettingsPage';

import { StudentDashboard } from '@/features/student-bookings/StudentDashboard';
import { StudentBookingsPage } from '@/features/student-bookings/StudentBookingsPage';
import { WalletPage } from '@/features/wallet/WalletPage';

import { TeacherDashboard } from '@/features/teacher-profile/TeacherDashboard';
import { TeacherProfilePage } from '@/features/teacher-profile/TeacherProfilePage';
import { TeacherSlotsPage } from '@/features/teacher-slots/TeacherSlotsPage';
import { TeacherBookingsPage } from '@/features/teacher-bookings/TeacherBookingsPage';

import { AdminDashboard } from '@/features/admin-instruments/AdminDashboard';
import { AdminInstrumentsPage } from '@/features/admin-instruments/AdminInstrumentsPage';

export function AppRoutes() {
  useSessionBootstrap();

  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="instruments" element={<InstrumentsPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="teachers/:teacherId" element={<TeacherDetailPage />} />
      </Route>

      {/* Auth (redirects away if already signed in) */}
      <Route element={<RedirectIfAuthenticated />}>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      {/* Authenticated dashboards */}
      <Route element={<RequireAuth />}>
        {/* Student */}
        <Route element={<RequireRole allow={[UserRole.Student]} />}>
          <Route path="student" element={<DashboardLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="bookings" element={<StudentBookingsPage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Teacher */}
        <Route element={<RequireRole allow={[UserRole.Teacher]} />}>
          <Route path="teacher" element={<DashboardLayout />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="profile" element={<TeacherProfilePage />} />
            <Route path="slots" element={<TeacherSlotsPage />} />
            <Route path="bookings" element={<TeacherBookingsPage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<RequireRole allow={[UserRole.Admin]} />}>
          <Route path="admin" element={<DashboardLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="instruments" element={<AdminInstrumentsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="forbidden" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
