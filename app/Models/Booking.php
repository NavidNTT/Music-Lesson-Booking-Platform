<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use app\Models\StudentProfile;
class Booking extends Model
{
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

    public function teacherProfile(): BelongsTo { return $this->belongsTo(TeacherProfile::class); }
    public function studentProfile(): BelongsTo { return $this->belongsTo(StudentProfile::class); }
    public function timeSlot(): BelongsTo { return $this->belongsTo(TeacherTimeSlot::class, 'teacher_time_slot_id'); }
}
