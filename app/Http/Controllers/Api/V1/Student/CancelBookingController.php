<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Domain\Booking\Services\BookingService;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CancelBookingController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected BookingService $bookingService
    ) {}

    public function __invoke(Request $request, Booking $booking): JsonResponse
    {
        $student = $request->user()->studentProfile;

        if (!$student || $booking->student_profile_id !== $student->id) {
            return $this->forbidden('Unauthorized.');
        }

        try {
            $cancelledBooking = $this->bookingService->cancelBooking(
                $booking,
                $request->input('reason', 'Cancelled by student.')
            );

            return $this->success(
                data: $cancelledBooking,
                message: 'Booking cancelled successfully.'
            );
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }
}
