<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'teacher_profile_id' => $this->teacher_profile_id,
            'student_profile_id' => $this->student_profile_id,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'teacher' => TeacherProfileResource::make($this->whenLoaded('teacherProfile')),
            'booking' => $this->whenLoaded('booking'),
        ];
    }
}
