<?php

namespace App\Enums;

enum WorkingGroupRole: string
{
    case SUPER_ADMIN = 'super_admin';
    case ADMIN = 'admin';
    case MANAGER = 'manager';
    case DESIGNER = 'designer';
    case MARKETING = 'marketing';
    case MEMBER = 'member';
}
