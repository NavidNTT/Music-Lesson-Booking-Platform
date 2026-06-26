<?php

namespace App\Http\Controllers\Api\V1\Review;

use App\Domain\Review\Services\ReviewService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Review\StoreReviewRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected ReviewService $reviewService
    ) {}

    public function store(StoreReviewRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->studentProfile) {
            return $this->forbidden('Student profile not found.');
        }

        $booking = Booking::query()
            ->whereKey($request->integer('booking_id'))
            ->where('student_profile_id', $user->studentProfile->id)
            ->first();

        if (! $booking) {
            return $this->notFound('Booking not found or unauthorized.');
        }

        $review = $this->reviewService->storeReview(
            $booking,
            (int) $request->integer('rating'),
            $request->input('comment')
        );

        return $this->created(
            data: $review,
            message: 'Review submitted successfully.'
        );
    }
}
