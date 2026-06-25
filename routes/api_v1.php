<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProfileController;
use Illuminate\Support\Facades\Route;
use  App\Http\Controllers\Api\V1\Teacher\TeacherProfileController;
use App\Http\Controllers\Api\V1\Teacher\TeacherTimeSlotController;
use App\Http\Controllers\Api\V1\Student\BookingController;
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
Route::middleware(['auth:sanctum', 'role:teacher'])
    ->prefix('teacher')
    ->group(function () {
        Route::get('/profile', [TeacherProfileController::class, 'show']);
        Route::patch('/profile', [TeacherProfileController::class, 'update']);
        Route::post('/profile/instruments', [TeacherProfileController::class, 'syncInstruments']);

        Route::get('/slots', [TeacherTimeSlotController::class, 'index']);
        Route::post('/slots', [TeacherTimeSlotController::class, 'store']);
        Route::get('/slots/{slot}', [TeacherTimeSlotController::class, 'show']);
        Route::patch('/slots/{slot}', [TeacherTimeSlotController::class, 'update']);
        Route::delete('/slots/{slot}', [TeacherTimeSlotController::class, 'destroy']);
    });
// Student Routes
Route::middleware(['auth:sanctum', 'role:student'])
    ->prefix('student')
    ->group(function () {
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::get('/bookings', [BookingController::class, 'index']);
    });


    });
    // Admin Routes

