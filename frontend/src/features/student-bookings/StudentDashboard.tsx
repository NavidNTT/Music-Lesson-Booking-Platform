import { Link } from 'react-router-dom';
import { CalendarClock, Search, Wallet as WalletIcon } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, CardTitle, EmptyState } from '@/shared/ui';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Skeleton } from '@/shared/ui/Skeleton';
import { BookingStatusBadge } from '@/shared/ui/BookingStatusBadge';
import { formatCurrency, formatDate, formatTime } from '@/shared/lib/format';
import { BookingStatus } from '@/shared/types/api';
import { useAuth } from '@/features/auth/hooks';
import { useWallet } from '@/features/wallet/hooks';
import { useStudentBookings } from './hooks';

export function StudentDashboard() {
  const { user } = useAuth();
  const wallet = useWallet();
  const bookings = useStudentBookings(1);

  const upcoming = (bookings.data?.data ?? []).filter((b) =>
    [BookingStatus.Pending, BookingStatus.Confirmed].includes(b.status as never),
  );

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'there'}`}
        description="Here's what's happening with your lessons."
        actions={
          <Link to="/teachers">
            <Button>
              <Search className="h-4 w-4" aria-hidden />
              Find a teacher
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
                <WalletIcon className="h-5 w-5" aria-hidden />
              </div>
              <Link to="/student/wallet" className="text-sm font-medium text-gold-700 hover:underline">
                Manage
              </Link>
            </div>
            <p className="mt-4 text-xs text-ink-400">Wallet balance</p>
            {wallet.isLoading ? (
              <Skeleton className="mt-1 h-8 w-32" />
            ) : (
              <p className="font-display text-2xl font-semibold text-ink-900">
                {formatCurrency(wallet.data?.balance ?? 0)}
              </p>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Upcoming lessons</CardTitle>
            <Link to="/student/bookings" className="text-sm font-medium text-gold-700 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardBody>
            {bookings.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
            ) : upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="No upcoming lessons"
                description="Book a lesson to get started."
                action={
                  <Link to="/teachers">
                    <Button size="sm">Browse teachers</Button>
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-ink-100">
                {upcoming.slice(0, 5).map((booking) => (
                  <li key={booking.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-ink-900">
                        {booking.teacher?.user?.name ?? 'Teacher'}
                      </p>
                      <p className="text-xs text-ink-500">
                        {booking.time_slot
                          ? `${formatDate(booking.time_slot.starts_at)} · ${formatTime(booking.time_slot.starts_at)}`
                          : '—'}
                      </p>
                    </div>
                    <BookingStatusBadge status={booking.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
