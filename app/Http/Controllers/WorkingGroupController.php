<?php

namespace App\Http\Controllers;

use App\Enums\MembershipStatus;
use App\Enums\WorkingGroupRole;
use App\Http\Middleware\SetCurrentWorkingGroup;
use App\Models\WorkingGroup;
use App\Support\WorkingGroupContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Working Group Controller
 *
 * Handles switching between working groups and related operations.
 */
class WorkingGroupController extends Controller
{
    public function __construct(private readonly WorkingGroupContext $context)
    {
    }

    /**
     * Switch to a different working group
     *
     * Validates that the user has access to the requested working group
     * and updates the session to use it. Logs the switch activity.
     *
     * @param  Request  $request
     * @param  WorkingGroup  $workingGroup
     * @return RedirectResponse
     */
    public function switch(Request $request, WorkingGroup $workingGroup): RedirectResponse
    {
        $user = Auth::user();

        if (! $user) {
            return redirect()->back()->with('error', 'You must be logged in to switch working groups.');
        }

        // Check if user has access to this working group
        if (! $this->canAccessWorkingGroup($user, $workingGroup)) {
            return redirect()->back()->with('error', 'You do not have access to this working group.');
        }

        // Store previous working group for logging
        $previousGroup = $this->context->current();

        // Update session
        $request->session()->put(SetCurrentWorkingGroup::SESSION_KEY, $workingGroup->getKey());

        // Update context
        $this->context->set($workingGroup);

        // Log the switch
        activity()
            ->causedBy($user)
            ->performedOn($workingGroup)
            ->withProperties([
                'previous_working_group_id' => $previousGroup?->getKey(),
                'previous_working_group_name' => $previousGroup?->name,
                'new_working_group_id' => $workingGroup->getKey(),
                'new_working_group_name' => $workingGroup->name,
            ])
            ->log('working_group_switched');

        return redirect()->back()->with('success', "Switched to {$workingGroup->name}");
    }

    /**
     * Check if a user can access a working group
     *
     * @param  \App\Models\User  $user
     * @param  WorkingGroup  $workingGroup
     * @return bool
     */
    private function canAccessWorkingGroup($user, WorkingGroup $workingGroup): bool
    {
        // Public default groups are accessible to everyone
        if ($workingGroup->is_public_default) {
            return true;
        }

        // Super admins can access all working groups
        if ($user->hasRole(WorkingGroupRole::SUPER_ADMIN->value)) {
            return true;
        }

        // Check if user has an active membership
        return $user->memberships()
            ->where('working_group_id', $workingGroup->getKey())
            ->where('status', MembershipStatus::ACTIVE)
            ->exists();
    }

    /**
     * Set a working group as the user's default
     *
     * @param  Request  $request
     * @param  WorkingGroup  $workingGroup
     * @return RedirectResponse
     */
    public function setDefault(Request $request, WorkingGroup $workingGroup): RedirectResponse
    {
        $user = Auth::user();

        if (! $user) {
            return redirect()->back()->with('error', 'You must be logged in.');
        }

        // Check if user has access
        if (! $this->canAccessWorkingGroup($user, $workingGroup)) {
            return redirect()->back()->with('error', 'You do not have access to this working group.');
        }

        // Remove default flag from all memberships
        $user->memberships()->update(['is_default' => false]);

        // Set new default
        $membership = $user->memberships()
            ->where('working_group_id', $workingGroup->getKey())
            ->first();

        if ($membership) {
            $membership->update(['is_default' => true]);
        }

        // Update user's default working group
        $user->update(['default_working_group_id' => $workingGroup->getKey()]);

        // Log the change
        activity()
            ->causedBy($user)
            ->performedOn($workingGroup)
            ->withProperties([
                'working_group_name' => $workingGroup->name,
            ])
            ->log('working_group_default_changed');

        return redirect()->back()->with('success', "{$workingGroup->name} set as default working group.");
    }
}
