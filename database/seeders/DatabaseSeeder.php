<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Delegates to DemoSeeder, which is idempotent and safe to re-run in
     * local/testing environments (and no-ops in production).
     */
    public function run(): void
    {
        $this->call(DemoSeeder::class);
    }
}
