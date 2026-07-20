import { Link } from 'react-router-dom';
import { CalendarClock, Star, User } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, CardTitle, EmptyState } from '@/shared/ui';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Skeleton } from '@/shared/ui/Skeleton';
import { BookingStatusBadge } from '@/shared/ui/BookingStatusBadge';
import { formatCurrency, formatDate, formatTime } from '@/shared/lib/format';
import { BookingStatus } from '@/shared/types/api';
import { useAuth } from '@/features/auth/hooks';
import { useMyTeacherProfile } from '@/features/teacher-profile/hooks';
import { useTeacherBookings } from '@/features/teacher-bookings/hooks';

export function TeacherDashboard() {
  const { user } = useAuth();
  const profile = useMyTeacherProfile();
  const bookings = useTeacherBookings(1);

  const pending = (bookings.data?.data ?? []).filter((b) => b.status === BookingStatus.Pending);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'there'}`}
        description="Manage your teaching profile and track bookings."
        actions={
          profile.data ? (
            <Link to="/teacher/slots">
              <Button>
                <CalendarClock className="h-4 w-4" aria-hidden />
                Manage slots
              </Button>
            </Link>
          ) : (
            <Link to="/teacher/profile">
              <Button>Complete your profile</Button>
            </Link>
          )
        }
      />

      {!profile.data && !profile.isLoading && (
        <div className="mb-6 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-800">
          <p className="font-medium">Profile incomplete</p>
          <p className="mt-0.5 text-gold-700">
            Complete your profile and add instruments to start appearing in search results.{' '}
            <Link to="/teacher/profile" className="underline">
              Set up now
            </Link>
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardBody>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
              <User className="h-5 w-5" aria-hidden />
            </div>
            <p className="mt-4 text-xs text-ink-400">Your profile</p>
            {profile.isLoading ? (
              <Skeleton className="mt-1 h-6 w-20" />
            ) : profile.data ? (
              <>
                <p className="text-sm font-medium text-ink-900">
                  {profile.data.is_active ? 'Active' : 'Inactive'}
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  {formatCurrency(profile.data.price_per_session)}/session
                </p>
                {profile.data.rating_avg !== null && profile.data.rating_count > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-ink-600">
                    <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" aria-hidden />
                    <span className="font-medium">{profile.data.rating_avg.toFixed(1)}</span>
                    <span className="text-ink-400">({profile.data.rating_count})</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-ink-500">Not set up</p>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Pending confirmations</CardTitle>
            <Link to="/teacher/bookings" className="text-sm font-medium text-gold-700 hover:underline">
              View all bookings
            </Link>
          </CardHeader>
          <CardBody>
            {bookings.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
            ) : pending.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="No pending bookings"
                description="New student booking requests will appear here."
              />
            ) : (
              <ul className="divide-y divide-ink-100">
                {pending.slice(0, 5).map((booking) => (
                  <li key={booking.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-ink-900">
                        {booking.student?.user?.name ?? 'Student'}
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
