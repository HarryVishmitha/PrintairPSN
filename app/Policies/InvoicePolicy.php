<?php

namespace App\Policies;

use App\Enums\MembershipStatus;
use App\Enums\WorkingGroupRole;
use App\Models\Invoice;
use App\Models\User;
use App\Policies\Concerns\HandlesWorkingGroupAuthorization;
use App\Support\WorkingGroupContext;

class InvoicePolicy
{
    use HandlesWorkingGroupAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasRole(WorkingGroupRole::SUPER_ADMIN->value)
            || $user->memberships()->where('status', MembershipStatus::ACTIVE->value)->exists();
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return $this->userHasRole($user, $invoice->group_id, [
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
        ]);
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $this->userHasRole($user, $invoice->group_id, [
            WorkingGroupRole::ADMIN,
        ]);
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        return $this->userHasRole($user, $invoice->group_id, [
            WorkingGroupRole::ADMIN,
        ]);
    }
}
