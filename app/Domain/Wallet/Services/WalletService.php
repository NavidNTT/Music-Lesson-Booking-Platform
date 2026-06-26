<?php

namespace App\Domain\Wallet\Services;

use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WalletService
{
    public function deposit(User $user, float $amount, string $description = null): void
    {
        DB::transaction(function () use ($user, $amount, $description) {
            $wallet = $user->wallet()->lockForUpdate()->firstOrFail();

            $wallet->increment('balance', $amount);

            $wallet->transactions()->create([
                'type' => 'deposit',
                'amount' => $amount,
                'status' => 'success',
                'description' => $description,
            ]);
        });
    }

    public function withdraw(User $user, float $amount, string $description = null): void
    {
        DB::transaction(function () use ($user, $amount, $description) {
            $wallet = $user->wallet()->lockForUpdate()->firstOrFail();

            if ($wallet->balance < $amount) {
                throw ValidationException::withMessages([
                    'wallet' => 'Insufficient wallet balance.',
                ]);
            }

            $wallet->decrement('balance', $amount);

            $wallet->transactions()->create([
                'type' => 'withdraw',
                'amount' => $amount,
                'status' => 'success',
                'description' => $description,
            ]);
        });
    }

    public function payForBooking(User $user, float $amount, int $bookingId): void
    {
        DB::transaction(function () use ($user, $amount, $bookingId) {
            $wallet = $user->wallet()->lockForUpdate()->firstOrFail();

            if ($wallet->balance < $amount) {
                throw ValidationException::withMessages([
                    'wallet' => 'Insufficient balance for booking payment.',
                ]);
            }

            $wallet->decrement('balance', $amount);

            $wallet->transactions()->create([
                'type' => 'payment',
                'amount' => $amount,
                'reference_type' => 'Booking',
                'reference_id' => $bookingId,
                'status' => 'success',
                'description' => 'Payment for booking #' . $bookingId,
            ]);
        });
    }
}
