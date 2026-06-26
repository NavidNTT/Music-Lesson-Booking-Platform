<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\TeacherTimeSlot;
use Illuminate\Database\Eloquent\Relations\HasMany;
class TeacherProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'price_per_session',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'rating_avg' => 'float',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function instruments()
    {
        return $this->belongsToMany(Instrument::class)
            ->withPivot('can_teach_levels')
            ->withTimestamps();
    }
    public function timeSlots()
{
    return $this->hasMany(TeacherTimeSlot::class);
}
public function reviews(): HasMany
{
    return $this->hasMany(Review::class);
}
}
