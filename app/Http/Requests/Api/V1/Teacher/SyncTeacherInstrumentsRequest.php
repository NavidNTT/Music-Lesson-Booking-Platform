<?php

namespace App\Http\Requests\Api\V1\Teacher;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SyncTeacherInstrumentsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
public function rules(): array
{
    return [
        'instruments' => ['required', 'array'],
        'instruments.*.id' => ['required', 'exists:instruments,id'],
        'instruments.*.levels' => ['required', 'array'],
        'instruments.*.levels.*' => ['in:beginner,intermediate,advanced'],
    ];
}
}
