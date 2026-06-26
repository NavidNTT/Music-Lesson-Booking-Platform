<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Domain\Booking\Services\BookingService;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    use ApiResponse;

    public function __construct(protected BookingService $bookingService) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'teacher_time_slot_id' => 'required|exists:teacher_time_slots,id',
        ]);

        $student = auth()->user()->studentProfile;

        if (!$student) {
            return $this->notFound('Student profile not found.');
        }

        $booking = $this->bookingService->createBooking(
            $student,
            (int) $validated['teacher_time_slot_id']
        );

        return $this->created(
            data: $booking,
            message: 'Booking request sent successfully. Waiting for teacher confirmation.'
        );
    }

    public function index(): JsonResponse
    {
        $bookings = auth()->user()
            ->studentProfile
            ->bookings()
            ->with(['teacherProfile.user', 'timeSlot'])
            ->latest()
            ->paginate(20);

        return $this->success(data: $bookings);
    }
}
