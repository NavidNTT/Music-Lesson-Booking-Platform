import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarClock, Edit2, Trash2 } from 'lucide-react';
import { Button, Card, CardBody, EmptyState, ErrorState, Input } from '@/shared/ui';
import { CardSkeleton } from '@/shared/ui/Skeleton';
import { Pagination } from '@/shared/ui/Pagination';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Modal, ConfirmDialog } from '@/shared/ui/Modal';
import { FormError } from '@/shared/ui/FormError';
import { formatDate, formatTime } from '@/shared/lib/format';
import { applyApiErrorToForm } from '@/shared/lib/formErrors';
import { ApiError } from '@/shared/api/errors';
import { useToast } from '@/shared/ui';
import { useCreateSlot, useDeleteSlot, useTeacherSlots, useUpdateSlot } from './hooks';
import type { TimeSlot } from '@/features/teachers/api';

const slotSchema = z.object({
  starts_at: z.string().min(1, 'Required'),
  duration_minutes: z.coerce.number().int().min(15).max(240).optional(),
  capacity: z.coerce.number().int().min(1).max(10).optional(),
  is_enabled: z.boolean().optional(),
});
type SlotFormInput = z.input<typeof slotSchema>;

export function TeacherSlotsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useTeacherSlots(page);
  const [editing, setEditing] = useState<TimeSlot | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<TimeSlot | null>(null);

  const slots = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Time slots"
        description="Manage your availability. Students can only book enabled slots with open capacity."
        actions={<Button onClick={() => setCreating(true)}>Add time slot</Button>}
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : slots.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No time slots yet"
          description="Create your first time slot to start accepting bookings."
          action={<Button onClick={() => setCreating(true)}>Add time slot</Button>}
        />
      ) : (
        <>
          <div className="space-y-3">
            {slots.map((slot) => (
              <SlotRow
                key={slot.id}
                slot={slot}
                onEdit={() => setEditing(slot)}
                onDelete={() => setToDelete(slot)}
              />
            ))}
          </div>
          {data && <Pagination page={data.current_page} lastPage={data.last_page} onChange={setPage} />}
        </>
      )}

      <SlotModal
        open={creating || editing !== null}
        slot={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />

      <DeleteDialog slot={toDelete} onClose={() => setToDelete(null)} />
    </div>
  );
}

function SlotRow({
  slot,
  onEdit,
  onDelete,
}: {
  slot: TimeSlot;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const booked = slot.booked_count;
  const available = slot.capacity - booked;

  return (
    <Card>
      <CardBody className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-ink-900">
              {formatDate(slot.starts_at)} · {formatTime(slot.starts_at)} – {formatTime(slot.ends_at)}
            </p>
            {!slot.is_enabled && (
              <span className="rounded-full bg-ink-200 px-2 py-0.5 text-xs font-medium text-ink-600">
                Disabled
              </span>
            )}
            {slot.capacity > 1 && (
              <span className="text-xs text-ink-500">
                {booked}/{slot.capacity} booked · {available} open
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit2 className="h-4 w-4" aria-hidden />
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function SlotModal({ open, slot, onClose }: { open: boolean; slot: TimeSlot | null; onClose: () => void }) {
  const create = useCreateSlot();
  const update = useUpdateSlot();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SlotFormInput>({
    resolver: zodResolver(slotSchema),
    values: slot
      ? {
          starts_at: slot.starts_at?.slice(0, 16) ?? '', // datetime-local format
          duration_minutes: undefined, // preserve on edit; backend defaults properly now
          capacity: slot.capacity,
          is_enabled: slot.is_enabled,
        }
      : {
          starts_at: '',
          duration_minutes: 60,
          capacity: 1,
          is_enabled: true,
        },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const payload = {
        starts_at: new Date(values.starts_at).toISOString(),
        duration_minutes: values.duration_minutes,
        capacity: values.capacity,
        is_enabled: values.is_enabled,
      };
      if (slot) {
        await update.mutateAsync({ id: slot.id, ...payload });
      } else {
        await create.mutateAsync(payload);
      }
      reset();
      onClose();
    } catch (err) {
      setFormError(applyApiErrorToForm(err, setError));
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={slot ? 'Edit time slot' : 'Create time slot'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={isSubmitting}>
            {slot ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" noValidate>
        <FormError message={formError} />
        <Input
          label="Start time"
          type="datetime-local"
          error={errors.starts_at?.message}
          {...register('starts_at')}
        />
        <Input
          label="Duration (minutes)"
          type="number"
          min={15}
          max={240}
          hint="Leave blank when editing to keep current duration"
          error={errors.duration_minutes?.message}
          {...register('duration_minutes')}
        />
        <Input
          label="Capacity"
          type="number"
          min={1}
          max={10}
          hint="How many students can book this slot"
          error={errors.capacity?.message}
          {...register('capacity')}
        />
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-ink-300 text-gold-500"
            {...register('is_enabled')}
          />
          Enabled (visible to students)
        </label>
      </form>
    </Modal>
  );
}

function DeleteDialog({ slot, onClose }: { slot: TimeSlot | null; onClose: () => void }) {
  const deleteMut = useDeleteSlot();
  const toast = useToast();

  const doDelete = async () => {
    if (!slot) return;
    try {
      await deleteMut.mutateAsync(slot.id);
      onClose();
    } catch (err) {
      toast.error('Cannot delete', err instanceof ApiError ? err.message : 'This slot may have bookings.');
      onClose();
    }
  };

  return (
    <ConfirmDialog
      open={slot !== null}
      title="Delete this time slot?"
      description="This action cannot be undone. You can only delete slots with no bookings."
      confirmLabel="Delete"
      danger
      loading={deleteMut.isPending}
      onConfirm={doDelete}
      onClose={onClose}
    />
  );
}
