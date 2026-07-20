<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'teacher_profile_id' => $this->teacher_profile_id,
            'student_profile_id' => $this->student_profile_id,
            'teacher_time_slot_id' => $this->teacher_time_slot_id,
            'status' => $this->status instanceof \BackedEnum
                ? $this->status->value
                : $this->status,
            'price_amount' => (float) $this->price_amount,
            'confirmed_at' => $this->confirmed_at?->toISOString(),
            'cancelled_at' => $this->cancelled_at?->toISOString(),
            'cancellation_reason' => $this->cancellation_reason,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'teacher' => new TeacherProfileResource($this->whenLoaded('teacherProfile')),
            'student' => $this->whenLoaded('studentProfile', fn () => [
                'id' => $this->studentProfile->id,
                'user_id' => $this->studentProfile->user_id,
                'bio' => $this->studentProfile->bio,
                'phone' => $this->studentProfile->phone_number,
                'user' => $this->studentProfile->relationLoaded('user')
                    ? new UserResource($this->studentProfile->user)
                    : null,
            ]),
            'time_slot' => $this->whenLoaded('timeSlot', fn () => new TimeSlotResource($this->timeSlot)),
            'review' => ReviewResource::make($this->whenLoaded('review')),
        ];
    }
}
