import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import { Button, Input } from '@/shared/ui';
import { FormError } from '@/shared/ui/FormError';
import { applyApiErrorToForm } from '@/shared/lib/formErrors';
import { authApi } from '../api';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas';

export function ForgotPasswordPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await authApi.forgotPassword(values);
      setSent(true);
    } catch (err) {
      setFormError(applyApiErrorToForm(err, setError));
    }
  });

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-100 text-gold-600">
          <MailCheck className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Check your inbox</h1>
        <p className="mt-2 text-sm text-ink-500">
          If an account exists for that email, we've sent a link to reset your password.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block text-sm font-medium text-gold-700 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Reset your password</h1>
      <p className="mt-1 text-sm text-ink-500">
        Enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <FormError message={formError} />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Remembered it?{' '}
        <Link to="/login" className="font-medium text-gold-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
