import { z } from 'zod';
import { apiClient } from '@/shared/api/client';
import { paginated, unwrap, type Paginated } from '@/shared/api/pagination';
import { BookingStatus } from '@/shared/types/api';
import { teacherProfileSchema, timeSlotSchema } from '@/features/teachers/api';

export const reviewSchema = z.object({
  id: z.number(),
  booking_id: z.number(),
  teacher_profile_id: z.number(),
  student_profile_id: z.number(),
  rating: z.coerce.number(),
  comment: z.string().nullable(),
  created_at: z.string().nullable().optional(),
});
export type Review = z.infer<typeof reviewSchema>;

export const bookingSchema = z.object({
  id: z.number(),
  teacher_profile_id: z.number(),
  student_profile_id: z.number(),
  teacher_time_slot_id: z.number(),
  status: z.nativeEnum(BookingStatus),
  price_amount: z.coerce.number(),
  confirmed_at: z.string().nullable().optional(),
  cancelled_at: z.string().nullable().optional(),
  cancellation_reason: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  teacher: teacherProfileSchema.optional(),
  time_slot: timeSlotSchema.optional(),
  review: reviewSchema.nullable().optional(),
});
export type Booking = z.infer<typeof bookingSchema>;

export const studentBookingsApi = {
  async list(page = 1): Promise<Paginated<Booking>> {
    const res = await apiClient.get('/student/bookings', { params: { page } });
    return unwrap(paginated(bookingSchema), res.data);
  },

  async create(slotId: number): Promise<Booking> {
    const res = await apiClient.post('/student/bookings', {
      teacher_time_slot_id: slotId,
    });
    return unwrap(bookingSchema, res.data);
  },

  async cancel(bookingId: number, reason?: string): Promise<Booking> {
    const res = await apiClient.post(`/student/bookings/${bookingId}/cancel`, {
      reason: reason || undefined,
    });
    return unwrap(bookingSchema, res.data);
  },
};
