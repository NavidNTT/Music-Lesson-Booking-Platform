import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/shared/ui';
import { FormError } from '@/shared/ui/FormError';
import { applyApiErrorToForm } from '@/shared/lib/formErrors';
import { useLogin } from '../hooks';
import { loginSchema, type LoginInput } from '../schemas';

export function LoginPage() {
  const login = useLogin();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login.mutateAsync(values);
    } catch (err) {
      setFormError(applyApiErrorToForm(err, setError));
    }
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-500">Sign in to manage your lessons.</p>

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
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-gold-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        New to Cadenza?{' '}
        <Link to="/register" className="font-medium text-gold-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
