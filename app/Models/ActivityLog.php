<?php

namespace App\Models;

use App\Models\Concerns\BelongsToWorkingGroup;
use Spatie\Activitylog\Models\Activity;

class ActivityLog extends Activity
{
    use BelongsToWorkingGroup;
}
