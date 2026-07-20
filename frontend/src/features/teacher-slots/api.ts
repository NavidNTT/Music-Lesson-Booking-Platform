import { apiClient } from '@/shared/api/client';
import { paginated, unwrap, type Paginated } from '@/shared/api/pagination';
import { timeSlotSchema, type TimeSlot } from '@/features/teachers/api';

export interface SlotInput {
  starts_at: string;
  duration_minutes?: number;
  capacity?: number;
  is_enabled?: boolean;
}

export const teacherSlotsApi = {
  async list(page = 1): Promise<Paginated<TimeSlot>> {
    const res = await apiClient.get('/teacher/slots', { params: { page } });
    return unwrap(paginated(timeSlotSchema), res.data);
  },

  async create(input: SlotInput): Promise<TimeSlot> {
    const res = await apiClient.post('/teacher/slots', input);
    return unwrap(timeSlotSchema, res.data);
  },

  async update(id: number, input: Partial<SlotInput>): Promise<TimeSlot> {
    const res = await apiClient.patch(`/teacher/slots/${id}`, input);
    return unwrap(timeSlotSchema, res.data);
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/teacher/slots/${id}`);
  },
};
