<?php

namespace App\Domain\Booking\Services;

use App\Models\Booking;
use App\Models\StudentProfile;
use App\Models\TeacherTimeSlot;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingService
{
    public function createBooking(StudentProfile $student, int $slotId): Booking
    {
        return DB::transaction(function () use ($student, $slotId) {
            // 1. پیدا کردن اسلات و قفل کردن ردیف برای جلوگیری از Race Condition
            $slot = TeacherTimeSlot::where('id', $slotId)
                ->lockForUpdate()
                ->firstOrFail();

            // 2. چک کردن بیزنس لاجیک‌ها
            if (!$slot->is_enabled) {
                throw ValidationException::withMessages(['slot' => 'This time slot is disabled.']);
            }

            if ($slot->booked_count >= $slot->capacity) {
                throw ValidationException::withMessages(['slot' => 'This time slot is already fully booked.']);
            }

            // 3. ایجاد رکورد رزرو
            $booking = Booking::create([
                'teacher_profile_id' => $slot->teacher_profile_id,
                'student_profile_id' => $student->id,
                'teacher_time_slot_id' => $slot->id,
                'status' => 'pending',
                'price_amount' => $slot->teacherProfile->price_per_session,
            ]);

            // 4. آپدیت تعداد رزرو شده‌های اسلات
            $slot->increment('booked_count');

            return $booking;
        });
    }
    public function confirmBooking(Booking $booking): Booking
{
    return DB::transaction(function () use ($booking) {
        $booking = Booking::whereKey($booking->id)->lockForUpdate()->firstOrFail();

        if ($booking->status !== 'pending') {
            throw ValidationException::withMessages([
                'booking' => 'Only pending bookings can be confirmed.',
            ]);
        }

        $student = $booking->studentProfile->user;

        app(\App\Domain\Wallet\Services\WalletService::class)
            ->payForBooking(
                $student,
                (float) $booking->price_amount,
                $booking->id
            );

        $booking->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);

        return $booking->fresh();
    });
}

}
