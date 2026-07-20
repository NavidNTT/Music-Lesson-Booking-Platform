<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'bio' => $this->bio,
            'price_per_session' => $this->price_per_session,
            'is_active' => $this->is_active,
            'rating_avg' => (float) $this->rating_avg,
            'rating_count' => (int) $this->rating_count,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'user' => new UserResource($this->whenLoaded('user')),
            'instruments' => $this->whenLoaded('instruments', function () {
                return $this->instruments->map(function ($instrument) {
                    $levels = $instrument->pivot->can_teach_levels ?? null;

                    // The pivot stores a JSON string (json_encode into a JSON
                    // column); decode defensively so the API returns an array.
                    if (is_string($levels)) {
                        $decoded = json_decode($levels, true);
                        if (is_string($decoded)) {
                            $decoded = json_decode($decoded, true);
                        }
                        $levels = is_array($decoded) ? $decoded : [];
                    }

                    return [
                        'id' => $instrument->id,
                        'name' => $instrument->name,
                        'slug' => $instrument->slug,
                        'is_active' => (bool) $instrument->is_active,
                        'levels' => $levels ?? [],
                    ];
                })->values();
            }),
            'time_slots' => TimeSlotResource::collection($this->whenLoaded('timeSlots')),
        ];
    }
}
