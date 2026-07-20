import { z } from 'zod';

/**
 * Shared domain enums mirrored from the backend.
 * Source of truth: app/Enums/UserRole.php and app/Enums/BookingStatus.php.
 */
export const UserRole = {
  Admin: 'admin',
  Teacher: 'teacher',
  Student: 'student',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const BookingStatus = {
  Pending: 'pending',
  Confirmed: 'confirmed',
  Completed: 'completed',
  Cancelled: 'cancelled',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const TeachingLevel = {
  Beginner: 'beginner',
  Intermediate: 'intermediate',
  Advanced: 'advanced',
} as const;
export type TeachingLevel = (typeof TeachingLevel)[keyof typeof TeachingLevel];

export const TEACHING_LEVELS: TeachingLevel[] = [
  TeachingLevel.Beginner,
  TeachingLevel.Intermediate,
  TeachingLevel.Advanced,
];

// Zod schemas for runtime validation
export const bookingStatusSchema = z.enum(['pending', 'confirmed', 'completed', 'cancelled']);

/** Matches backend UserResource: id, name, email, role, created_at. */
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: z.enum(['admin', 'teacher', 'student']),
  created_at: z.string().nullable().optional(),
});
