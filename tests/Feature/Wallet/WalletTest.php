<?php

namespace Tests\Feature\Wallet;

use App\Enums\UserRole;
use App\Models\StudentProfile;
use App\Models\User;
use App\Models\Wallet;
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

        $studentProfile = StudentProfile::factory()->create([
            'user_id' => $student->id,
        ]);

        Wallet::factory()->create([
            'student_profile_id' => $studentProfile->id,
            'balance' => 0,
        ]);

        $this->assertDatabaseHas('wallets', [
            'student_profile_id' => $studentProfile->id,
        ]);
    }

    public function test_wallet_balance_can_be_updated(): void
    {
        $student = User::factory()->create([
            'role' => UserRole::Student,
        ]);

        $studentProfile = StudentProfile::factory()->create([
            'user_id' => $student->id,
        ]);

        $wallet = Wallet::factory()->create([
            'student_profile_id' => $studentProfile->id,
            'balance' => 100000,
        ]);

        $wallet->increment('balance', 200000);

        $this->assertDatabaseHas('wallets', [
            'id' => $wallet->id,
            'balance' => 300000,
        ]);
    }
}
