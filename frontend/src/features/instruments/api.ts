import { z } from 'zod';
import { apiClient } from '@/shared/api/client';
import { paginated, unwrap, type Paginated } from '@/shared/api/pagination';

export const instrumentSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  is_active: z.coerce.boolean(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});
export type Instrument = z.infer<typeof instrumentSchema>;

export const instrumentsApi = {
  /** Public listing (returns a Laravel paginator inside `data`). */
  async list(page = 1): Promise<Paginated<Instrument>> {
    const res = await apiClient.get('/instruments', { params: { page } });
    return unwrap(paginated(instrumentSchema), res.data);
  },

  async create(input: { name: string; is_active?: boolean }): Promise<Instrument> {
    const res = await apiClient.post('/admin/instruments', input);
    return unwrap(instrumentSchema, res.data);
  },

  async update(id: number, input: { name: string; is_active?: boolean }): Promise<Instrument> {
    const res = await apiClient.patch(`/admin/instruments/${id}`, input);
    return unwrap(instrumentSchema, res.data);
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/admin/instruments/${id}`);
  },
};
