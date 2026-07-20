import { Link, NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Menu, Music4, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui';
import { homePathForRole, useAuth, useLogout } from '@/features/auth/hooks';

function BrandMark({ dark = false }: { dark?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Cadenza home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900">
        <Music4 className="h-5 w-5 text-gold-400" aria-hidden />
      </span>
      <span
        className={cn(
          'font-display text-xl font-semibold tracking-tight',
          dark ? 'text-cream-50' : 'text-ink-900',
        )}
      >
        Cadenza
      </span>
    </Link>
  );
}

const publicLinks = [
  { to: '/teachers', label: 'Find a teacher' },
  { to: '/instruments', label: 'Instruments' },
];

export function PublicLayout() {
  const { user } = useAuth();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell-bg flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-ink-100/60 bg-cream-100/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <BrandMark />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-ink-900 text-cream-50' : 'text-ink-600 hover:bg-ink-100',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => logout.mutate()}>
                  Sign out
                </Button>
                <Link to={homePathForRole(user.role)}>
                  <Button size="sm">My dashboard</Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <nav
            className="border-t border-ink-100 bg-cream-50 px-4 py-3 md:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col gap-1">
              {publicLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-2.5 text-sm font-medium',
                      isActive ? 'bg-ink-900 text-cream-50' : 'text-ink-700 hover:bg-ink-100',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-ink-100 pt-3">
                {user ? (
                  <>
                    <Link to={homePathForRole(user.role)} onClick={() => setMobileOpen(false)}>
                      <Button className="w-full">My dashboard</Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setMobileOpen(false);
                        logout.mutate();
                      }}
                    >
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign in
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full">Get started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink-100 bg-ink-950 text-cream-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 sm:flex-row sm:justify-between sm:px-6">
          <BrandMark dark />
          <p className="text-sm text-ink-300">
            Private music lessons with teachers you'll love.
          </p>
          <div className="h-1 w-24 text-gold-500/60 waveform-accent" aria-hidden />
        </div>
      </footer>
    </div>
  );
}
