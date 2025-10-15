<?php

namespace Tests\Unit\Models;

use App\Enums\MembershipStatus;
use App\Enums\WorkingGroupRole;
use App\Enums\WorkingGroupStatus;
use App\Enums\WorkingGroupType;
use App\Models\User;
use App\Models\WorkingGroup;
use App\Models\WorkingGroupMembership;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkingGroupMembershipTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_belongs_to_working_group(): void
    {
        $workingGroup = WorkingGroup::create([
            'name' => 'Test Group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $user = User::factory()->create();

        $membership = WorkingGroupMembership::create([
            'working_group_id' => $workingGroup->id,
            'user_id' => $user->id,
            'role' => WorkingGroupRole::MEMBER,
            'status' => MembershipStatus::ACTIVE,
        ]);

        $this->assertInstanceOf(WorkingGroup::class, $membership->workingGroup);
        $this->assertEquals($workingGroup->id, $membership->workingGroup->id);
    }

    /** @test */
    public function it_belongs_to_user(): void
    {
        $workingGroup = WorkingGroup::create([
            'name' => 'Test Group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $user = User::factory()->create();

        $membership = WorkingGroupMembership::create([
            'working_group_id' => $workingGroup->id,
            'user_id' => $user->id,
            'role' => WorkingGroupRole::MEMBER,
            'status' => MembershipStatus::ACTIVE,
        ]);

        $this->assertInstanceOf(User::class, $membership->user);
        $this->assertEquals($user->id, $membership->user->id);
    }

    /** @test */
    public function it_has_inviter_relationship(): void
    {
        $workingGroup = WorkingGroup::create([
            'name' => 'Test Group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $inviter = User::factory()->create();
        $invitee = User::factory()->create();

        $membership = WorkingGroupMembership::create([
            'working_group_id' => $workingGroup->id,
            'user_id' => $invitee->id,
            'role' => WorkingGroupRole::MEMBER,
            'status' => MembershipStatus::INVITED,
            'invited_by' => $inviter->id,
        ]);

        $this->assertInstanceOf(User::class, $membership->inviter);
        $this->assertEquals($inviter->id, $membership->inviter->id);
    }

    /** @test */
    public function it_casts_role_to_enum(): void
    {
        $workingGroup = WorkingGroup::create([
            'name' => 'Test Group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $user = User::factory()->create();

        $membership = WorkingGroupMembership::create([
            'working_group_id' => $workingGroup->id,
            'user_id' => $user->id,
            'role' => WorkingGroupRole::ADMIN,
            'status' => MembershipStatus::ACTIVE,
        ]);

        $this->assertInstanceOf(WorkingGroupRole::class, $membership->role);
        $this->assertEquals(WorkingGroupRole::ADMIN, $membership->role);
    }

    /** @test */
    public function it_casts_status_to_enum(): void
    {
        $workingGroup = WorkingGroup::create([
            'name' => 'Test Group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $user = User::factory()->create();

        $membership = WorkingGroupMembership::create([
            'working_group_id' => $workingGroup->id,
            'user_id' => $user->id,
            'role' => WorkingGroupRole::MEMBER,
            'status' => MembershipStatus::INVITED,
        ]);

        $this->assertInstanceOf(MembershipStatus::class, $membership->status);
        $this->assertEquals(MembershipStatus::INVITED, $membership->status);
    }

    /** @test */
    public function it_casts_joined_at_to_datetime(): void
    {
        $workingGroup = WorkingGroup::create([
            'name' => 'Test Group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $user = User::factory()->create();

        $membership = WorkingGroupMembership::create([
            'working_group_id' => $workingGroup->id,
            'user_id' => $user->id,
            'role' => WorkingGroupRole::MEMBER,
            'status' => MembershipStatus::ACTIVE,
            'joined_at' => now(),
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $membership->joined_at);
    }

    /** @test */
    public function it_casts_is_default_to_bool(): void
    {
        $workingGroup = WorkingGroup::create([
            'name' => 'Test Group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $user = User::factory()->create();

        $membership = WorkingGroupMembership::create([
            'working_group_id' => $workingGroup->id,
            'user_id' => $user->id,
            'role' => WorkingGroupRole::MEMBER,
            'status' => MembershipStatus::ACTIVE,
            'is_default' => true,
        ]);

        $this->assertIsBool($membership->is_default);
        $this->assertTrue($membership->is_default);
    }
}
