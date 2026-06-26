<?php

namespace App\Http\Requests\Api\V1\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherTimeSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role->value === 'teacher';
    }

    public function rules(): array
    {
        return [
            'starts_at' => ['required', 'date', 'after:now'],
            'duration_minutes' => ['sometimes', 'integer', 'min:15', 'max:480'],
            'capacity' => ['sometimes', 'integer', 'min:1', 'max:10'],
            'is_enabled' => ['sometimes', 'boolean'],
        ];
    }
}
