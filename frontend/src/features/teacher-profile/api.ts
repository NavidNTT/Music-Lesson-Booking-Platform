import { apiClient } from '@/shared/api/client';
import { unwrap } from '@/shared/api/pagination';
import { teacherProfileSchema, type TeacherProfile } from '@/features/teachers/api';
import type { TeachingLevel } from '@/shared/types/api';

export interface UpdateTeacherProfileInput {
  bio?: string | null;
  price_per_session: number;
  is_active?: boolean;
}

export interface SyncInstrumentInput {
  id: number;
  levels: TeachingLevel[];
}

export const teacherProfileApi = {
  /** Returns null when the teacher has not created a profile yet (404). */
  async me(): Promise<TeacherProfile | null> {
    try {
      const res = await apiClient.get('/teacher/profile');
      return unwrap(teacherProfileSchema, res.data);
    } catch (err) {
      // A missing profile is an expected state for a newly registered teacher.
      if (typeof err === 'object' && err && 'kind' in err && err.kind === 'not_found') {
        return null;
      }
      throw err;
    }
  },

  async update(input: UpdateTeacherProfileInput): Promise<TeacherProfile> {
    const res = await apiClient.patch('/teacher/profile', input);
    return unwrap(teacherProfileSchema, res.data);
  },

  async syncInstruments(instruments: SyncInstrumentInput[]): Promise<TeacherProfile> {
    const res = await apiClient.post('/teacher/profile/instruments', { instruments });
    return unwrap(teacherProfileSchema, res.data);
  },
};
