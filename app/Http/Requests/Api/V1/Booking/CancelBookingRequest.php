<?php

namespace App\Http\Requests\Api\V1\Booking;

use App\Enums\BookingStatus;
use Illuminate\Foundation\Http\FormRequest;

class CancelBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $booking = $this->route('booking');

            if (!$booking) {
                $validator->errors()->add('booking', 'Booking not found.');
                return;
            }

            if (!$booking->canTransitionTo(BookingStatus::Cancelled)) {
                $validator->errors()->add(
                    'booking',
                    'This booking cannot be cancelled in its current state.'
                );
                return;
            }

            // Enforce cancellation time window: cannot cancel within 24 hours of the lesson
            $timeSlot = $booking->timeSlot;
            if ($timeSlot && $timeSlot->starts_at && $timeSlot->starts_at->isPast()) {
                $validator->errors()->add(
                    'booking',
                    'Cannot cancel a booking for a lesson that has already started.'
                );
                return;
            }

            if ($timeSlot && $timeSlot->starts_at) {
                $hoursUntilLesson = now()->diffInHours($timeSlot->starts_at, false);
                if ($hoursUntilLesson < 24) {
                    $validator->errors()->add(
                        'booking',
                        'Cancellation must be made at least 24 hours before the lesson starts.'
                    );
                }
            }
        });
    }
}
