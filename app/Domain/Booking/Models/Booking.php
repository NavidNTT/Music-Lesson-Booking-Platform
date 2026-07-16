<?php

namespace App\Domain\Booking\Models;

use App\Domain\Review\Models\Review;
use App\Domain\Student\Models\StudentProfile;
use App\Domain\Teacher\Models\TeacherProfile;
use App\Domain\Teacher\Models\TeacherTimeSlot;
use App\Enums\BookingStatus;
use Database\Factories\BookingFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    use HasFactory;

    protected static function newFactory(): Factory
    {
        return BookingFactory::new();
    }

    protected $fillable = [
        'teacher_profile_id',
        'student_profile_id',
        'teacher_time_slot_id',
        'status',
        'price_amount',
        'confirmed_at',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected function casts(): array
    {
        return [
            'price_amount' => 'decimal:2',
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'status' => BookingStatus::class,
        ];
    }

    public function teacherProfile(): BelongsTo
    {
        return $this->belongsTo(TeacherProfile::class);
    }

    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }

    public function timeSlot(): BelongsTo
    {
        return $this->belongsTo(TeacherTimeSlot::class, 'teacher_time_slot_id');
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function getAmountAttribute(): mixed
    {
        return $this->price_amount;
    }

    public function canTransitionTo(BookingStatus $target): bool
    {
        return $this->status->canTransitionTo($target);
    }
}
