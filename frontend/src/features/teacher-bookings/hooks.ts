import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui';
import { teacherBookingsApi } from './api';

export const teacherBookingKeys = {
  all: ['teacher-bookings'] as const,
  list: (page: number) => ['teacher-bookings', 'list', page] as const,
};

export function useTeacherBookings(page = 1) {
  return useQuery({
    queryKey: teacherBookingKeys.list(page),
    queryFn: () => teacherBookingsApi.list(page),
  });
}

export function useConfirmBooking() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: number) => teacherBookingsApi.confirm(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherBookingKeys.all });
      qc.invalidateQueries({ queryKey: ['teacher-slots'] });
      toast.success('Booking confirmed');
    },
  });
}

export function useCompleteBooking() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: number) => teacherBookingsApi.complete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherBookingKeys.all });
      toast.success('Lesson completed');
    },
  });
}

export function useCancelBookingAsTeacher() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      teacherBookingsApi.cancel(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teacherBookingKeys.all });
      qc.invalidateQueries({ queryKey: ['teacher-slots'] });
      toast.success('Booking cancelled');
    },
  });
}
