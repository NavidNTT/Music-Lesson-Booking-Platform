<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Teacher = 'teacher';
    case Student = 'student';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
