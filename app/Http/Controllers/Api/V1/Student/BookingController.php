<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Domain\Booking\Services\BookingService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(protected BookingService $bookingService) {}

    public function store(Request $request)
    {
        $request->validate([
            'teacher_time_slot_id' => 'required|exists:teacher_time_slots,id',
        ]);

        $student = auth()->user()->studentProfile;

        if (!$student) {
            return response()->json(['message' => 'Student profile not found.'], 404);
        }

        $booking = $this->bookingService->createBooking(
            $student,
            $request->teacher_time_slot_id
        );

        return response()->json([
            'message' => 'Booking request sent successfully. Waiting for teacher confirmation.',
            'booking' => $booking
        ], 201);
    }
    
    public function index()
    {
        $bookings = auth()->user()->studentProfile->bookings()->with(['teacherProfile.user', 'timeSlot'])->get();
        return response()->json(['data' => $bookings]);
    }
}
