<?php

namespace App\Exceptions\WorkingGroups;

use RuntimeException;

class WorkingGroupContextNotResolved extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('Working group context has not been resolved for the current request.');
    }
}
