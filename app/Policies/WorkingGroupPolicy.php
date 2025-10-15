<?php

namespace App\Policies;

use App\Enums\WorkingGroupRole;
use App\Models\User;
use App\Models\WorkingGroup;
use App\Policies\Concerns\HandlesWorkingGroupAuthorization;

class WorkingGroupPolicy
{
    use HandlesWorkingGroupAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole(WorkingGroupRole::SUPER_ADMIN->value)
            || $user->memberships()->exists();
    }

    public function view(?User $user, WorkingGroup $workingGroup): bool
    {
        if ($workingGroup->is_public_default) {
            return true;
        }

        if (! $user) {
            return false;
        }

        return $this->userHasRole($user, $workingGroup->getKey(), [
            WorkingGroupRole::ADMIN,
            WorkingGroupRole::MANAGER,
            WorkingGroupRole::DESIGNER,
            WorkingGroupRole::MARKETING,
            WorkingGroupRole::MEMBER,
        ]);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(WorkingGroupRole::SUPER_ADMIN->value);
    }

    public function update(User $user, WorkingGroup $workingGroup): bool
    {
        return $this->userHasRole($user, $workingGroup->getKey(), [
            WorkingGroupRole::ADMIN,
        ]);
    }

    public function delete(User $user, WorkingGroup $workingGroup): bool
    {
        return $user->hasRole(WorkingGroupRole::SUPER_ADMIN->value)
            && ! $workingGroup->is_public_default;
    }

    public function manageMembers(User $user, WorkingGroup $workingGroup): bool
    {
        return $this->userHasRole($user, $workingGroup->getKey(), [
            WorkingGroupRole::ADMIN,
        ]);
    }
}
