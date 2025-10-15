<?php

namespace App\Support;

use App\Exceptions\WorkingGroups\WorkingGroupContextNotResolved;
use App\Models\WorkingGroup;
use Spatie\Permission\PermissionRegistrar;

/**
 * Working Group Context Service
 *
 * Manages the current working group context for the application.
 * This service is used to:
 * - Track which working group is currently active
 * - Scope permissions to the current working group
 * - Provide easy access to the current group throughout the application
 *
 * Usage:
 * ```php
 * $context = app(WorkingGroupContext::class);
 * $currentGroup = $context->current();
 * $context->set($workingGroup);
 * ```
 */
class WorkingGroupContext
{
    private ?WorkingGroup $current = null;

    public function __construct(private readonly PermissionRegistrar $permissionRegistrar)
    {
    }

    /**
     * Set the current working group
     *
     * Also updates the Spatie Permission team ID for role scoping.
     *
     * @param  WorkingGroup|null  $group
     * @return void
     */
    public function set(?WorkingGroup $group): void
    {
        $this->current = $group;
        $this->permissionRegistrar->setPermissionsTeamId($group?->getKey());
    }

    /**
     * Get the current working group
     *
     * @return WorkingGroup|null
     */
    public function current(): ?WorkingGroup
    {
        return $this->current;
    }

    /**
     * Get the current working group ID
     *
     * @return int|string|null
     */
    public function currentId(): int|string|null
    {
        return $this->current?->getKey();
    }

    /**
     * Get the current working group or throw an exception
     *
     * @return WorkingGroup
     * @throws WorkingGroupContextNotResolved
     */
    public function ensure(): WorkingGroup
    {
        if (! $this->current instanceof WorkingGroup) {
            throw new WorkingGroupContextNotResolved();
        }

        return $this->current;
    }

    /**
     * Clear the current working group context
     *
     * @return void
     */
    public function clear(): void
    {
        $this->set(null);
    }
}
