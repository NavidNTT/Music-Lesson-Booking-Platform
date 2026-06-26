<?php

namespace App\Http\Controllers\Api\V1\Booking;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Domain\Booking\Services\BookingService;
use Illuminate\Http\JsonResponse;

class TeacherBookingController extends Controller
{
    public function __construct(
        protected BookingService $bookingService
    ) {}

    /**
     * لیست رزروهای مربوط به این مدرس
     */
    public function index(): JsonResponse
    {
        $bookings = Booking::where('teacher_profile_id', auth()->user()->teacherProfile->id)
            ->with(['studentProfile.user', 'instrument'])
            ->latest()
            ->get();

        return response()->json(['data' => $bookings]);
    }

    /**
     * تایید رزرو و کسر وجه از هنرجو
     */
    public function confirm(Booking $booking): JsonResponse
    {
        // امنیتی: مطمئن شو این رزرو مال همین مدرس هست
        if ($booking->teacher_profile_id !== auth()->user()->teacherProfile->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        try {
            $confirmedBooking = $this->bookingService->confirmBooking($booking);

            return response()->json([
                'message' => 'Booking confirmed and payment successful.',
                'data' => $confirmedBooking
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }
}
