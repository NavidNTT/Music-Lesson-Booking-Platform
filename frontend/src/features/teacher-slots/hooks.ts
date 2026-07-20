import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui';
import { teacherSlotsApi, type SlotInput } from './api';

export const teacherSlotKeys = {
  all: ['teacher-slots'] as const,
  list: (page: number) => ['teacher-slots', 'list', page] as const,
};

export function useTeacherSlots(page = 1) {
  return useQuery({
    queryKey: teacherSlotKeys.list(page),
    queryFn: () => teacherSlotsApi.list(page),
  });
}

export function useCreateSlot() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: SlotInput) => teacherSlotsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherSlotKeys.all });
      toast.success('Time slot created');
    },
  });
}

export function useUpdateSlot() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: number } & Partial<SlotInput>) =>
      teacherSlotsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherSlotKeys.all });
      toast.success('Time slot updated');
    },
  });
}

export function useDeleteSlot() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: number) => teacherSlotsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherSlotKeys.all });
      toast.success('Time slot deleted');
    },
  });
}
