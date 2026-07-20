import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, Music2 } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle, EmptyState, ErrorState } from '@/shared/ui';
import { CardSkeleton, Skeleton } from '@/shared/ui/Skeleton';
import { ConfirmDialog } from '@/shared/ui/Modal';
import { RatingStars } from '@/shared/ui/RatingStars';
import { formatCurrency, formatDate, formatTime } from '@/shared/lib/format';
import { ApiError } from '@/shared/api/errors';
import { useToast } from '@/shared/ui';
import { useAuth } from '@/features/auth/hooks';
import { useCreateBooking } from '@/features/student-bookings/hooks';
import { useTeacher, useTeacherSlots } from './hooks';
import type { TimeSlot } from './api';

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export function TeacherDetailPage() {
  const { teacherId } = useParams();
  const id = Number(teacherId);
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isStudent } = useAuth();

  const teacherQuery = useTeacher(id);
  const slotsQuery = useTeacherSlots(id);
  const createBooking = useCreateBooking(id);

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const teacher = teacherQuery.data;

  const handleBookClick = (slot: TimeSlot) => {
    if (!user) {
      navigate('/login', { state: { from: `/teachers/${id}` } });
      return;
    }
    if (!isStudent) {
      toast.error('Only students can book lessons', 'Sign in with a student account to book.');
      return;
    }
    setSelectedSlot(slot);
  };

  const confirmBooking = async () => {
    if (!selectedSlot) return;
    try {
      await createBooking.mutateAsync(selectedSlot.id);
      setSelectedSlot(null);
      navigate('/student/bookings');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not book this slot.';
      toast.error('Booking failed', message);
      setSelectedSlot(null);
    }
  };

  if (teacherQuery.isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Skeleton className="mb-6 h-6 w-32" />
        <CardSkeleton />
      </div>
    );
  }

  if (teacherQuery.isError || !teacher) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <ErrorState
          error={teacherQuery.error}
          onRetry={teacherQuery.refetch}
        />
      </div>
    );
  }

  const name = teacher.user?.name ?? 'Music Teacher';
  const instruments = teacher.instruments ?? [];
  const slots = slotsQuery.data?.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link
        to="/teachers"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to teachers
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile */}
        <div className="lg:col-span-2">
          <Card>
            <CardBody>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-ink-900 font-display text-2xl font-semibold text-gold-400">
                  {initials(name)}
                </span>
                <div className="flex-1">
                  <h1 className="font-display text-2xl font-semibold text-ink-900">{name}</h1>
                  <div className="mt-1">
                    <RatingStars value={teacher.rating_avg} count={teacher.rating_count} size="md" />
                  </div>
                  {instruments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {instruments.map((instrument) => (
                        <span
                          key={instrument.id}
                          className="inline-flex items-center gap-1 rounded-full bg-cream-200 px-2.5 py-1 text-xs font-medium text-ink-700"
                        >
                          <Music2 className="h-3 w-3" aria-hidden />
                          {instrument.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {teacher.bio && (
                <div className="mt-6">
                  <h2 className="mb-1.5 text-sm font-semibold text-ink-800">About</h2>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600">
                    {teacher.bio}
                  </p>
                </div>
              )}

              {instruments.some((i) => i.levels.length > 0) && (
                <div className="mt-6">
                  <h2 className="mb-2 text-sm font-semibold text-ink-800">Teaches</h2>
                  <div className="space-y-2">
                    {instruments.map((instrument) => (
                      <div key={instrument.id} className="flex items-center justify-between text-sm">
                        <span className="text-ink-700">{instrument.name}</span>
                        <div className="flex gap-1">
                          {instrument.levels.map((level) => (
                            <Badge key={level} tone="gold" className="capitalize">
                              {level}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Price + slots */}
        <div className="space-y-6">
          <Card>
            <CardBody>
              <p className="text-xs text-ink-400">Price per session</p>
              <p className="font-display text-2xl font-semibold text-ink-900">
                {formatCurrency(teacher.price_per_session)}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available slots</CardTitle>
            </CardHeader>
            <CardBody>
              {slotsQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : slotsQuery.isError ? (
                <ErrorState error={slotsQuery.error} onRetry={slotsQuery.refetch} />
              ) : slots.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  title="No upcoming slots"
                  description="This teacher hasn't published available times yet. Check back soon."
                />
              ) : (
                <ul className="space-y-2">
                  {slots.map((slot) => (
                    <li
                      key={slot.id}
                      className="flex items-center justify-between rounded-xl border border-ink-100 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink-900">
                          {formatDate(slot.starts_at)}
                        </p>
                        <p className="text-xs text-ink-500">
                          {formatTime(slot.starts_at)} – {formatTime(slot.ends_at)}
                          {slot.capacity > 1 && (
                            <> · {slot.available_seats ?? slot.capacity - slot.booked_count} seats</>
                          )}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => handleBookClick(slot)}>
                        Book
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={selectedSlot !== null}
        title="Confirm booking"
        description={
          selectedSlot
            ? `Book a lesson with ${name} on ${formatDate(selectedSlot.starts_at)} at ${formatTime(selectedSlot.starts_at)}? Your wallet will be charged ${formatCurrency(teacher.price_per_session)} only after the teacher confirms.`
            : ''
        }
        confirmLabel="Request booking"
        loading={createBooking.isPending}
        onConfirm={confirmBooking}
        onClose={() => setSelectedSlot(null)}
      />
    </div>
  );
}
