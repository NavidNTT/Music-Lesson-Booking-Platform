import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  CalendarClock,
  CalendarRange,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Music2,
  Settings,
  Star,
  Users,
  Wallet,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Brand } from '@/shared/ui/Brand';
import { UserRole } from '@/shared/types/api';
import { useAuth, useLogout } from '@/features/auth/hooks';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const navByRole: Record<UserRole, NavItem[]> = {
  student: [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/teachers', label: 'Find teachers', icon: Users },
    { to: '/student/bookings', label: 'My bookings', icon: CalendarClock },
    { to: '/student/wallet', label: 'Wallet', icon: Wallet },
  ],
  teacher: [
    { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/teacher/profile', label: 'My profile', icon: GraduationCap },
    { to: '/teacher/slots', label: 'Time slots', icon: CalendarRange },
    { to: '/teacher/bookings', label: 'Bookings', icon: CalendarClock },
    { to: '/teacher/wallet', label: 'Wallet', icon: Wallet },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/instruments', label: 'Instruments', icon: Music2 },
  ],
};

const roleLabel: Record<UserRole, string> = {
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Administrator',
};

const roleIcon: Record<UserRole, LucideIcon> = {
  student: Star,
  teacher: GraduationCap,
  admin: Settings,
};

export function DashboardLayout() {
  const { user } = useAuth();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const items = navByRole[user.role];
  const RoleIcon = roleIcon[user.role];

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Brand dark to={`/${user.role}`} />
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Dashboard">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gold-400 text-ink-950'
                    : 'text-ink-300 hover:bg-ink-800 hover:text-cream-50',
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-ink-800 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-800 text-gold-400">
            <RoleIcon className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-cream-50">{user.name}</p>
            <p className="text-xs text-ink-400">{roleLabel[user.role]}</p>
          </div>
        </div>
        <NavLink
          to={`/${user.role}/settings`}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-300 hover:bg-ink-800 hover:text-cream-50"
        >
          <Settings className="h-[18px] w-[18px]" aria-hidden />
          Settings
        </NavLink>
        <button
          onClick={() => logout.mutate()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-300 hover:bg-ink-800 hover:text-cream-50"
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-cream-100">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-ink-950 lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-ink-950 shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-ink-100 bg-cream-100/90 px-4 backdrop-blur lg:hidden">
          <button
            className="rounded-lg p-2 text-ink-700 hover:bg-ink-100"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Brand to={`/${user.role}`} />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
