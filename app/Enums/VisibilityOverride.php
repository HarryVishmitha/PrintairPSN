<?php

namespace App\Enums;

enum VisibilityOverride: string
{
    case VISIBLE = 'visible';
    case HIDDEN = 'hidden';
    case INHERITED = 'inherited';

    public function label(): string
    {
        return match($this) {
            self::VISIBLE => 'Visible',
            self::HIDDEN => 'Hidden',
            self::INHERITED => 'Inherited (Default)',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::VISIBLE => 'Force category to be visible for this group',
            self::HIDDEN => 'Hide category from this group',
            self::INHERITED => 'Use default visibility rules',
        };
    }

    public static function options(): array
    {
        return array_map(
            fn($case) => [
                'value' => $case->value,
                'label' => $case->label(),
                'description' => $case->description()
            ],
            self::cases()
        );
    }
}
