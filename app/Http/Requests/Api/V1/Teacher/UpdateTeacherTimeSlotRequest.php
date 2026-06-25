<?php

namespace App\Http\Requests\Api\V1\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeacherTimeSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role->value === 'teacher';
    }

    public function rules(): array
    {
        return [
            'starts_at' => ['sometimes', 'date', 'after:now'],
            'capacity' => ['sometimes', 'integer', 'min:1', 'max:10'],
            'is_enabled' => ['sometimes', 'boolean'],
        ];
    }
}
