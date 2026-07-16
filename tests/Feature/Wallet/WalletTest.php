<?php

namespace Tests\Feature\Wallet;

use App\Domain\User\Models\User;
use App\Domain\Wallet\Models\Wallet;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletTest extends TestCase
{
    use RefreshDatabase;

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
