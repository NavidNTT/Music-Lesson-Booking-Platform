<?php

namespace App\Http\Controllers\Api\V1\Wallet;

use App\Domain\Wallet\Services\WalletService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DepositController extends Controller
{
    public function __construct(protected WalletService $walletService) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'description' => ['nullable', 'string'],
        ]);

        $this->walletService->deposit(
            $request->user(),
            (float) $validated['amount'],
            $validated['description'] ?? null
        );

        return response()->json([
            'message' => 'Wallet topped up successfully.',
        ]);
    }
}
