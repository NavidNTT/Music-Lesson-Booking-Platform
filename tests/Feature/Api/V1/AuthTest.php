<?php

namespace Tests\Feature\Api\V1;

use App\Domain\User\Models\User;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
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

        $user = User::where('email', 'student@example.com')->first();
        $this->assertNotNull($user->wallet, 'Wallet should be auto-created on registration.');
        $this->assertNotNull($user->studentProfile, 'StudentProfile should be auto-created for student registrations.');
    }

    public function test_cannot_register_as_admin(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Evil Admin',
            'email' => 'evil@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::Admin->value,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);

        $this->assertDatabaseMissing('users', ['email' => 'evil@example.com']);
    }

    public function test_teacher_registration_does_not_create_student_profile(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Teacher Person',
            'email' => 'teacher@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::Teacher->value,
        ]);

        $response->assertCreated();

        $user = User::where('email', 'teacher@example.com')->first();
        $this->assertNull($user->studentProfile);
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

    public function test_teacher_can_register_with_valid_data(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Valid Teacher',
            'email' => 'valid.teacher@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::Teacher->value,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.user.role', 'teacher');

        $this->assertDatabaseHas('users', [
            'email' => 'valid.teacher@example.com',
            'role' => 'teacher',
        ]);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'real@example.com',
            'password' => 'password123',
            'role' => UserRole::Student,
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'real@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(422)
            ->assertJsonPath('message', 'Invalid credentials.');
    }

    public function test_registration_fails_with_invalid_data(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
            'role' => UserRole::Student->value,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_registration_rejects_duplicate_email(): void
    {
        User::factory()->create([
            'email' => 'taken@example.com',
            'role' => UserRole::Student,
        ]);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Second User',
            'email' => 'taken@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::Student->value,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->assertDatabaseCount('users', 1);
    }

    public function test_password_is_hashed_and_never_stored_as_plain_text(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Hash Check',
            'email' => 'hash@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::Student->value,
        ])->assertCreated();

        $user = User::where('email', 'hash@example.com')->first();

        $this->assertNotSame('password123', $user->password);
        $this->assertTrue(Hash::check('password123', $user->password));
    }
}
