import { useState } from 'react';
import { CalendarClock, Check, X } from 'lucide-react';
import { Button, Card, CardBody, EmptyState, ErrorState } from '@/shared/ui';
import { CardSkeleton } from '@/shared/ui/Skeleton';
import { Pagination } from '@/shared/ui/Pagination';
import { PageHeader } from '@/shared/ui/PageHeader';
import { BookingStatusBadge } from '@/shared/ui/BookingStatusBadge';
import { ConfirmDialog, Modal } from '@/shared/ui/Modal';
import { Textarea } from '@/shared/ui';
import { formatCurrency, formatDate, formatTime } from '@/shared/lib/format';
import { ApiError } from '@/shared/api/errors';
import { useToast } from '@/shared/ui';
import { BookingStatus } from '@/shared/types/api';
import {
  useCancelBookingAsTeacher,
  useCompleteBooking,
  useConfirmBooking,
  useTeacherBookings,
} from './hooks';
import type { TeacherBooking } from './api';

type Action = 'confirm' | 'complete' | 'cancel';

export function TeacherBookingsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useTeacherBookings(page);
  const [actionTarget, setActionTarget] = useState<{ booking: TeacherBooking; action: Action } | null>(
    null,
  );

  const bookings = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="Manage student lesson requests and track completed sessions."
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No bookings yet"
          description="When students book your time slots, they'll appear here."
        />
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onAction={(action) => setActionTarget({ booking, action })}
              />
            ))}
          </div>
          {data && <Pagination page={data.current_page} lastPage={data.last_page} onChange={setPage} />}
        </>
      )}

      {actionTarget && (
        <ActionDialog
          booking={actionTarget.booking}
          action={actionTarget.action}
          onClose={() => setActionTarget(null)}
        />
      )}
    </div>
  );
}

function BookingCard({
  booking,
  onAction,
}: {
  booking: TeacherBooking;
  onAction: (action: Action) => void;
}) {
  const studentName = booking.student?.user?.name ?? 'Student';
  const slot = booking.time_slot;
  const canConfirm = booking.status === BookingStatus.Pending;
  const canComplete = booking.status === BookingStatus.Confirmed;
  const canCancel = canConfirm || canComplete;

  return (
    <Card>
      <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display text-lg font-semibold text-ink-900">{studentName}</p>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="mt-1 text-sm text-ink-500">
            {slot ? (
              <>
                {formatDate(slot.starts_at)} · {formatTime(slot.starts_at)} – {formatTime(slot.ends_at)}
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
          {booking.student?.phone && (
            <p className="mt-1 text-xs text-ink-400">Contact: {booking.student.phone}</p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          {canConfirm && (
            <Button size="sm" onClick={() => onAction('confirm')}>
              <Check className="h-4 w-4" aria-hidden />
              Confirm
            </Button>
          )}
          {canComplete && (
            <Button size="sm" variant="outline" onClick={() => onAction('complete')}>
              Mark complete
            </Button>
          )}
          {canCancel && (
            <Button size="sm" variant="ghost" onClick={() => onAction('cancel')}>
              <X className="h-4 w-4" aria-hidden />
              Cancel
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function ActionDialog({
  booking,
  action,
  onClose,
}: {
  booking: TeacherBooking;
  action: Action;
  onClose: () => void;
}) {
  const confirm = useConfirmBooking();
  const complete = useCompleteBooking();
  const cancel = useCancelBookingAsTeacher();
  const toast = useToast();

  const [reason, setReason] = useState('');

  const doAction = async () => {
    try {
      if (action === 'confirm') await confirm.mutateAsync(booking.id);
      else if (action === 'complete') await complete.mutateAsync(booking.id);
      else await cancel.mutateAsync({ id: booking.id, reason: reason || undefined });
      onClose();
    } catch (err) {
      toast.error(
        action === 'confirm'
          ? 'Cannot confirm'
          : action === 'complete'
            ? 'Cannot complete'
            : 'Cannot cancel',
        err instanceof ApiError
          ? err.message
          : action === 'confirm'
            ? 'The student may not have sufficient balance.'
            : 'Please try again.',
      );
    }
  };

  const isPending = confirm.isPending || complete.isPending || cancel.isPending;

  if (action === 'confirm') {
    return (
      <ConfirmDialog
        open
        title="Confirm this booking?"
        description="The student's wallet will be charged. Make sure the lesson details are correct."
        confirmLabel="Confirm"
        loading={isPending}
        onConfirm={doAction}
        onClose={onClose}
      />
    );
  }

  if (action === 'complete') {
    return (
      <ConfirmDialog
        open
        title="Mark as completed?"
        description="This will allow the student to leave a review."
        confirmLabel="Complete"
        loading={isPending}
        onConfirm={doAction}
        onClose={onClose}
      />
    );
  }

  // Cancel
  return (
    <Modal
      open
      title="Cancel booking"
      description="Optionally provide a reason for the cancellation. The student will be refunded if payment was already taken."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Keep booking
          </Button>
          <Button onClick={doAction} loading={isPending}>
            Cancel booking
          </Button>
        </>
      }
    >
      <Textarea
        label="Reason (optional)"
        placeholder="e.g., Emergency, scheduling conflict…"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
    </Modal>
  );
}
