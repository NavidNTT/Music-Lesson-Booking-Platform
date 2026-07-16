<?php

namespace Tests\Feature\Admin;

use App\Domain\Instrument\Models\Instrument;
use App\Domain\User\Models\User;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InstrumentTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_instrument(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/instruments', [
                'name' => 'Piano',
                'is_active' => true,
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('instruments', [
            'name' => 'Piano',
            'slug' => 'piano',
        ]);
    }

    public function test_non_admin_cannot_create_instrument(): void
    {
        $student = User::factory()->create([
            'role' => UserRole::Student,
        ]);

        $response = $this->actingAs($student, 'sanctum')
            ->postJson('/api/v1/admin/instruments', [
                'name' => 'Violin',
            ]);

        $response->assertForbidden();
    }

    public function test_public_can_list_instruments(): void
    {
        Instrument::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/instruments');

        $response->assertOk();
    }
}
