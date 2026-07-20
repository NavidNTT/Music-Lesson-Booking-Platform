<?php

namespace App\Http\Controllers\Api\V1\Wallet;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\WalletResource;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    use ApiResponse;

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        // Guarantee a wallet exists so the endpoint never returns a null payload
        // that would leave the client stuck (all users get a wallet at registration,
        // but this protects pre-existing accounts and edge cases).
        $wallet = $user->wallet()->firstOrCreate([], ['balance' => 0]);
        $wallet->load('transactions');

        return $this->success(data: new WalletResource($wallet));
    }
}
