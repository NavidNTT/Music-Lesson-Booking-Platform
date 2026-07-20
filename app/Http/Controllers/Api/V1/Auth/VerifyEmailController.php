<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Domain\User\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerifyEmailController extends Controller
{
    use ApiResponse;

    /**
     * Verify an email via the signed link from the verification notification.
     * The route uses the "signed" middleware; the hash is re-checked here so
     * the link only works for the address it was issued for.
     */
    public function verify(Request $request, int $id, string $hash): JsonResponse
    {
        $user = User::findOrFail($id);

        if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return $this->forbidden('Invalid verification link.');
        }

        if ($user->hasVerifiedEmail()) {
            return $this->success(message: 'Email already verified.');
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return $this->success(message: 'Email verified successfully.');
    }

    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return $this->success(message: 'Email already verified.');
        }

        $user->sendEmailVerificationNotification();

        return $this->success(message: 'Verification link sent.');
    }
}
