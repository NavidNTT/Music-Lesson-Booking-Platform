<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')
    ->name('api.v1.')
    ->group(function () {
        Route::post('/auth/register', [AuthController::class, 'register'])->name('auth.register');
        Route::post('/auth/login', [AuthController::class, 'login'])->name('auth.login');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');

            Route::get('/me', [AuthController::class, 'me'])->name('me');
            Route::patch('/me', [ProfileController::class, 'update'])->name('me.update');
            Route::middleware(['auth:sanctum', 'role:admin'])
                ->prefix('admin')
                ->name('admin.')
                ->group(function () {
                    Route::apiResource('instruments', \App\Http\Controllers\Api\V1\Admin\InstrumentController::class);
                });
            
            // Public/Student Routes
            Route::get('instruments', [\App\Http\Controllers\Api\V1\Admin\InstrumentController::class, 'index']);
            });
    });
    // Admin Routes

