<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Review;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
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
