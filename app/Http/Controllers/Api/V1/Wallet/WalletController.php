<?php

namespace App\Http\Controllers\Api\V1\Wallet;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function me(Request $request)
    {
        $wallet = $request->user()->wallet()->with('transactions')->first();

        return response()->json([
            'data' => $wallet,
        ]);
    }
}
