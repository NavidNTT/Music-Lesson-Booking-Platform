<?php

namespace Database\Seeders;

use App\Domain\Instrument\Models\Instrument;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class InstrumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $instruments = ['Piano', 'Guitar', 'Violin', 'Drums', 'Cello', 'Vocal'];
        foreach ($instruments as $name) {
            Instrument::updateOrCreate(
                ['name' => $name],
                ['slug' => Str::slug($name), 'is_active' => true],
            );
        }
    }
}
