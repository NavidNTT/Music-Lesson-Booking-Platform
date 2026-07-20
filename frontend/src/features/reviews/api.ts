import { apiClient } from '@/shared/api/client';
import { unwrap } from '@/shared/api/pagination';
import { reviewSchema, type Review } from '@/features/student-bookings/api';

export interface CreateReviewInput {
  booking_id: number;
  rating: number;
  comment?: string;
}

export const reviewsApi = {
  async create(input: CreateReviewInput): Promise<Review> {
    const res = await apiClient.post('/reviews', {
      booking_id: input.booking_id,
      rating: input.rating,
      comment: input.comment || undefined,
    });
    return unwrap(reviewSchema, res.data);
  },
};
