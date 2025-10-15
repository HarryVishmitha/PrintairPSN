<?php

namespace App\Enums;

enum MediaType: string
{
    case PRIMARY = 'primary';
    case GALLERY = 'gallery';

    public function label(): string
    {
        return match($this) {
            self::PRIMARY => 'Primary Image',
            self::GALLERY => 'Gallery Image',
        };
    }

    public static function options(): array
    {
        return array_map(
            fn($case) => ['value' => $case->value, 'label' => $case->label()],
            self::cases()
        );
    }
}
