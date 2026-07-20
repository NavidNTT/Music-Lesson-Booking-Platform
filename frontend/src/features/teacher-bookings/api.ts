import { apiClient } from '@/shared/api/client';
import { paginated, unwrap, type Paginated } from '@/shared/api/pagination';
import { z } from 'zod';
import { bookingStatusSchema, userSchema } from '@/shared/types/api';
import { timeSlotSchema } from '@/features/teachers/api';

const studentProfileSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  bio: z.string().nullable(),
  phone: z.string().nullable(),
  user: userSchema.nullable().optional(),
});

export const teacherBookingSchema = z.object({
  id: z.number(),
  teacher_profile_id: z.number(),
  student_profile_id: z.number(),
  teacher_time_slot_id: z.number(),
  status: bookingStatusSchema,
  price_amount: z.coerce.number(),
  confirmed_at: z.string().nullable().optional(),
  cancelled_at: z.string().nullable().optional(),
  cancellation_reason: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  time_slot: timeSlotSchema.optional(),
  student: studentProfileSchema.optional(),
});

export type TeacherBooking = z.infer<typeof teacherBookingSchema>;

export const teacherBookingsApi = {
  async list(page = 1): Promise<Paginated<TeacherBooking>> {
    const res = await apiClient.get('/teacher/bookings', { params: { page } });
    return unwrap(paginated(teacherBookingSchema), res.data);
  },

  async confirm(id: number): Promise<TeacherBooking> {
    const res = await apiClient.post(`/teacher/bookings/${id}/confirm`);
    return unwrap(teacherBookingSchema, res.data);
  },

  async complete(id: number): Promise<TeacherBooking> {
    const res = await apiClient.post(`/teacher/bookings/${id}/complete`);
    return unwrap(teacherBookingSchema, res.data);
  },

  async cancel(id: number, reason?: string): Promise<TeacherBooking> {
    const res = await apiClient.post(`/teacher/bookings/${id}/cancel`, {
      reason: reason,
    });
    return unwrap(teacherBookingSchema, res.data);
  },
};
