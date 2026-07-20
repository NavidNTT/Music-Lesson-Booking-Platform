<?php

namespace Tests\Feature\Wallet;

use App\Domain\User\Models\User;
use App\Domain\Wallet\Models\Wallet;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WalletTest extends TestCase
{
    use RefreshDatabase;

    public function test_wallet_endpoint_returns_wallet_for_authenticated_user(): void
    {
        $student = User::factory()->create(['role' => UserRole::Student]);
        Wallet::factory()->create(['user_id' => $student->id, 'balance' => 250000]);

        Sanctum::actingAs($student);

        $this->getJson('/api/v1/wallet')
            ->assertOk()
            ->assertJsonPath('data.balance', 250000)
            ->assertJsonStructure(['data' => ['id', 'user_id', 'balance', 'transactions']]);
    }

    public function test_wallet_endpoint_auto_provisions_missing_wallet(): void
    {
        // A user with no wallet row must still get a valid (zero-balance) payload,
        // never a null response that would hang the client.
        $user = User::factory()->create(['role' => UserRole::Teacher]);
        $this->assertDatabaseMissing('wallets', ['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/wallet')
            ->assertOk()
            ->assertJsonPath('data.balance', 0);

        $this->assertDatabaseHas('wallets', ['user_id' => $user->id]);
    }

    public function test_guest_cannot_access_wallet(): void
    {
        $this->getJson('/api/v1/wallet')->assertUnauthorized();
    }

    public function test_student_wallet_exists(): void
    {
        $student = User::factory()->create([
            'role' => UserRole::Student,
        ]);

        Wallet::factory()->create([
            'user_id' => $student->id,
            'balance' => 0,
        ]);

        $this->assertDatabaseHas('wallets', [
            'user_id' => $student->id,
        ]);
    }

    public function test_wallet_balance_can_be_updated(): void
    {
        $student = User::factory()->create([
            'role' => UserRole::Student,
        ]);

        $wallet = Wallet::factory()->create([
            'user_id' => $student->id,
            'balance' => 100000,
        ]);

        $wallet->increment('balance', 200000);

        $this->assertDatabaseHas('wallets', [
            'id' => $wallet->id,
            'balance' => 300000,
        ]);
    }
}
