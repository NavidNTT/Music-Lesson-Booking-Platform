<?php

namespace App\Http\Controllers\Api\V1\Review;

use App\Domain\Review\Services\ReviewService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Review\StoreReviewRequest;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    public function __construct(
        protected ReviewService $reviewService
    ) {}

    public function store(StoreReviewRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->studentProfile) {
            return response()->json([
                'message' => 'Student profile not found.',
            ], 403);
        }

        $booking = Booking::query()
            ->whereKey($request->integer('booking_id'))
            ->where('student_profile_id', $user->studentProfile->id)
            ->first();

        if (! $booking) {
            return response()->json([
                'message' => 'Booking not found or unauthorized.',
            ], 404);
        }

        $review = $this->reviewService->storeReview(
            $booking,
            (int) $request->integer('rating'),
            $request->input('comment')
        );

        return response()->json([
            'message' => 'Review submitted successfully.',
            'data' => $review,
        ], 201);
    }
}
