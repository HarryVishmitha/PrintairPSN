<?php

namespace Tests\Feature;

use App\Enums\MembershipStatus;
use App\Enums\WorkingGroupRole;
use App\Enums\WorkingGroupStatus;
use App\Enums\WorkingGroupType;
use App\Http\Middleware\SetCurrentWorkingGroup;
use App\Models\User;
use App\Models\WorkingGroup;
use App\Models\WorkingGroupMembership;
use App\Support\WorkingGroupContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Laravel\Pennant\Feature;
use Tests\TestCase;

class WorkingGroupMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Feature::purge();
        parent::tearDown();
    }

    public function test_middleware_defaults_to_public_group_when_feature_disabled(): void
    {
        $publicGroup = WorkingGroup::factory()->public()->create([
            'is_public_default' => true,
        ]);

        Feature::deactivate(SetCurrentWorkingGroup::FEATURE_KEY);

        $request = Request::create('/');
        $request->setLaravelSession(app('session')->driver());
        $request->session()->start();

        $middleware = app(SetCurrentWorkingGroup::class);
        $middleware->handle($request, fn () => response('ok'));

        $this->assertSame($publicGroup->getKey(), app(WorkingGroupContext::class)->currentId());
    }

    public function test_middleware_uses_user_membership_when_feature_enabled(): void
    {
        $this->assertSame('database', config('pennant.default'));
        Feature::activate(SetCurrentWorkingGroup::FEATURE_KEY);
        $this->assertDatabaseHas('features', [
            'name' => SetCurrentWorkingGroup::FEATURE_KEY,
        ]);

        $publicGroup = WorkingGroup::factory()->public()->create([
            'is_public_default' => true,
        ]);

        $team = WorkingGroup::factory()->create([
            'type' => WorkingGroupType::COMPANY,
            'status' => WorkingGroupStatus::ACTIVE,
        ]);

        $user = User::factory()->create();

        WorkingGroupMembership::query()->create([
            'working_group_id' => $team->getKey(),
            'user_id' => $user->getKey(),
            'role' => WorkingGroupRole::MANAGER,
            'status' => MembershipStatus::ACTIVE,
            'is_default' => true,
            'joined_at' => now(),
        ]);

        WorkingGroupMembership::query()->create([
            'working_group_id' => $publicGroup->getKey(),
            'user_id' => $user->getKey(),
            'role' => WorkingGroupRole::MEMBER,
            'status' => MembershipStatus::ACTIVE,
            'is_default' => false,
            'joined_at' => now(),
        ]);

        $this->assertTrue(Feature::active(SetCurrentWorkingGroup::FEATURE_KEY));

        $request = Request::create('/');
        $request->setUserResolver(fn () => $user);
        $request->setLaravelSession(app('session')->driver());
        $request->session()->start();

        $middleware = app(SetCurrentWorkingGroup::class);
        $middleware->handle($request, fn () => response('ok'));

        $this->assertSame($team->getKey(), app(WorkingGroupContext::class)->currentId());
        $this->assertSame($team->getKey(), $request->session()->get(SetCurrentWorkingGroup::SESSION_KEY));
    }
}
