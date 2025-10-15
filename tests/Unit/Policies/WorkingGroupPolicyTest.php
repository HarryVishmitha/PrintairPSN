<?php

namespace Tests\Unit\Policies;

use App\Enums\MembershipStatus;
use App\Enums\WorkingGroupRole;
use App\Enums\WorkingGroupStatus;
use App\Enums\WorkingGroupType;
use App\Models\User;
use App\Models\WorkingGroup;
use App\Models\WorkingGroupMembership;
use App\Policies\WorkingGroupPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class WorkingGroupPolicyTest extends TestCase
{
    use RefreshDatabase;

    private WorkingGroupPolicy $policy;
    private WorkingGroup $publicGroup;
    private WorkingGroup $privateGroup;

    protected function setUp(): void
    {
        parent::setUp();

        $this->policy = new WorkingGroupPolicy;

        // Create public default working group
        $this->publicGroup = WorkingGroup::create([
            'name' => 'Public',
            'type' => WorkingGroupType::PUBLIC,
            'status' => WorkingGroupStatus::ACTIVE,
            'is_public_default' => true,
        ]);

        // Create private working group
        $this->privateGroup = WorkingGroup::create([
            'name' => 'Private Team',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
            'is_public_default' => false,
        ]);

        $this->createRoles();
    }

    private function createRoles(): void
    {
        app(PermissionRegistrar::class)->setPermissionsTeamId($this->publicGroup->id);

        foreach (WorkingGroupRole::cases() as $role) {
            Role::create(['name' => $role->value, 'guard_name' => 'web']);
        }

        app(PermissionRegistrar::class)->setPermissionsTeamId(null);
    }

    /** @test */
    public function super_admin_can_view_any_working_groups(): void
    {
        $user = User::factory()->create();
        app(PermissionRegistrar::class)->setPermissionsTeamId($this->publicGroup->id);
        $user->assignRole(WorkingGroupRole::SUPER_ADMIN->value);

        $this->assertTrue($this->policy->viewAny($user));
    }

    /** @test */
    public function user_with_memberships_can_view_any(): void
    {
        $user = User::factory()->create();
        WorkingGroupMembership::create([
            'working_group_id' => $this->publicGroup->id,
            'user_id' => $user->id,
            'role' => WorkingGroupRole::MEMBER,
            'status' => MembershipStatus::ACTIVE,
        ]);

        $this->assertTrue($this->policy->viewAny($user));
    }

    /** @test */
    public function guest_can_view_public_default_group(): void
    {
        $this->assertTrue($this->policy->view(null, $this->publicGroup));
    }

    /** @test */
    public function guest_cannot_view_private_group(): void
    {
        $this->assertFalse($this->policy->view(null, $this->privateGroup));
    }

    /** @test */
    public function member_can_view_their_working_group(): void
    {
        $user = User::factory()->create();
        WorkingGroupMembership::create([
            'working_group_id' => $this->privateGroup->id,
            'user_id' => $user->id,
            'role' => WorkingGroupRole::MEMBER,
            'status' => MembershipStatus::ACTIVE,
        ]);

        $this->assertTrue($this->policy->view($user, $this->privateGroup));
    }

    /** @test */
    public function non_member_cannot_view_private_group(): void
    {
        $user = User::factory()->create();

        $this->assertFalse($this->policy->view($user, $this->privateGroup));
    }

    /** @test */
    public function super_admin_can_create_working_groups(): void
    {
        $user = User::factory()->create();
        app(PermissionRegistrar::class)->setPermissionsTeamId($this->publicGroup->id);
        $user->assignRole(WorkingGroupRole::SUPER_ADMIN->value);

        $this->assertTrue($this->policy->create($user));
    }

    /** @test */
    public function regular_user_cannot_create_working_groups(): void
    {
        $user = User::factory()->create();

        $this->assertFalse($this->policy->create($user));
    }

    /** @test */
    public function admin_can_update_their_working_group(): void
    {
        $user = User::factory()->create();
        WorkingGroupMembership::create([
            'working_group_id' => $this->privateGroup->id,
            'user_id' => $user->id,
            'role' => WorkingGroupRole::ADMIN,
            'status' => MembershipStatus::ACTIVE,
        ]);

        $this->assertTrue($this->policy->update($user, $this->privateGroup));
    }

    /** @test */
    public function member_cannot_update_working_group(): void
    {
        $user = User::factory()->create();
        WorkingGroupMembership::create([
            'working_group_id' => $this->privateGroup->id,
            'user_id' => $user->id,
            'role' => WorkingGroupRole::MEMBER,
            'status' => MembershipStatus::ACTIVE,
        ]);

        $this->assertFalse($this->policy->update($user, $this->privateGroup));
    }

    /** @test */
    public function super_admin_can_delete_non_public_working_group(): void
    {
        $user = User::factory()->create();
        app(PermissionRegistrar::class)->setPermissionsTeamId($this->publicGroup->id);
        $user->assignRole(WorkingGroupRole::SUPER_ADMIN->value);

        $this->assertTrue($this->policy->delete($user, $this->privateGroup));
    }

    /** @test */
    public function super_admin_cannot_delete_public_default_group(): void
    {
        $user = User::factory()->create();
        app(PermissionRegistrar::class)->setPermissionsTeamId($this->publicGroup->id);
        $user->assignRole(WorkingGroupRole::SUPER_ADMIN->value);

        $this->assertFalse($this->policy->delete($user, $this->publicGroup));
    }

    /** @test */
    public function admin_can_manage_members(): void
    {
        $user = User::factory()->create();
        WorkingGroupMembership::create([
            'working_group_id' => $this->privateGroup->id,
            'user_id' => $user->id,
            'role' => WorkingGroupRole::ADMIN,
            'status' => MembershipStatus::ACTIVE,
        ]);

        $this->assertTrue($this->policy->manageMembers($user, $this->privateGroup));
    }

    /** @test */
    public function manager_cannot_manage_members(): void
    {
        $user = User::factory()->create();
        WorkingGroupMembership::create([
            'working_group_id' => $this->privateGroup->id,
            'user_id' => $user->id,
            'role' => WorkingGroupRole::MANAGER,
            'status' => MembershipStatus::ACTIVE,
        ]);

        $this->assertFalse($this->policy->manageMembers($user, $this->privateGroup));
    }
}
