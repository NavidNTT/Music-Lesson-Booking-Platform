import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui';
import { adminInstrumentsApi, type CreateInstrumentInput, type UpdateInstrumentInput } from './api';

export const adminInstrumentKeys = {
  all: ['admin-instruments'] as const,
  list: (page: number) => ['admin-instruments', 'list', page] as const,
  detail: (id: number) => ['admin-instruments', 'detail', id] as const,
};

export function useAdminInstruments(page = 1) {
  return useQuery({
    queryKey: adminInstrumentKeys.list(page),
    queryFn: () => adminInstrumentsApi.list(page),
  });
}

export function useCreateInstrument() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: CreateInstrumentInput) => adminInstrumentsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminInstrumentKeys.all });
      qc.invalidateQueries({ queryKey: ['instruments'] });
      toast.success('Instrument created');
    },
  });
}

export function useUpdateInstrument() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: number } & UpdateInstrumentInput) =>
      adminInstrumentsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminInstrumentKeys.all });
      qc.invalidateQueries({ queryKey: ['instruments'] });
      toast.success('Instrument updated');
    },
  });
}

export function useDeleteInstrument() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: number) => adminInstrumentsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminInstrumentKeys.all });
      qc.invalidateQueries({ queryKey: ['instruments'] });
      toast.success('Instrument deleted');
    },
  });
}
