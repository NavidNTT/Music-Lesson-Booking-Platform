import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/shared/ui';
import { FormError } from '@/shared/ui/FormError';
import { applyApiErrorToForm } from '@/shared/lib/formErrors';
import { authApi } from '../api';
import { resetPasswordSchema, type ResetPasswordInput } from '../schemas';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const token = params.get('token') ?? '';
  const email = params.get('email') ?? '';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, email },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await authApi.resetPassword(values);
      setDone(true);
    } catch (err) {
      setFormError(applyApiErrorToForm(err, setError));
    }
  });

  if (done) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Password updated</h1>
        <p className="mt-2 text-sm text-ink-500">You can now sign in with your new password.</p>
        <Link to="/login">
          <Button className="mt-6">Go to sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Choose a new password</h1>
      <p className="mt-1 text-sm text-ink-500">Set a new password for your account.</p>

      {!token && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
          This page expects a reset link from your email. The token appears to be missing.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <FormError message={formError} />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />
        <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
          Update password
        </Button>
      </form>
    </div>
  );
}
