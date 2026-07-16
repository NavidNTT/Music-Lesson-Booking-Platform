<?php

namespace Tests\Feature\Api\V1;

use App\Domain\User\Models\User;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Navid Student',
            'email' => 'student@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::Student->value,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.user.email', 'student@example.com')
            ->assertJsonPath('data.user.role', 'student')
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email', 'role', 'created_at'],
                    'token',
                    'token_type',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'student@example.com',
            'role' => 'student',
        ]);
    }

    public function test_user_can_login(): void
    {
        User::factory()->create([
            'email' => 'student@example.com',
            'password' => 'password123',
            'role' => UserRole::Student,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'student@example.com',
            'password' => 'password123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.user.email', 'student@example.com')
            ->assertJsonStructure([
                'data' => [
                    'user',
                    'token',
                    'token_type',
                ],
            ]);
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Student,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/me');

        $response
            ->assertOk()
            ->assertJsonPath('data.user.id', $user->id)
            ->assertJsonPath('data.user.email', $user->email);
    }

    public function test_guest_cannot_get_profile(): void
    {
        $this->getJson('/api/v1/me')
            ->assertUnauthorized();
    }

    public function test_authenticated_user_can_update_profile(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Student,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson('/api/v1/me', [
            'name' => 'Updated Name',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.user.name', 'Updated Name');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Student,
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson('/api/v1/auth/logout');

        $response->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
