<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Domain\Booking\Services\BookingService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\BookingResource;
use App\Http\Responses\ApiResponse;
use App\Domain\Booking\Models\Booking;
use App\Http\Requests\Api\V1\Booking\CancelBookingRequest;
use Illuminate\Http\JsonResponse;

class CancelBookingController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected BookingService $bookingService
    ) {}

    public function __invoke(CancelBookingRequest $request, Booking $booking): JsonResponse
    {
        $student = $request->user()->studentProfile;

        if (!$student || $booking->student_profile_id !== $student->id) {
            return $this->forbidden('Unauthorized.');
        }

        try {
            $reason = $request->input('reason', 'Cancelled by student.');

            $cancelledBooking = $this->bookingService->cancelBooking(
                $booking,
                $reason
            );

            return $this->success(
                data: new BookingResource($cancelledBooking),
                message: 'Booking cancelled successfully.'
            );
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }
}
