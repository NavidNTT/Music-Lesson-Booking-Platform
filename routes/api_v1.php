<?php

use App\Http\Controllers\Api\V1\Admin\InstrumentController;
use App\Http\Controllers\Api\V1\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\V1\Auth\ResetPasswordController;
use App\Http\Controllers\Api\V1\Auth\VerifyEmailController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\Booking\TeacherBookingController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\Review\ReviewController;
use App\Http\Controllers\Api\V1\Student\BookingController;
use App\Http\Controllers\Api\V1\Student\CancelBookingController;
use App\Http\Controllers\Api\V1\Teacher\TeacherProfileController;
use App\Http\Controllers\Api\V1\Teacher\TeacherTimeSlotController;
use App\Http\Controllers\Api\V1\Wallet\DepositController;
use App\Http\Controllers\Api\V1\Wallet\WalletController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')
    ->name('api.v1.')
    ->group(function () {
        Route::post('/auth/register', [AuthController::class, 'register'])
            ->middleware('throttle:5,1')
            ->name('auth.register');
        Route::post('/auth/login', [AuthController::class, 'login'])
            ->middleware('throttle:10,1')
            ->name('auth.login');

        Route::get('/instruments', [InstrumentController::class, 'index'])->name('instruments.index');

        Route::post('/forgot-password', ForgotPasswordController::class)->name('password.forgot');
        Route::post('/reset-password', ResetPasswordController::class)->name('password.reset');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
            Route::get('/me', [AuthController::class, 'me'])->name('me');
            Route::patch('/me', [ProfileController::class, 'update'])->name('me.update');

            Route::post('/email/verify', [VerifyEmailController::class, 'verify'])->name('verification.verify');
            Route::post('/email/resend', [VerifyEmailController::class, 'resend'])->name('verification.resend');

            Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
        });

        Route::middleware(['auth:sanctum', 'role:admin'])
            ->prefix('admin')
            ->name('admin.')
            ->group(function () {
                Route::apiResource('instruments', InstrumentController::class);
            });

        Route::middleware(['auth:sanctum', 'role:teacher'])
            ->prefix('teacher')
            ->name('teacher.')
            ->group(function () {
                Route::get('/profile', [TeacherProfileController::class, 'show'])->name('profile.show');
                Route::patch('/profile', [TeacherProfileController::class, 'update'])->name('profile.update');
                Route::post('/profile/instruments', [TeacherProfileController::class, 'syncInstruments'])->name('profile.instruments.sync');

                Route::get('/bookings', [TeacherBookingController::class, 'index'])->name('bookings.index');
                Route::post('/bookings/{booking}/confirm', [TeacherBookingController::class, 'confirm'])->name('bookings.confirm');
                Route::post('/bookings/{booking}/complete', [TeacherBookingController::class, 'complete'])->name('bookings.complete');
                Route::post('/bookings/{booking}/cancel', [TeacherBookingController::class, 'cancel'])->name('bookings.cancel');

                Route::get('/slots', [TeacherTimeSlotController::class, 'index'])->name('slots.index');
                Route::post('/slots', [TeacherTimeSlotController::class, 'store'])->name('slots.store');
                Route::get('/slots/{slot}', [TeacherTimeSlotController::class, 'show'])->name('slots.show');
                Route::patch('/slots/{slot}', [TeacherTimeSlotController::class, 'update'])->name('slots.update');
                Route::delete('/slots/{slot}', [TeacherTimeSlotController::class, 'destroy'])->name('slots.destroy');
            });

        Route::middleware(['auth:sanctum', 'role:student'])
            ->prefix('student')
            ->name('student.')
            ->group(function () {
                Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
                Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
                Route::post('/bookings/{booking}/cancel', CancelBookingController::class)->name('bookings.cancel');
            });

        Route::middleware('auth:sanctum')
            ->prefix('wallet')
            ->name('wallet.')
            ->group(function () {
                Route::get('/', [WalletController::class, 'me'])->name('me');
                Route::post('/deposit', [DepositController::class, 'store'])->name('deposit.store');
            });
    });
