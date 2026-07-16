<?php

namespace Database\Factories;

use App\Domain\Booking\Models\Booking;
use App\Domain\Review\Models\Review;
use App\Domain\Student\Models\StudentProfile;
use App\Domain\Teacher\Models\TeacherProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    protected $model = Review::class;

    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'teacher_profile_id' => TeacherProfile::factory(),
            'student_profile_id' => StudentProfile::factory(),
            'rating' => $this->faker->numberBetween(1, 5),
            'comment' => $this->faker->sentence(),
        ];
    }
}
