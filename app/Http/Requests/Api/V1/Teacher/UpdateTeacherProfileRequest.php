<?php

namespace App\Http\Requests\Api\V1\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeacherProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role->value === 'teacher';
    }

    public function rules(): array
    {
        return [
            'bio' => ['nullable', 'string'],
            'price_per_session' => ['required', 'integer', 'min:10000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
