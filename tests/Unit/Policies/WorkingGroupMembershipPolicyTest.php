<?php

namespace Tests\Unit\Policies;

use App\Enums\MembershipStatus;
use App\Enums\WorkingGroupRole;
use App\Enums\WorkingGroupStatus;
use App\Enums\WorkingGroupType;
use App\Models\User;
use App\Models\WorkingGroup;
use App\Models\WorkingGroupMembership;
use App\Policies\WorkingGroupMembershipPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class WorkingGroupMembershipPolicyTest extends TestCase
{
    use RefreshDatabase;

    private WorkingGroupMembershipPolicy $policy;
    private WorkingGroup $workingGroup;
    private User $admin;
    private User $member;

    protected function setUp(): void
    {
        parent::setUp();

        $this->policy = new WorkingGroupMembershipPolicy;

        $this->workingGroup = WorkingGroup::create([
            'name' => 'Test Team',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $this->admin = User::factory()->create();
        $this->member = User::factory()->create();

        $this->createRoles();
        $this->createMemberships();
    }

    private function createRoles(): void
    {
        app(PermissionRegistrar::class)->setPermissionsTeamId($this->workingGroup->id);

        foreach (WorkingGroupRole::cases() as $role) {
            Role::create(['name' => $role->value, 'guard_name' => 'web']);
        }

        app(PermissionRegistrar::class)->setPermissionsTeamId(null);
    }

    private function createMemberships(): void
    {
        WorkingGroupMembership::create([
            'working_group_id' => $this->workingGroup->id,
            'user_id' => $this->admin->id,
            'role' => WorkingGroupRole::ADMIN,
            'status' => MembershipStatus::ACTIVE,
        ]);

        WorkingGroupMembership::create([
            'working_group_id' => $this->workingGroup->id,
            'user_id' => $this->member->id,
            'role' => WorkingGroupRole::MEMBER,
            'status' => MembershipStatus::ACTIVE,
        ]);
    }

    /** @test */
    public function admin_can_view_any_memberships(): void
    {
        $this->assertTrue($this->policy->viewAny($this->admin, $this->workingGroup));
    }

    /** @test */
    public function manager_can_view_any_memberships(): void
    {
        $manager = User::factory()->create();
        WorkingGroupMembership::create([
            'working_group_id' => $this->workingGroup->id,
            'user_id' => $manager->id,
            'role' => WorkingGroupRole::MANAGER,
            'status' => MembershipStatus::ACTIVE,
        ]);

        $this->assertTrue($this->policy->viewAny($manager, $this->workingGroup));
    }

    /** @test */
    public function member_cannot_view_any_memberships(): void
    {
        $this->assertFalse($this->policy->viewAny($this->member, $this->workingGroup));
    }

    /** @test */
    public function admin_can_create_membership(): void
    {
        $this->assertTrue($this->policy->create($this->admin, $this->workingGroup));
    }

    /** @test */
    public function member_cannot_create_membership(): void
    {
        $this->assertFalse($this->policy->create($this->member, $this->workingGroup));
    }

    /** @test */
    public function admin_can_update_membership(): void
    {
        $membership = $this->member->memberships()->first();

        $this->assertTrue($this->policy->update($this->admin, $membership));
    }

    /** @test */
    public function member_cannot_update_membership(): void
    {
        $membership = $this->admin->memberships()->first();

        $this->assertFalse($this->policy->update($this->member, $membership));
    }

    /** @test */
    public function admin_can_delete_member_membership(): void
    {
        $membership = $this->member->memberships()->first();

        $this->assertTrue($this->policy->delete($this->admin, $membership));
    }

    /** @test */
    public function admin_cannot_delete_admin_membership(): void
    {
        $membership = $this->admin->memberships()->first();

        $this->assertFalse($this->policy->delete($this->admin, $membership));
    }

    /** @test */
    public function member_cannot_delete_membership(): void
    {
        $membership = $this->member->memberships()->first();

        $this->assertFalse($this->policy->delete($this->member, $membership));
    }
}
