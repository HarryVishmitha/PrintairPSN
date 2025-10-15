<?php

namespace App\Policies;

use App\Enums\MembershipStatus;
use App\Enums\WorkingGroupRole;
use App\Models\Address;
use App\Models\User;
use App\Policies\Concerns\HandlesWorkingGroupAuthorization;
use App\Support\WorkingGroupContext;

class AddressPolicy
{
    use HandlesWorkingGroupAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole(WorkingGroupRole::SUPER_ADMIN->value)
            || $user->memberships()->where('status', MembershipStatus::ACTIVE->value)->exists();
    }

    public function view(User $user, Address $address): bool
    {
        return $this->userHasRole($user, $address->group_id, [
            WorkingGroupRole::ADMIN,
            WorkingGroupRole::MANAGER,
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
            WorkingGroupRole::MEMBER,
        ]);
    }

    public function update(User $user, Address $address): bool
    {
        return $this->userHasRole($user, $address->group_id, [
            WorkingGroupRole::ADMIN,
            WorkingGroupRole::MANAGER,
        ]);
    }

    public function delete(User $user, Address $address): bool
    {
        return $this->userHasRole($user, $address->group_id, [
            WorkingGroupRole::ADMIN,
        ]);
    }
}
