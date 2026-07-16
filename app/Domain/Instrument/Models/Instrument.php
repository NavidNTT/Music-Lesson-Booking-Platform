<?php

namespace App\Domain\Instrument\Models;

use Database\Factories\InstrumentFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Instrument extends Model
{
    use HasFactory;

    protected static function newFactory(): Factory
    {
        return InstrumentFactory::new();
    }

    protected $fillable = ['name', 'slug', 'is_active'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($instrument) {
            if (! $instrument->slug) {
                $instrument->slug = Str::slug($instrument->name);
            }
        });
    }
}
