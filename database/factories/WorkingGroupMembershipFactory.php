<?php

namespace Database\Factories;

use App\Enums\MembershipStatus;
use App\Enums\WorkingGroupRole;
use App\Models\User;
use App\Models\WorkingGroup;
use App\Models\WorkingGroupMembership;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\WorkingGroupMembership>
 */
class WorkingGroupMembershipFactory extends Factory
{
    protected $model = WorkingGroupMembership::class;

    public function definition(): array
    {
        return [
            'working_group_id' => WorkingGroup::factory(),
            'user_id' => User::factory(),
            'role' => WorkingGroupRole::MEMBER,
            'status' => MembershipStatus::ACTIVE,
            'is_default' => false,
            'joined_at' => now(),
        ];
    }

    public function default(): self
    {
        return $this->state(fn () => ['is_default' => true]);
    }

    public function role(WorkingGroupRole $role): self
    {
        return $this->state(fn () => ['role' => $role]);
    }
}
