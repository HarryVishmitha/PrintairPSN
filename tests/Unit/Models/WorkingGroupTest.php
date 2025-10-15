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

class WorkingGroupTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_has_memberships_relationship(): void
    {
        $workingGroup = WorkingGroup::create([
            'name' => 'Test Group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $user = User::factory()->create();

        WorkingGroupMembership::create([
            'working_group_id' => $workingGroup->id,
            'user_id' => $user->id,
            'role' => WorkingGroupRole::MEMBER,
            'status' => MembershipStatus::ACTIVE,
        ]);

        $this->assertCount(1, $workingGroup->memberships);
        $this->assertInstanceOf(WorkingGroupMembership::class, $workingGroup->memberships->first());
    }

    /** @test */
    public function it_has_members_relationship(): void
    {
        $workingGroup = WorkingGroup::create([
            'name' => 'Test Group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $user = User::factory()->create();

        WorkingGroupMembership::create([
            'working_group_id' => $workingGroup->id,
            'user_id' => $user->id,
            'role' => WorkingGroupRole::MEMBER,
            'status' => MembershipStatus::ACTIVE,
        ]);

        $this->assertCount(1, $workingGroup->members);
        $this->assertInstanceOf(User::class, $workingGroup->members->first());
    }

    /** @test */
    public function it_generates_uuid_on_creation(): void
    {
        $workingGroup = WorkingGroup::create([
            'name' => 'Test Group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $this->assertNotNull($workingGroup->uuid);
        $this->assertTrue(\Illuminate\Support\Str::isUuid($workingGroup->uuid));
    }

    /** @test */
    public function it_generates_slug_from_name(): void
    {
        $workingGroup = WorkingGroup::create([
            'name' => 'Test Group Name',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $this->assertEquals('test-group-name', $workingGroup->slug);
    }

    /** @test */
    public function it_generates_unique_slug_when_collision_occurs(): void
    {
        WorkingGroup::create([
            'name' => 'Test Group',
            'slug' => 'test-group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $workingGroup2 = WorkingGroup::create([
            'name' => 'Test Group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $this->assertEquals('test-group-1', $workingGroup2->slug);
    }

    /** @test */
    public function it_can_scope_active_groups(): void
    {
        WorkingGroup::create([
            'name' => 'Active Group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        WorkingGroup::create([
            'name' => 'Inactive Group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::INACTIVE,
        ]);

        $activeGroups = WorkingGroup::active()->get();

        $this->assertCount(1, $activeGroups);
        $this->assertEquals('Active Group', $activeGroups->first()->name);
    }

    /** @test */
    public function it_can_scope_by_type(): void
    {
        WorkingGroup::create([
            'name' => 'Public Group',
            'type' => WorkingGroupType::PUBLIC,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        WorkingGroup::create([
            'name' => 'Private Group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $publicGroups = WorkingGroup::type(WorkingGroupType::PUBLIC)->get();

        $this->assertCount(1, $publicGroups);
        $this->assertEquals('Public Group', $publicGroups->first()->name);
    }

    /** @test */
    public function it_can_find_public_default_group(): void
    {
        WorkingGroup::create([
            'name' => 'Regular Group',
            'type' => WorkingGroupType::PUBLIC,
            'status' => WorkingGroupStatus::ACTIVE,
            'is_public_default' => false,
        ]);

        $publicGroup = WorkingGroup::create([
            'name' => 'Public Default',
            'type' => WorkingGroupType::PUBLIC,
            'status' => WorkingGroupStatus::ACTIVE,
            'is_public_default' => true,
        ]);

        $foundGroup = WorkingGroup::publicDefault();

        $this->assertNotNull($foundGroup);
        $this->assertEquals($publicGroup->id, $foundGroup->id);
    }

    /** @test */
    public function it_casts_type_to_enum(): void
    {
        $workingGroup = WorkingGroup::create([
            'name' => 'Test Group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $this->assertInstanceOf(WorkingGroupType::class, $workingGroup->type);
        $this->assertEquals(WorkingGroupType::PRIVATE, $workingGroup->type);
    }

    /** @test */
    public function it_casts_status_to_enum(): void
    {
        $workingGroup = WorkingGroup::create([
            'name' => 'Test Group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $this->assertInstanceOf(WorkingGroupStatus::class, $workingGroup->status);
        $this->assertEquals(WorkingGroupStatus::ACTIVE, $workingGroup->status);
    }

    /** @test */
    public function it_casts_settings_to_array(): void
    {
        $settings = ['key' => 'value', 'nested' => ['data' => 'test']];

        $workingGroup = WorkingGroup::create([
            'name' => 'Test Group',
            'type' => WorkingGroupType::PRIVATE,
            'status' => WorkingGroupStatus::ACTIVE,
            'settings' => $settings,
        ]);

        $this->assertIsArray($workingGroup->settings);
        $this->assertEquals($settings, $workingGroup->settings);
    }
}
