<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\TeacherTimeSlot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $teacherProfile = TeacherProfile::factory()->create();

        return [
            'teacher_profile_id' => $teacherProfile->id,
            'student_profile_id' => StudentProfile::factory(),
            'teacher_time_slot_id' => TeacherTimeSlot::factory()->create([
                'teacher_profile_id' => $teacherProfile->id,
            ])->id,
            'status' => 'pending',
            'price_amount' => 400000,
            'confirmed_at' => null,
            'cancelled_at' => null,
            'cancellation_reason' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn () => [
            'status' => 'completed',
            'confirmed_at' => now()->subDay(),
        ]);
    }

    public function confirmed(): static
    {
        return $this->state(fn () => [
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn () => [
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => 'Cancelled for testing.',
        ]);
    }
}
