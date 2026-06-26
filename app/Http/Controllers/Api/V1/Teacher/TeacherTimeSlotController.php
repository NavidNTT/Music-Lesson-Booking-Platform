<?php

namespace App\Http\Controllers\Api\V1\Teacher;

use App\Domain\Teacher\Services\TeacherTimeSlotService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Teacher\StoreTeacherTimeSlotRequest;
use App\Http\Requests\Api\V1\Teacher\UpdateTeacherTimeSlotRequest;
use App\Http\Responses\ApiResponse;
use App\Models\TeacherTimeSlot;
use Illuminate\Http\JsonResponse;

class TeacherTimeSlotController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly TeacherTimeSlotService $teacherTimeSlotService
    ) {}

    public function index(): JsonResponse
    {
        $profile = auth()->user()->teacherProfile;

        if (! $profile) {
            return $this->notFound('Teacher profile not found. Please create your profile first.');
        }

        $slots = $profile->timeSlots()
            ->orderBy('starts_at')
            ->paginate(20);

        return $this->success(data: $slots);
    }

    public function store(StoreTeacherTimeSlotRequest $request): JsonResponse
    {
        $profile = $request->user()->teacherProfile;

        if (! $profile) {
            return $this->notFound('Teacher profile not found. Please create your profile first.');
        }

        $slot = $this->teacherTimeSlotService->create(
            $profile,
            $request->validated()
        );

        return $this->created(
            data: $slot,
            message: 'Time slot created successfully.'
        );
    }

    public function show(TeacherTimeSlot $slot): JsonResponse
    {
        $this->ensureOwnsSlot($slot);

        return $this->success(data: $slot);
    }

    public function update(UpdateTeacherTimeSlotRequest $request, TeacherTimeSlot $slot): JsonResponse
    {
        $this->ensureOwnsSlot($slot);

        $slot = $this->teacherTimeSlotService->update(
            $slot,
            $request->validated()
        );

        return $this->success(
            data: $slot,
            message: 'Time slot updated successfully.'
        );
    }

    public function destroy(TeacherTimeSlot $slot): JsonResponse
    {
        $this->ensureOwnsSlot($slot);

        if ($slot->booked_count > 0) {
            return $this->error('Cannot delete a slot that already has bookings.');
        }

        $slot->delete();

        return $this->success(message: 'Time slot deleted successfully.');
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
