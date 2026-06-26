<?php

namespace App\Enums;

enum BookingStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function canTransitionTo(self $target): bool
    {
        return match ($this) {
            self::Pending => $target === self::Confirmed || $target === self::Cancelled,
            self::Confirmed => $target === self::Completed || $target === self::Cancelled,
            self::Completed => false,
            self::Cancelled => false,
        };
    }
}
