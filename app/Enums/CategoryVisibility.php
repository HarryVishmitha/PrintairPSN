<?php

namespace App\Enums;

enum CategoryVisibility: string
{
    case GLOBAL = 'global';
    case WORKING_GROUP_SCOPED = 'working_group_scoped';

    public function label(): string
    {
        return match($this) {
            self::GLOBAL => 'Global (All Groups)',
            self::WORKING_GROUP_SCOPED => 'Scoped (Specific Groups)',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::GLOBAL => 'Visible to all working groups unless explicitly overridden',
            self::WORKING_GROUP_SCOPED => 'Visible only to groups with explicit access',
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
