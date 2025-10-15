<?php

namespace App\Policies;

use App\Enums\WorkingGroupRole;
use App\Models\User;
use App\Models\WorkingGroup;
use App\Models\WorkingGroupMembership;
use App\Policies\Concerns\HandlesWorkingGroupAuthorization;

class WorkingGroupMembershipPolicy
{
    use HandlesWorkingGroupAuthorization;

    public function viewAny(User $user, WorkingGroup $workingGroup): bool
    {
        return $this->userHasRole($user, $workingGroup->getKey(), [
            WorkingGroupRole::ADMIN,
            WorkingGroupRole::MANAGER,
        ]);
    }

    public function create(User $user, WorkingGroup $workingGroup): bool
    {
        return $this->userHasRole($user, $workingGroup->getKey(), [
            WorkingGroupRole::ADMIN,
        ]);
    }

    public function update(User $user, WorkingGroupMembership $membership): bool
    {
        return $this->userHasRole($user, $membership->working_group_id, [
            WorkingGroupRole::ADMIN,
        ]);
    }

    public function delete(User $user, WorkingGroupMembership $membership): bool
    {
        if ($membership->role === WorkingGroupRole::ADMIN) {
            return false;
        }

        return $this->userHasRole($user, $membership->working_group_id, [
            WorkingGroupRole::ADMIN,
        ]);
    }
}
