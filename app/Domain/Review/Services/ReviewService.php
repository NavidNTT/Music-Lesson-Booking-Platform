<?php

namespace App\Domain\Review\Services;

use App\Domain\Booking\Models\Booking;
use App\Domain\Review\Models\Review;
use App\Enums\BookingStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReviewService
{
    public function storeReview(Booking $booking, int $rating, ?string $comment = null): Review
    {
        return DB::transaction(function () use ($booking, $rating, $comment) {
            $booking = Booking::whereKey($booking->id)
                ->lockForUpdate()
                ->with(['teacherProfile', 'studentProfile', 'review'])
                ->firstOrFail();

            if ($booking->status !== BookingStatus::Completed) {
                throw ValidationException::withMessages([
                    'booking' => 'Only completed bookings can be reviewed.',
                ]);
            }

            if ($booking->review) {
                throw ValidationException::withMessages([
                    'booking' => 'This booking has already been reviewed.',
                ]);
            }

            if (! $booking->teacherProfile || ! $booking->studentProfile) {
                throw ValidationException::withMessages([
                    'booking' => 'Booking relations are incomplete.',
                ]);
            }

            $review = Review::create([
                'booking_id' => $booking->id,
                'teacher_profile_id' => $booking->teacher_profile_id,
                'student_profile_id' => $booking->student_profile_id,
                'rating' => $rating,
                'comment' => $comment,
            ]);

            $this->recalculateTeacherRating($booking->teacherProfile);

            return $review;
        });
    }

    protected function recalculateTeacherRating($teacherProfile): void
    {
        $stats = Review::query()
            ->where('teacher_profile_id', $teacherProfile->id)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total_reviews')
            ->first();

        $teacherProfile->update([
            'rating_avg' => round((float) $stats->avg_rating, 2),
            'rating_count' => (int) $stats->total_reviews,
        ]);
    }
}
