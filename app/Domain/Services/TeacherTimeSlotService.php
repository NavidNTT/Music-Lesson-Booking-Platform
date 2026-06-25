<?php

namespace App\Domain\Teacher\Services;

use App\Models\TeacherProfile;
use App\Models\TeacherTimeSlot;
use Carbon\CarbonImmutable;
use Illuminate\Validation\ValidationException;

class TeacherTimeSlotService
{
    private const SESSION_DURATION_MINUTES = 60;

    public function create(TeacherProfile $teacherProfile, array $data): TeacherTimeSlot
    {
        $startsAt = CarbonImmutable::parse($data['starts_at']);
        $endsAt = $startsAt->addMinutes(self::SESSION_DURATION_MINUTES);

        $this->ensureNoOverlap($teacherProfile, $startsAt, $endsAt);

        return $teacherProfile->timeSlots()->create([
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'capacity' => $data['capacity'] ?? 1,
            'is_enabled' => $data['is_enabled'] ?? true,
        ]);
    }

    public function update(TeacherTimeSlot $slot, array $data): TeacherTimeSlot
    {
        $startsAt = isset($data['starts_at'])
            ? CarbonImmutable::parse($data['starts_at'])
            : CarbonImmutable::parse($slot->starts_at);

        $endsAt = $startsAt->addMinutes(self::SESSION_DURATION_MINUTES);

        $this->ensureNoOverlap(
            $slot->teacherProfile,
            $startsAt,
            $endsAt,
            $slot->id
        );

        $slot->update([
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'capacity' => $data['capacity'] ?? $slot->capacity,
            'is_enabled' => $data['is_enabled'] ?? $slot->is_enabled,
        ]);

        return $slot->refresh();
    }

    private function ensureNoOverlap(
        TeacherProfile $teacherProfile,
        CarbonImmutable $startsAt,
        CarbonImmutable $endsAt,
        ?int $exceptSlotId = null
    ): void {
        $query = $teacherProfile->timeSlots()
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt);

        if ($exceptSlotId !== null) {
            $query->whereKeyNot($exceptSlotId);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'starts_at' => ['This time slot overlaps with an existing slot.'],
            ]);
        }
    }
}
