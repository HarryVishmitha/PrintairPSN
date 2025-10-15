<?php

namespace App\Policies\Concerns;

use App\Enums\MembershipStatus;
use App\Enums\WorkingGroupRole;
use App\Models\User;
use App\Models\WorkingGroupMembership;

trait HandlesWorkingGroupAuthorization
{
    protected function membership(User $user, int|string $workingGroupId): ?WorkingGroupMembership
    {
        return $user->memberships()
            ->where('working_group_id', $workingGroupId)
            ->where('status', MembershipStatus::ACTIVE)
            ->first();
    }

    /**
     * @param  array<int, WorkingGroupRole>  $roles
     */
    protected function userHasRole(User $user, int|string $workingGroupId, array $roles): bool
    {
        if ($user->hasRole(WorkingGroupRole::SUPER_ADMIN->value)) {
            return true;
        }

        $membership = $this->membership($user, $workingGroupId);

        if (! $membership) {
            return false;
        }

        return in_array($membership->role, $roles, true);
    }
}
