<?php

namespace App\Domain\Teacher\Models;

use App\Domain\Booking\Models\Booking;
use Database\Factories\TeacherTimeSlotFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeacherTimeSlot extends Model
{
    use HasFactory;

    protected static function newFactory(): Factory
    {
        return TeacherTimeSlotFactory::new();
    }

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

    public function teacherProfile(): BelongsTo
    {
        return $this->belongsTo(TeacherProfile::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'teacher_time_slot_id');
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
