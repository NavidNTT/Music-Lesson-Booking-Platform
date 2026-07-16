<?php

namespace Database\Factories;

use App\Domain\Teacher\Models\TeacherProfile;
use App\Domain\Teacher\Models\TeacherTimeSlot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TeacherTimeSlot>
 */
class TeacherTimeSlotFactory extends Factory
{
    protected $model = TeacherTimeSlot::class;

    public function definition(): array
    {
        $startsAt = now()->addDay()->setTime(10, 0);
        $endsAt = $startsAt->copy()->addHour();

        return [
            'teacher_profile_id' => TeacherProfile::factory(),
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'capacity' => 1,
            'booked_count' => 0,
            'is_enabled' => true,
        ];
    }
}
