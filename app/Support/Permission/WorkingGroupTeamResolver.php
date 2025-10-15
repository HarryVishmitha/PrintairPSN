<?php

namespace App\Support\Permission;

use App\Support\WorkingGroupContext;
use Spatie\Permission\DefaultTeamResolver;

class WorkingGroupTeamResolver extends DefaultTeamResolver
{
    public function getPermissionsTeamId(): int|string|null
    {
        $teamId = parent::getPermissionsTeamId();

        if ($teamId !== null) {
            return $teamId;
        }

        return app(WorkingGroupContext::class)->currentId();
    }
}
