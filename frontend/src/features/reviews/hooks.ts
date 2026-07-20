import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui';
import { studentBookingKeys } from '@/features/student-bookings/hooks';
import { reviewsApi, type CreateReviewInput } from './api';

export function useCreateReview() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => reviewsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studentBookingKeys.all });
      toast.success('Review submitted', 'Thanks for your feedback!');
    },
  });
}
