<?php

namespace App\Http\Controllers\Api\V1\Booking;

use App\Domain\Booking\Services\BookingService;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\BookingResource;
use App\Http\Responses\ApiResponse;
use App\Domain\Booking\Models\Booking;
use Illuminate\Http\JsonResponse;

class TeacherBookingController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected BookingService $bookingService
    ) {}

    public function index(): JsonResponse
    {
        $profile = auth()->user()->teacherProfile;

        if (!$profile) {
            return $this->notFound('Teacher profile not found.');
        }

        $bookings = Booking::where('teacher_profile_id', $profile->id)
            ->with(['studentProfile.user', 'timeSlot'])
            ->latest()
            ->paginate(20);

        return $this->success(data: $bookings);
    }

    public function confirm(Booking $booking): JsonResponse
    {
        $profile = auth()->user()->teacherProfile;

        if (!$profile || $booking->teacher_profile_id !== $profile->id) {
            return $this->forbidden('Unauthorized.');
        }

        try {
            $confirmedBooking = $this->bookingService->confirmBooking($booking);

            return $this->success(
                data: new BookingResource($confirmedBooking),
                message: 'Booking confirmed and payment successful.'
            );
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function complete(Booking $booking): JsonResponse
    {
        $profile = auth()->user()->teacherProfile;

        if (!$profile || $booking->teacher_profile_id !== $profile->id) {
            return $this->forbidden('Unauthorized.');
        }

        try {
            $completedBooking = $this->bookingService->completeBooking($booking);

            return $this->success(
                data: new BookingResource($completedBooking),
                message: 'Booking completed successfully.'
            );
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function cancel(Booking $booking): JsonResponse
    {
        $profile = auth()->user()->teacherProfile;

        if (!$profile || $booking->teacher_profile_id !== $profile->id) {
            return $this->forbidden('Unauthorized.');
        }

        try {
            $cancelledBooking = $this->bookingService->cancelBooking(
                $booking,
                request()->input('reason', 'Cancelled by teacher.')
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
