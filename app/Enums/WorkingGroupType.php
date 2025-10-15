<?php

namespace App\Enums;

enum WorkingGroupType: string
{
    case PUBLIC = 'public';
    case PRIVATE = 'private';
    case COMPANY = 'company';
}
