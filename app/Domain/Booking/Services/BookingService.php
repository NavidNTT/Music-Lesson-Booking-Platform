<?php

namespace App\Domain\Booking\Services;

use App\Domain\Wallet\Services\WalletService;
use App\Enums\BookingStatus;
use App\Domain\Booking\Models\Booking;
use App\Domain\Student\Models\StudentProfile;
use App\Domain\Teacher\Models\TeacherTimeSlot;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingService
{
    public function __construct(
        protected WalletService $walletService
    ) {}

    public function createBooking(StudentProfile $student, int $slotId): Booking
    {
        return DB::transaction(function () use ($student, $slotId) {
            $slot = TeacherTimeSlot::where('id', $slotId)
                ->lockForUpdate()
                ->firstOrFail();

            if (!$slot->is_enabled) {
                throw ValidationException::withMessages(['slot' => 'This time slot is disabled.']);
            }

            if ($slot->booked_count >= $slot->capacity) {
                throw ValidationException::withMessages(['slot' => 'This time slot is already fully booked.']);
            }

            if ($slot->bookings()->where('student_profile_id', $student->id)->whereIn('status', [BookingStatus::Pending, BookingStatus::Confirmed])->exists()) {
                throw ValidationException::withMessages(['slot' => 'You have already booked this time slot.']);
            }

            $booking = Booking::create([
                'teacher_profile_id' => $slot->teacher_profile_id,
                'student_profile_id' => $student->id,
                'teacher_time_slot_id' => $slot->id,
                'status' => BookingStatus::Pending,
                'price_amount' => $slot->teacherProfile->price_per_session,
            ]);

            $slot->increment('booked_count');

            return $booking;
        });
    }

    public function confirmBooking(Booking $booking): Booking
    {
        return DB::transaction(function () use ($booking) {
            $booking = Booking::whereKey($booking->id)->lockForUpdate()->firstOrFail();

            if (!$booking->canTransitionTo(BookingStatus::Confirmed)) {
                throw ValidationException::withMessages([
                    'booking' => 'Only pending bookings can be confirmed.',
                ]);
            }

            $student = $booking->studentProfile->user;

            $this->walletService->payForBooking(
                $student,
                (float) $booking->price_amount,
                $booking->id
            );

            $booking->update([
                'status' => BookingStatus::Confirmed,
                'confirmed_at' => now(),
            ]);

            return $booking->fresh();
        });
    }

    public function completeBooking(Booking $booking): Booking
    {
        return DB::transaction(function () use ($booking) {
            $booking = Booking::whereKey($booking->id)->lockForUpdate()->firstOrFail();

            if (!$booking->canTransitionTo(BookingStatus::Completed)) {
                throw ValidationException::withMessages([
                    'booking' => 'Only confirmed bookings can be completed.',
                ]);
            }

            $booking->update([
                'status' => BookingStatus::Completed,
            ]);

            return $booking->fresh();
        });
    }

    public function cancelBooking(Booking $booking, ?string $reason = null): Booking
    {
        return DB::transaction(function () use ($booking, $reason) {
            $booking = Booking::whereKey($booking->id)->lockForUpdate()->firstOrFail();

            if (!$booking->canTransitionTo(BookingStatus::Cancelled)) {
                throw ValidationException::withMessages([
                    'booking' => 'This booking cannot be cancelled.',
                ]);
            }

            $wasConfirmed = $booking->status === BookingStatus::Confirmed;

            $booking->update([
                'status' => BookingStatus::Cancelled,
                'cancelled_at' => now(),
                'cancellation_reason' => $reason,
                'confirmed_at' => $wasConfirmed ? $booking->confirmed_at : $booking->getOriginal('confirmed_at'),
            ]);

            if ($wasConfirmed) {
                $student = $booking->studentProfile->user;
                $this->walletService->refundForCancelledBooking($student, (float) $booking->price_amount, $booking->id);
            }

            // Reload the time slot with pessimistic lock to safely decrement booked_count
            $slot = TeacherTimeSlot::whereKey($booking->teacher_time_slot_id)
                ->lockForUpdate()
                ->first();

            if ($slot && $slot->booked_count > 0) {
                $slot->decrement('booked_count');
            }

            return $booking->fresh();
        });
    }
}
