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
        $wallet = $request->user()->wallet()->with('transactions')->first();

        return $this->success(data: new WalletResource($wallet));
    }
}
