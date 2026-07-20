import { apiClient } from '@/shared/api/client';
import { instrumentSchema, type Instrument } from '@/features/instruments/api';
import { paginated, unwrap, type Paginated } from '@/shared/api/pagination';

export interface CreateInstrumentInput {
  name: string;
  slug?: string;
  is_active?: boolean;
}

export interface UpdateInstrumentInput {
  name: string;
  slug?: string;
  is_active?: boolean;
}

export const adminInstrumentsApi = {
  async list(page = 1): Promise<Paginated<Instrument>> {
    const res = await apiClient.get('/admin/instruments', { params: { page } });
    return unwrap(paginated(instrumentSchema), res.data);
  },

  async show(id: number): Promise<Instrument> {
    const res = await apiClient.get(`/admin/instruments/${id}`);
    return unwrap(instrumentSchema, res.data);
  },

  async create(input: CreateInstrumentInput): Promise<Instrument> {
    const res = await apiClient.post('/admin/instruments', input);
    return unwrap(instrumentSchema, res.data);
  },

  async update(id: number, input: UpdateInstrumentInput): Promise<Instrument> {
    const res = await apiClient.put(`/admin/instruments/${id}`, input);
    return unwrap(instrumentSchema, res.data);
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/admin/instruments/${id}`);
  },
};
