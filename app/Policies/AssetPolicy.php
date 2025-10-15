<?php

namespace App\Policies;

use App\Enums\MembershipStatus;
use App\Enums\WorkingGroupRole;
use App\Models\Asset;
use App\Models\User;
use App\Policies\Concerns\HandlesWorkingGroupAuthorization;
use App\Support\WorkingGroupContext;

class AssetPolicy
{
    use HandlesWorkingGroupAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole(WorkingGroupRole::SUPER_ADMIN->value)
            || $user->memberships()->where('status', MembershipStatus::ACTIVE->value)->exists();
    }

    public function view(User $user, Asset $asset): bool
    {
        return $this->userHasRole($user, $asset->group_id, [
            WorkingGroupRole::ADMIN,
            WorkingGroupRole::MANAGER,
            WorkingGroupRole::DESIGNER,
            WorkingGroupRole::MARKETING,
            WorkingGroupRole::MEMBER,
        ]);
    }

    public function create(User $user): bool
    {
        $context = app(WorkingGroupContext::class)->current();

        if (! $context) {
            return false;
        }

        return $this->userHasRole($user, $context->getKey(), [
            WorkingGroupRole::ADMIN,
            WorkingGroupRole::MANAGER,
            WorkingGroupRole::DESIGNER,
            WorkingGroupRole::MEMBER,
        ]);
    }

    public function update(User $user, Asset $asset): bool
    {
        return $this->userHasRole($user, $asset->group_id, [
            WorkingGroupRole::ADMIN,
            WorkingGroupRole::MANAGER,
            WorkingGroupRole::DESIGNER,
        ]);
    }

    public function delete(User $user, Asset $asset): bool
    {
        return $this->userHasRole($user, $asset->group_id, [
            WorkingGroupRole::ADMIN,
            WorkingGroupRole::MANAGER,
        ]);
    }
}
