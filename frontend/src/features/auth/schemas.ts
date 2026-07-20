import { z } from 'zod';
import { UserRole } from '@/shared/types/api';

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: z.nativeEnum(UserRole),
  created_at: z.string().nullable().optional(),
});
export type User = z.infer<typeof userSchema>;

export const authPayloadSchema = z.object({
  user: userSchema,
  token: z.string(),
  token_type: z.string(),
});
export type AuthPayload = z.infer<typeof authPayloadSchema>;

export const meSchema = z.object({
  user: userSchema,
});

// ---- Form schemas (client-side validation mirrors backend rules) ----

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    // Public registration is limited to student/teacher (admin is blocked server-side too).
    role: z.enum([UserRole.Student, UserRole.Teacher]),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
