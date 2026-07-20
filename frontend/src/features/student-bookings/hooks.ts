import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui';
import { teacherKeys } from '@/features/teachers/hooks';
import { walletKeys } from '@/features/wallet/hooks';
import { studentBookingsApi } from './api';

export const studentBookingKeys = {
  all: ['student-bookings'] as const,
  list: (page: number) => ['student-bookings', 'list', page] as const,
};

export function useStudentBookings(page = 1) {
  return useQuery({
    queryKey: studentBookingKeys.list(page),
    queryFn: () => studentBookingsApi.list(page),
  });
}

export function useCreateBooking(teacherId?: number) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (slotId: number) => studentBookingsApi.create(slotId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studentBookingKeys.all });
      if (teacherId) qc.invalidateQueries({ queryKey: teacherKeys.slots(teacherId) });
      toast.success('Lesson requested', 'Waiting for the teacher to confirm.');
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      studentBookingsApi.cancel(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studentBookingKeys.all });
      qc.invalidateQueries({ queryKey: walletKeys.all });
      toast.success('Booking cancelled');
    },
  });
}
