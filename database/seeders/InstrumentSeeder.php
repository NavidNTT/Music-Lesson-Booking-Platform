<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InstrumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
public function run(): void
{
    $instruments = ['Piano', 'Guitar', 'Violin', 'Drums', 'Cello', 'Vocal'];
    foreach ($instruments as $name) {
        \App\Models\Instrument::updateOrCreate(['name' => $name]);
    }
}
}
