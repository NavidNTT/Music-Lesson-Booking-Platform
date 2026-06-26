<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    protected function success(mixed $data = null, string $message = null, int $code = 200, array $extra = []): JsonResponse
    {
        $payload = [];

        if ($message !== null) {
            $payload['message'] = $message;
        }

        if ($data !== null) {
            $payload['data'] = $data;
        }

        return response()->json(array_merge($payload, $extra), $code);
    }

    protected function created(mixed $data = null, string $message = 'Created successfully.'): JsonResponse
    {
        return $this->success($data, $message, 201);
    }

    protected function error(string $message, int $code = 422): JsonResponse
    {
        return response()->json(['message' => $message], $code);
    }

    protected function forbidden(string $message = 'Access denied.'): JsonResponse
    {
        return response()->json(['message' => $message], 403);
    }

    protected function notFound(string $message = 'Resource not found.'): JsonResponse
    {
        return response()->json(['message' => $message], 404);
    }
}
