import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap, Star } from 'lucide-react';
import { Button, Input } from '@/shared/ui';
import { FormError } from '@/shared/ui/FormError';
import { cn } from '@/shared/lib/cn';
import { applyApiErrorToForm } from '@/shared/lib/formErrors';
import { UserRole } from '@/shared/types/api';
import { useRegister } from '../hooks';
import { registerSchema, type RegisterInput } from '../schemas';

const roleOptions = [
  {
    value: UserRole.Student,
    label: 'I want to learn',
    description: 'Book lessons with teachers',
    icon: Star,
  },
  {
    value: UserRole.Teacher,
    label: 'I want to teach',
    description: 'Offer lessons and manage bookings',
    icon: GraduationCap,
  },
] as const;

export function RegisterPage() {
  const registerMutation = useRegister();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: UserRole.Student },
  });

  const selectedRole = watch('role');

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await registerMutation.mutateAsync(values);
    } catch (err) {
      setFormError(applyApiErrorToForm(err, setError));
    }
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Create your account</h1>
      <p className="mt-1 text-sm text-ink-500">Join Cadenza in less than a minute.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <FormError message={formError} />

        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-ink-700">I'm joining as</legend>
          <div className="grid grid-cols-2 gap-3">
            {roleOptions.map((option) => {
              const Icon = option.icon;
              const active = selectedRole === option.value;
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setValue('role', option.value, { shouldValidate: true })}
                  aria-pressed={active}
                  className={cn(
                    'flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition',
                    active
                      ? 'border-gold-400 bg-gold-50 ring-1 ring-gold-400'
                      : 'border-ink-200 bg-white hover:border-ink-300',
                  )}
                >
                  <Icon
                    className={cn('h-5 w-5', active ? 'text-gold-600' : 'text-ink-400')}
                    aria-hidden
                  />
                  <span className="text-sm font-semibold text-ink-900">{option.label}</span>
                  <span className="text-xs text-ink-500">{option.description}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <Input
          label="Full name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
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
          autoComplete="new-password"
          hint="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />

        <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-gold-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
