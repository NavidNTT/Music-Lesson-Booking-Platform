<?php

namespace App\Http\Controllers\Api\V1\Teacher;

use App\Domain\Teacher\Services\TeacherTimeSlotService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Teacher\StoreTeacherTimeSlotRequest;
use App\Http\Requests\Api\V1\Teacher\UpdateTeacherTimeSlotRequest;
use App\Models\TeacherTimeSlot;
use Illuminate\Http\JsonResponse;

class TeacherTimeSlotController extends Controller
{
    public function __construct(
        private readonly TeacherTimeSlotService $teacherTimeSlotService
    ) {
    }

    public function index(): JsonResponse
    {
        $profile = auth()->user()->teacherProfile;

        if (! $profile) {
            return response()->json([
                'message' => 'Teacher profile not found. Please create your profile first.',
            ], 404);
        }

        $slots = $profile->timeSlots()
            ->orderBy('starts_at')
            ->get();

        return response()->json([
            'data' => $slots,
        ]);
    }

    public function store(StoreTeacherTimeSlotRequest $request): JsonResponse
    {
        $profile = $request->user()->teacherProfile;

        if (! $profile) {
            return response()->json([
                'message' => 'Teacher profile not found. Please create your profile first.',
            ], 404);
        }

        $slot = $this->teacherTimeSlotService->create(
            $profile,
            $request->validated()
        );

        return response()->json([
            'message' => 'Time slot created successfully.',
            'data' => $slot,
        ], 201);
    }

    public function show(TeacherTimeSlot $slot): JsonResponse
    {
        $this->ensureOwnsSlot($slot);

        return response()->json([
            'data' => $slot,
        ]);
    }

    public function update(UpdateTeacherTimeSlotRequest $request, TeacherTimeSlot $slot): JsonResponse
    {
        $this->ensureOwnsSlot($slot);

        $slot = $this->teacherTimeSlotService->update(
            $slot,
            $request->validated()
        );

        return response()->json([
            'message' => 'Time slot updated successfully.',
            'data' => $slot,
        ]);
    }

    public function destroy(TeacherTimeSlot $slot): JsonResponse
    {
        $this->ensureOwnsSlot($slot);

        if ($slot->booked_count > 0) {
            return response()->json([
                'message' => 'Cannot delete a slot that already has bookings.',
            ], 422);
        }

        $slot->delete();

        return response()->json([
            'message' => 'Time slot deleted successfully.',
        ]);
    }

    private function ensureOwnsSlot(TeacherTimeSlot $slot): void
    {
        $profile = auth()->user()->teacherProfile;

        abort_if(
            ! $profile || $slot->teacher_profile_id !== $profile->id,
            403,
            'You are not allowed to access this time slot.'
        );
    }
}
