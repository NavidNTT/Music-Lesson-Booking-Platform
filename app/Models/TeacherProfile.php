<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeacherProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'price_per_session',
        'is_active',
        'rating_avg',
        'rating_count',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'rating_avg' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function instruments(): BelongsToMany
    {
        return $this->belongsToMany(Instrument::class, 'teacher_instrument')
            ->withPivot('can_teach_levels')
            ->withTimestamps();
    }

    public function timeSlots(): HasMany
    {
        return $this->hasMany(TeacherTimeSlot::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
