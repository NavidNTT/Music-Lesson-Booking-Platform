<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_profile_id',
        'student_profile_id',
        'teacher_time_slot_id',
        'status',
        'price_amount',
        'amount',
        'confirmed_at',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected $casts = [
        'price_amount' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

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

    public function setAmountAttribute(mixed $value): void
    {
        $this->attributes['price_amount'] = $value;
    }
}
