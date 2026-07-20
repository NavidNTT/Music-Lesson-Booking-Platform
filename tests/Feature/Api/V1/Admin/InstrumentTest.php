<?php

namespace Tests\Feature\Api\V1\Admin;

use App\Domain\User\Models\User;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InstrumentTest extends TestCase
{
    /**
     * A basic feature test example.
     */
    use RefreshDatabase;

    public function test_only_admin_can_create_instrument()
    {
        $student = User::factory()->create(['role' => UserRole::Student]);
        $admin = User::factory()->create(['role' => UserRole::Admin]);

        // Student tries
        /** @var User $student */
        $this->actingAs($student, 'sanctum')
            ->postJson('/api/v1/admin/instruments', ['name' => 'Piano'])
            ->assertStatus(403);

        // Admin tries
        /** @var User $admin */
        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/instruments', ['name' => 'Piano'])
            ->assertStatus(201);
    }
}
