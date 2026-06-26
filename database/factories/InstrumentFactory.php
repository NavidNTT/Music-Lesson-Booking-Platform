<?php

namespace Database\Factories;

use App\Models\Instrument;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class InstrumentFactory extends Factory
{
    protected $model = Instrument::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->randomElement([
            'Piano', 'Guitar', 'Violin', 'Drums', 'Cello',
        ]) . ' ' . $this->faker->unique()->numberBetween(1, 999);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'is_active' => true,
        ];
    }
}
