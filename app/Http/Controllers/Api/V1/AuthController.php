<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\User\Models\User;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    use ApiResponse;

    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $validated['role'] ?? UserRole::Student,
        ]);

        $user->wallet()->create(['balance' => 0]);

        if ($user->isStudent()) {
            $user->studentProfile()->create([]);
        }

        $token = $user->createToken($request->input('device_name', 'api-token'))->plainTextToken;

        return $this->created(
            data: [
                'user' => new UserResource($user),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
            message: 'Registered successfully.'
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only(['email', 'password']);

        if (! Auth::attempt($credentials)) {
            return $this->error('Invalid credentials.', 422);
        }

        $user = Auth::user();

        $token = $user->createToken($request->input('device_name', 'api-token'))->plainTextToken;

        return $this->success(
            data: [
                'user' => new UserResource($user),
                'token' => $token,
                'token_type' => 'Bearer',
            ],
            message: 'Logged in successfully.'
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return $this->success(message: 'Logged out successfully.');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success(data: ['user' => new UserResource($request->user())]);
    }
}
