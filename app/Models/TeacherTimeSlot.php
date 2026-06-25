<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherTimeSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_profile_id',
        'starts_at',
        'ends_at',
        'capacity',
        'booked_count',
        'is_enabled',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'capacity' => 'integer',
            'booked_count' => 'integer',
            'is_enabled' => 'boolean',
        ];
    }

    public function teacherProfile()
    {
        return $this->belongsTo(TeacherProfile::class);
    }

    public function getAvailableSeatsAttribute(): int
    {
        return max(0, $this->capacity - $this->booked_count);
    }

    public function getIsFullAttribute(): bool
    {
        return $this->booked_count >= $this->capacity;
    }
}
