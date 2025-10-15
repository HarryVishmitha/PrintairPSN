<?php

namespace App\Http\Middleware;

use App\Enums\MembershipStatus;
use App\Enums\WorkingGroupRole;
use App\Models\User;
use App\Models\WorkingGroup;
use App\Support\WorkingGroupContext;
use Closure;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Laravel\Pennant\Feature;
use PDOException;
use Throwable;
use Spatie\Permission\PermissionRegistrar;

/**
 * Set Current Working Group Middleware
 *
 * This middleware resolves and sets the current working group for each request.
 * It checks the feature flag, session storage, user memberships, and falls back
 * to the public default group if needed.
 *
 * Resolution Priority:
 * 1. Feature flag disabled → Public default group
 * 2. Session storage (user manually switched)
 * 3. User's default working group
 * 4. User's first active membership
 * 5. Public default group
 *
 * The resolved working group is:
 * - Set in the WorkingGroupContext service
 * - Stored in the session
 * - Added to request attributes as 'workingGroup'
 * - Used for Spatie Permission team scoping
 */
class SetCurrentWorkingGroup
{
    /** Feature flag key for enabling/disabling working groups */
    public const FEATURE_KEY = 'working-groups.enabled';
    
    /** Session key for storing the current working group ID */
    public const SESSION_KEY = 'working_group_id';

    public function __construct(private readonly WorkingGroupContext $context)
    {
    }

    /**
     * Handle an incoming request
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        $group = $this->resolveWorkingGroup($request, $user);

        $this->context->set($group);
        $request->attributes->set('workingGroup', $group);

        if ($group && $user) {
            $request->session()->put(self::SESSION_KEY, $group->getKey());
            
            // Set Spatie Permission team context for role checking
            app(PermissionRegistrar::class)->setPermissionsTeamId($group->getKey());
        } else {
            $request->session()->forget(self::SESSION_KEY);
            
            // Clear team context if no group
            app(PermissionRegistrar::class)->setPermissionsTeamId(null);
        }

        return $next($request);
    }

    /**
     * Resolve the working group for the current request
     *
     * @param  Request  $request
     * @param  User|null  $user
     * @return WorkingGroup|null
     */
    private function resolveWorkingGroup(Request $request, ?User $user): ?WorkingGroup
    {
        if (! $this->featureIsEnabled($user)) {
            return WorkingGroup::publicDefault();
        }

        $sessionGroup = $this->resolveFromSession($request, $user);
        if ($sessionGroup) {
            return $sessionGroup;
        }

        if ($user) {
            $default = $user->memberships()
                ->where('is_default', true)
                ->where('status', MembershipStatus::ACTIVE)
                ->with('workingGroup')
                ->first();

            if ($default?->workingGroup) {
                return $default->workingGroup;
            }

            $activeMembership = $user->memberships()
                ->where('status', MembershipStatus::ACTIVE)
                ->with('workingGroup')
                ->first();

            if ($activeMembership?->workingGroup) {
                return $activeMembership->workingGroup;
            }
        }

        return WorkingGroup::publicDefault();
    }

    /**
     * Resolve working group from session storage
     *
     * Validates that the user has access to the session-stored group.
     * Super admins can access any group.
     *
     * @param  Request  $request
     * @param  User|null  $user
     * @return WorkingGroup|null
     */
    private function resolveFromSession(Request $request, ?User $user): ?WorkingGroup
    {
        $groupId = $request->session()->get(self::SESSION_KEY);

        if (! $groupId) {
            return null;
        }

        $group = WorkingGroup::query()->find($groupId);

        if (! $group) {
            return null;
        }

        if (! $user) {
            return $group->is_public_default ? $group : WorkingGroup::publicDefault();
        }

        if ($user->hasRole(WorkingGroupRole::SUPER_ADMIN->value)) {
            return $group;
        }

        $membershipExists = $user->memberships()
            ->where('working_group_id', $group->getKey())
            ->where('status', MembershipStatus::ACTIVE)
            ->exists();

        return $membershipExists ? $group : null;
    }

    /**
     * Check if the working groups feature is enabled
     *
     * Checks both user-scoped and global feature flags.
     * Returns false if database errors occur (safe failure).
     *
     * @param  User|null  $user
     * @return bool
     */
    private function featureIsEnabled(?User $user): bool
    {
        try {
            $scoped = $user ? Feature::for($user)->active(self::FEATURE_KEY) : null;

            if ($scoped === true) {
                return true;
            }

            return Feature::active(self::FEATURE_KEY);
        } catch (QueryException | PDOException | Throwable) {
            return false;
        }
    }
}
