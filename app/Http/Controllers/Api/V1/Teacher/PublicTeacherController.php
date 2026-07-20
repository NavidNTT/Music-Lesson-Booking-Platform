<?php

namespace App\Http\Controllers\Api\V1\Teacher;

use App\Domain\Teacher\Models\TeacherProfile;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\TeacherProfileResource;
use App\Http\Resources\Api\V1\TimeSlotResource;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicTeacherController extends Controller
{
    use ApiResponse;

    /**
     * Publicly list active teachers with optional instrument filter and name search.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'instrument' => ['sometimes', 'string', 'max:100'],
            'search' => ['sometimes', 'string', 'max:100'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        $teachers = TeacherProfile::query()
            ->where('is_active', true)
            ->with(['user', 'instruments'])
            ->when($validated['instrument'] ?? null, function ($query, $instrument) {
                $query->whereHas('instruments', function ($q) use ($instrument) {
                    $q->where('slug', $instrument)->orWhere('instruments.id', $instrument);
                });
            })
            ->when($validated['search'] ?? null, function ($query, $search) {
                $query->whereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            })
            ->orderByDesc('rating_avg')
            ->orderByDesc('rating_count')
            ->paginate($validated['per_page'] ?? 12)
            ->through(fn (TeacherProfile $teacher) => new TeacherProfileResource($teacher));

        return $this->success(data: $teachers);
    }

    public function show(TeacherProfile $teacher): JsonResponse
    {
        if (! $teacher->is_active) {
            return $this->notFound('Teacher not found.');
        }

        $teacher->load(['user', 'instruments']);

        return $this->success(data: new TeacherProfileResource($teacher));
    }

    /**
     * Upcoming, enabled slots with remaining capacity for a teacher.
     */
    public function slots(TeacherProfile $teacher): JsonResponse
    {
        if (! $teacher->is_active) {
            return $this->notFound('Teacher not found.');
        }

        $slots = $teacher->timeSlots()
            ->where('is_enabled', true)
            ->where('starts_at', '>', now())
            ->whereColumn('booked_count', '<', 'capacity')
            ->orderBy('starts_at')
            ->paginate(50)
            ->through(fn ($slot) => new TimeSlotResource($slot));

        return $this->success(data: $slots);
    }
}
