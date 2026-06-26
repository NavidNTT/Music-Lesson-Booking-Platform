<?php

namespace App\Http\Controllers\Api\V1\Wallet;

use App\Domain\Wallet\Services\WalletService;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepositController extends Controller
{
    use ApiResponse;

    public function __construct(protected WalletService $walletService) {}

    public function store(Request $request): JsonResponse
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

        return $this->success(message: 'Wallet topped up successfully.');
    }
}
