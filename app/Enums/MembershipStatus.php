<?php

namespace App\Enums;

enum MembershipStatus: string
{
    case ACTIVE = 'active';
    case INVITED = 'invited';
    case SUSPENDED = 'suspended';
}
