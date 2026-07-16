<?php

namespace Database\Factories;

use App\Domain\Student\Models\StudentProfile;
use App\Domain\User\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentProfileFactory extends Factory
{
    protected $model = StudentProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
        ];
    }
}
