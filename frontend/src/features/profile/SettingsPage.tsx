import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Card, CardBody, CardHeader, CardTitle, Input, Badge } from '@/shared/ui';
import { FormError } from '@/shared/ui/FormError';
import { PageHeader } from '@/shared/ui/PageHeader';
import { applyApiErrorToForm } from '@/shared/lib/formErrors';
import { useAuth, useUpdateProfile } from '@/features/auth/hooks';

const settingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});
type SettingsInput = z.infer<typeof settingsSchema>;

const roleTone = { admin: 'gold', teacher: 'info', student: 'success' } as const;

export function SettingsPage() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    values: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await updateProfile.mutateAsync(values);
    } catch (err) {
      setFormError(applyApiErrorToForm(err, setError));
    }
  });

  if (!user) return null;

  return (
    <div>
      <PageHeader title="Account settings" description="Manage your personal information." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <FormError message={formError} />
              <Input label="Full name" error={errors.name?.message} {...register('name')} />
              <Input
                label="Email"
                type="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <div className="flex justify-end">
                <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
                  Save changes
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-500">Role</span>
              <Badge tone={roleTone[user.role]} className="capitalize">
                {user.role}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-500">User ID</span>
              <span className="font-medium text-ink-800">#{user.id}</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
