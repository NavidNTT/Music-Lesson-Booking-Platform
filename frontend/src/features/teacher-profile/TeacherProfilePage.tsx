import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Music2 } from 'lucide-react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
} from '@/shared/ui';
import { FormError } from '@/shared/ui/FormError';
import { PageHeader } from '@/shared/ui/PageHeader';
import { PageLoader } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { applyApiErrorToForm } from '@/shared/lib/formErrors';
import { TEACHING_LEVELS, type TeachingLevel } from '@/shared/types/api';
import { useInstruments } from '@/features/instruments/hooks';
import { useMyTeacherProfile, useSyncInstruments, useUpdateTeacherProfile } from './hooks';

const profileSchema = z.object({
  bio: z.string().max(5000).optional(),
  price_per_session: z.coerce
    .number({ invalid_type_error: 'Enter a valid amount' })
    .int('Must be a whole number')
    .min(10000, 'Minimum is 10,000'),
  is_active: z.boolean().optional(),
});
type ProfileInput = z.input<typeof profileSchema>;

export function TeacherProfilePage() {
  const { data: profile, isLoading, isError, error, refetch } = useMyTeacherProfile();

  if (isLoading) return <PageLoader label="Loading your profile" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Teaching profile"
        description="This information is shown to students browsing for teachers."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm profile={profile} />
        <InstrumentsForm profile={profile} />
      </div>
    </div>
  );
}

type Profile = NonNullable<ReturnType<typeof useMyTeacherProfile>['data']>;

function ProfileForm({ profile }: { profile: Profile | null | undefined }) {
  const update = useUpdateTeacherProfile();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: {
      bio: profile?.bio ?? '',
      price_per_session: profile?.price_per_session ?? 100000,
      is_active: profile?.is_active ?? true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await update.mutateAsync({
        bio: values.bio || null,
        price_per_session: Number(values.price_per_session),
        is_active: values.is_active,
      });
    } catch (err) {
      setFormError(applyApiErrorToForm(err, setError));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{profile ? 'Edit details' : 'Create your profile'}</CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormError message={formError} />
          {!profile && (
            <p className="rounded-xl border border-gold-200 bg-gold-50 px-3.5 py-2.5 text-sm text-gold-800">
              You don't have a profile yet. Fill this in to start appearing in search and to publish
              time slots.
            </p>
          )}
          <Textarea
            label="Bio"
            placeholder="Tell students about your background, style, and experience…"
            error={errors.bio?.message}
            {...register('bio')}
          />
          <Input
            label="Price per session"
            type="number"
            hint="Whole number, minimum 10,000"
            error={errors.price_per_session?.message}
            {...register('price_per_session')}
          />
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-ink-300 text-gold-500"
              {...register('is_active')}
            />
            Visible to students (active)
          </label>
          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting}>
              {profile ? 'Save changes' : 'Create profile'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

function InstrumentsForm({ profile }: { profile: Profile | null | undefined }) {
  const instrumentsQuery = useInstruments(1);
  const sync = useSyncInstruments();

  // Selection state: instrumentId -> set of levels
  const [selection, setSelection] = useState<Record<number, TeachingLevel[]>>(() => {
    const initial: Record<number, TeachingLevel[]> = {};
    profile?.instruments?.forEach((i) => {
      initial[i.id] = i.levels;
    });
    return initial;
  });

  const toggleInstrument = (id: number) => {
    setSelection((prev) => {
      const next = { ...prev };
      if (id in next) delete next[id];
      else next[id] = ['beginner'];
      return next;
    });
  };

  const toggleLevel = (id: number, level: TeachingLevel) => {
    setSelection((prev) => {
      const current = prev[id] ?? [];
      const has = current.includes(level);
      const levels = has ? current.filter((l) => l !== level) : [...current, level];
      return { ...prev, [id]: levels };
    });
  };

  const save = () => {
    const payload = Object.entries(selection)
      .filter(([, levels]) => levels.length > 0)
      .map(([id, levels]) => ({ id: Number(id), levels }));
    sync.mutate(payload);
  };

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Instruments</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-ink-500">
            Create your profile first, then you'll be able to choose the instruments and levels you
            teach.
          </p>
        </CardBody>
      </Card>
    );
  }

  const instruments = instrumentsQuery.data?.data.filter((i) => i.is_active) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instruments & levels</CardTitle>
      </CardHeader>
      <CardBody>
        {instrumentsQuery.isLoading ? (
          <p className="text-sm text-ink-400">Loading instruments…</p>
        ) : (
          <>
            <div className="space-y-2">
              {instruments.map((instrument) => {
                const selected = instrument.id in selection;
                return (
                  <div
                    key={instrument.id}
                    className={cn(
                      'rounded-xl border p-3 transition',
                      selected ? 'border-gold-300 bg-gold-50' : 'border-ink-100',
                    )}
                  >
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleInstrument(instrument.id)}
                        className="h-4 w-4 rounded border-ink-300 text-gold-500"
                      />
                      <Music2 className="h-4 w-4 text-ink-400" aria-hidden />
                      <span className="text-sm font-medium text-ink-900">{instrument.name}</span>
                    </label>
                    {selected && (
                      <div className="mt-2 flex flex-wrap gap-2 pl-6">
                        {TEACHING_LEVELS.map((level) => {
                          const active = selection[instrument.id]?.includes(level);
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => toggleLevel(instrument.id, level)}
                              className={cn(
                                'rounded-full px-3 py-1 text-xs font-medium capitalize transition',
                                active
                                  ? 'bg-ink-900 text-cream-50'
                                  : 'bg-white text-ink-500 ring-1 ring-ink-200 hover:ring-ink-300',
                              )}
                            >
                              {level}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={save} loading={sync.isPending}>
                Save instruments
              </Button>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
