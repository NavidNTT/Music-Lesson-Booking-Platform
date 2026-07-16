<?php

namespace Database\Factories;

use App\Domain\Teacher\Models\TeacherProfile;
use App\Domain\User\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TeacherProfileFactory extends Factory
{
    protected $model = TeacherProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'bio' => $this->faker->paragraph(),
            'price_per_session' => 300000,
            'is_active' => true,
            'rating_avg' => 0,
            'rating_count' => 0,
        ];
    }
}
