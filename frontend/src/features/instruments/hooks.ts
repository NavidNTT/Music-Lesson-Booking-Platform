import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui';
import { instrumentsApi } from './api';

export const instrumentKeys = {
  all: ['instruments'] as const,
  list: (page: number) => ['instruments', 'list', page] as const,
};

export function useInstruments(page = 1) {
  return useQuery({
    queryKey: instrumentKeys.list(page),
    queryFn: () => instrumentsApi.list(page),
  });
}

export function useCreateInstrument() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: instrumentsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: instrumentKeys.all });
      toast.success('Instrument created');
    },
  });
}

export function useUpdateInstrument() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: number; name: string; is_active?: boolean }) =>
      instrumentsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: instrumentKeys.all });
      toast.success('Instrument updated');
    },
  });
}

export function useDeleteInstrument() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: number) => instrumentsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: instrumentKeys.all });
      toast.success('Instrument deleted');
    },
  });
}
