<?php

namespace App\Domain\Review\Models;

use App\Domain\Booking\Models\Booking;
use App\Domain\Student\Models\StudentProfile;
use App\Domain\Teacher\Models\TeacherProfile;
use Database\Factories\ReviewFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected static function newFactory(): Factory
    {
        return ReviewFactory::new();
    }

    protected $fillable = [
        'booking_id',
        'teacher_profile_id',
        'student_profile_id',
        'rating',
        'comment',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function teacherProfile(): BelongsTo
    {
        return $this->belongsTo(TeacherProfile::class);
    }

    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }
}
