import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CalendarX2 } from 'lucide-react';
import { Button, Card, CardBody, EmptyState, ErrorState } from '@/shared/ui';
import { CardSkeleton } from '@/shared/ui/Skeleton';
import { Pagination } from '@/shared/ui/Pagination';
import { PageHeader } from '@/shared/ui/PageHeader';
import { BookingStatusBadge } from '@/shared/ui/BookingStatusBadge';
import { ConfirmDialog } from '@/shared/ui/Modal';
import { formatCurrency, formatDate, formatTime } from '@/shared/lib/format';
import { ApiError } from '@/shared/api/errors';
import { useToast } from '@/shared/ui';
import { BookingStatus } from '@/shared/types/api';
import { ReviewDialog } from '@/features/reviews/ReviewDialog';
import { useCancelBooking, useStudentBookings } from './hooks';
import type { Booking } from './api';

export function StudentBookingsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useStudentBookings(page);
  const cancelBooking = useCancelBooking();
  const toast = useToast();

  const [toCancel, setToCancel] = useState<Booking | null>(null);
  const [toReview, setToReview] = useState<Booking | null>(null);

  const bookings = data?.data ?? [];

  const doCancel = async () => {
    if (!toCancel) return;
    try {
      await cancelBooking.mutateAsync({ id: toCancel.id });
      setToCancel(null);
    } catch (err) {
      toast.error('Cannot cancel', err instanceof ApiError ? err.message : 'Please try again.');
      setToCancel(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="My bookings"
        description="Track your lesson requests and history."
        actions={
          <Link to="/teachers">
            <Button>Book a lesson</Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No bookings yet"
          description="When you book a lesson, it will show up here."
          action={
            <Link to="/teachers">
              <Button>Find a teacher</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                onCancel={() => setToCancel(booking)}
                onReview={() => setToReview(booking)}
              />
            ))}
          </div>
          {data && <Pagination page={data.current_page} lastPage={data.last_page} onChange={setPage} />}
        </>
      )}

      <ConfirmDialog
        open={toCancel !== null}
        title="Cancel this booking?"
        description="Cancellations must be made at least 24 hours before the lesson. If the booking was confirmed, your payment will be refunded to your wallet."
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        danger
        loading={cancelBooking.isPending}
        onConfirm={doCancel}
        onClose={() => setToCancel(null)}
      />

      <ReviewDialog
        bookingId={toReview?.id ?? null}
        teacherName={toReview?.teacher?.user?.name}
        onClose={() => setToReview(null)}
      />
    </div>
  );
}

function BookingRow({
  booking,
  onCancel,
  onReview,
}: {
  booking: Booking;
  onCancel: () => void;
  onReview: () => void;
}) {
  const teacherName = booking.teacher?.user?.name ?? 'Teacher';
  const slot = booking.time_slot;
  const canCancel =
    booking.status === BookingStatus.Pending || booking.status === BookingStatus.Confirmed;
  const canReview = booking.status === BookingStatus.Completed && !booking.review;

  return (
    <Card>
      <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display text-lg font-semibold text-ink-900">{teacherName}</p>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="mt-1 text-sm text-ink-500">
            {slot ? (
              <>
                {formatDate(slot.starts_at)} · {formatTime(slot.starts_at)} –{' '}
                {formatTime(slot.ends_at)}
              </>
            ) : (
              'Lesson time unavailable'
            )}
          </p>
          <p className="mt-0.5 text-sm font-medium text-ink-700">
            {formatCurrency(booking.price_amount)}
          </p>
          {booking.status === BookingStatus.Cancelled && booking.cancellation_reason && (
            <p className="mt-1 text-xs text-ink-400">Reason: {booking.cancellation_reason}</p>
          )}
          {booking.review && (
            <p className="mt-1 text-xs text-emerald-600">
              You rated this lesson {booking.review.rating}/5
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          {canReview && (
            <Button size="sm" onClick={onReview}>
              Leave review
            </Button>
          )}
          {canCancel && (
            <Button size="sm" variant="outline" onClick={onCancel}>
              <CalendarX2 className="h-4 w-4" aria-hidden />
              Cancel
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
