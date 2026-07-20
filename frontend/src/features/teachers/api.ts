import { z } from 'zod';
import { apiClient } from '@/shared/api/client';
import { paginated, unwrap, type Paginated } from '@/shared/api/pagination';
import { userSchema } from '@/features/auth/schemas';
import { TeachingLevel } from '@/shared/types/api';

export const teacherInstrumentSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  is_active: z.boolean(),
  levels: z.array(z.nativeEnum(TeachingLevel)).default([]),
});
export type TeacherInstrument = z.infer<typeof teacherInstrumentSchema>;

export const teacherProfileSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  bio: z.string().nullable(),
  price_per_session: z.coerce.number(),
  is_active: z.boolean(),
  rating_avg: z.coerce.number(),
  rating_count: z.coerce.number(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  user: userSchema.optional(),
  instruments: z.array(teacherInstrumentSchema).optional(),
});
export type TeacherProfile = z.infer<typeof teacherProfileSchema>;

export const timeSlotSchema = z.object({
  id: z.number(),
  teacher_profile_id: z.number(),
  starts_at: z.string().nullable(),
  ends_at: z.string().nullable(),
  capacity: z.coerce.number(),
  booked_count: z.coerce.number(),
  available_seats: z.coerce.number().optional(),
  is_full: z.boolean().optional(),
  is_enabled: z.boolean(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});
export type TimeSlot = z.infer<typeof timeSlotSchema>;

export interface TeacherListParams {
  page?: number;
  instrument?: string;
  search?: string;
}

export const teachersApi = {
  async list(params: TeacherListParams): Promise<Paginated<TeacherProfile>> {
    const res = await apiClient.get('/teachers', {
      params: {
        page: params.page ?? 1,
        instrument: params.instrument || undefined,
        search: params.search || undefined,
      },
    });
    return unwrap(paginated(teacherProfileSchema), res.data);
  },

  async detail(id: number): Promise<TeacherProfile> {
    const res = await apiClient.get(`/teachers/${id}`);
    return unwrap(teacherProfileSchema, res.data);
  },

  async slots(id: number): Promise<Paginated<TimeSlot>> {
    const res = await apiClient.get(`/teachers/${id}/slots`);
    return unwrap(paginated(timeSlotSchema), res.data);
  },
};
