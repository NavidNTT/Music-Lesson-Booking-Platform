import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui';
import { teacherProfileApi, type SyncInstrumentInput, type UpdateTeacherProfileInput } from './api';

export const teacherProfileKeys = {
  me: ['teacher-profile', 'me'] as const,
};

export function useMyTeacherProfile() {
  return useQuery({
    queryKey: teacherProfileKeys.me,
    queryFn: teacherProfileApi.me,
  });
}

export function useUpdateTeacherProfile() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: UpdateTeacherProfileInput) => teacherProfileApi.update(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherProfileKeys.me });
      toast.success('Profile saved');
    },
  });
}

export function useSyncInstruments() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (instruments: SyncInstrumentInput[]) =>
      teacherProfileApi.syncInstruments(instruments),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherProfileKeys.me });
      toast.success('Instruments updated');
    },
  });
}
