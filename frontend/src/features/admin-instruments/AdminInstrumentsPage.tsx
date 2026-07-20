import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit2, Music2, Plus, Trash2 } from 'lucide-react';
import { Button, Card, CardBody, EmptyState, ErrorState, Input } from '@/shared/ui';
import { CardSkeleton } from '@/shared/ui/Skeleton';
import { Pagination } from '@/shared/ui/Pagination';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Modal, ConfirmDialog } from '@/shared/ui/Modal';
import { FormError } from '@/shared/ui/FormError';
import { Badge } from '@/shared/ui';
import { applyApiErrorToForm } from '@/shared/lib/formErrors';
import { ApiError } from '@/shared/api/errors';
import { useToast } from '@/shared/ui';
import {
  useAdminInstruments,
  useCreateInstrument,
  useDeleteInstrument,
  useUpdateInstrument,
} from './hooks';
import type { Instrument } from '@/features/instruments/api';

const instrumentSchema = z.object({
  name: z.string().min(1, 'Required').max(100),
  slug: z.string().max(100).optional(),
  is_active: z.boolean().optional(),
});
type InstrumentFormInput = z.input<typeof instrumentSchema>;

export function AdminInstrumentsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useAdminInstruments(page);
  const [editing, setEditing] = useState<Instrument | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Instrument | null>(null);

  const instruments = data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Instruments"
        description="Manage the catalog of instruments available for teaching."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            Add instrument
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : instruments.length === 0 ? (
        <EmptyState
          icon={Music2}
          title="No instruments yet"
          description="Add your first instrument to the catalog."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              Add instrument
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {instruments.map((instrument) => (
              <InstrumentRow
                key={instrument.id}
                instrument={instrument}
                onEdit={() => setEditing(instrument)}
                onDelete={() => setToDelete(instrument)}
              />
            ))}
          </div>
          {data && <Pagination page={data.current_page} lastPage={data.last_page} onChange={setPage} />}
        </>
      )}

      <InstrumentModal
        open={creating || editing !== null}
        instrument={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />

      <DeleteDialog instrument={toDelete} onClose={() => setToDelete(null)} />
    </div>
  );
}

function InstrumentRow({
  instrument,
  onEdit,
  onDelete,
}: {
  instrument: Instrument;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card>
      <CardBody className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
            <Music2 className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-ink-900">{instrument.name}</p>
              <Badge tone={instrument.is_active ? 'success' : 'neutral'}>
                {instrument.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-xs text-ink-500">Slug: {instrument.slug}</p>
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

function InstrumentModal({
  open,
  instrument,
  onClose,
}: {
  open: boolean;
  instrument: Instrument | null;
  onClose: () => void;
}) {
  const create = useCreateInstrument();
  const update = useUpdateInstrument();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InstrumentFormInput>({
    resolver: zodResolver(instrumentSchema),
    values: instrument
      ? {
          name: instrument.name,
          slug: instrument.slug,
          is_active: instrument.is_active,
        }
      : {
          name: '',
          slug: '',
          is_active: true,
        },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const payload = {
        name: values.name,
        slug: values.slug || undefined,
        is_active: values.is_active,
      };
      if (instrument) {
        await update.mutateAsync({ id: instrument.id, ...payload });
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
      title={instrument ? 'Edit instrument' : 'Add instrument'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={isSubmitting}>
            {instrument ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" noValidate>
        <FormError message={formError} />
        <Input
          label="Name"
          placeholder="e.g. Piano, Guitar, Violin"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Slug"
          placeholder="e.g. piano (leave blank to auto-generate)"
          hint="URL-friendly identifier"
          error={errors.slug?.message}
          {...register('slug')}
        />
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-ink-300 text-gold-500"
            {...register('is_active')}
          />
          Active (visible to users)
        </label>
      </form>
    </Modal>
  );
}

function DeleteDialog({
  instrument,
  onClose,
}: {
  instrument: Instrument | null;
  onClose: () => void;
}) {
  const deleteMut = useDeleteInstrument();
  const toast = useToast();

  const doDelete = async () => {
    if (!instrument) return;
    try {
      await deleteMut.mutateAsync(instrument.id);
      onClose();
    } catch (err) {
      toast.error(
        'Cannot delete',
        err instanceof ApiError ? err.message : 'This instrument may be in use by teachers.',
      );
      onClose();
    }
  };

  return (
    <ConfirmDialog
      open={instrument !== null}
      title="Delete this instrument?"
      description="This will remove the instrument from the catalog. Teachers who teach this instrument will no longer show it."
      confirmLabel="Delete"
      danger
      loading={deleteMut.isPending}
      onConfirm={doDelete}
      onClose={onClose}
    />
  );
}
