<?php

namespace App\Domain\Student\Models;

use App\Domain\Booking\Models\Booking;
use App\Domain\Review\Models\Review;
use App\Domain\User\Models\User;
use Database\Factories\StudentProfileFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentProfile extends Model
{
    use HasFactory;

    protected static function newFactory(): Factory
    {
        return StudentProfileFactory::new();
    }

    protected $fillable = [
        'user_id',
        'bio',
        'phone_number',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
