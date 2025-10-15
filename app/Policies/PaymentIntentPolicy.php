<?php

namespace App\Policies;

use App\Enums\MembershipStatus;
use App\Enums\WorkingGroupRole;
use App\Models\PaymentIntent;
use App\Models\User;
use App\Policies\Concerns\HandlesWorkingGroupAuthorization;
use App\Support\WorkingGroupContext;

class PaymentIntentPolicy
{
    use HandlesWorkingGroupAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole(WorkingGroupRole::SUPER_ADMIN->value)
            || $user->memberships()->where('status', MembershipStatus::ACTIVE->value)->exists();
    }

    public function view(User $user, PaymentIntent $paymentIntent): bool
    {
        return $this->userHasRole($user, $paymentIntent->group_id, [
            WorkingGroupRole::ADMIN,
            WorkingGroupRole::MANAGER,
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
        ]);
    }

    public function update(User $user, PaymentIntent $paymentIntent): bool
    {
        return $this->userHasRole($user, $paymentIntent->group_id, [
            WorkingGroupRole::ADMIN,
            WorkingGroupRole::MANAGER,
        ]);
    }

    public function delete(User $user, PaymentIntent $paymentIntent): bool
    {
        return $this->userHasRole($user, $paymentIntent->group_id, [
            WorkingGroupRole::ADMIN,
        ]);
    }
}
