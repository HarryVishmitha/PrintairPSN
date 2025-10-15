<?php

namespace Database\Seeders;

use App\Enums\MembershipStatus;
use App\Enums\WorkingGroupRole;
use App\Enums\WorkingGroupStatus;
use App\Enums\WorkingGroupType;
use App\Http\Middleware\SetCurrentWorkingGroup;
use App\Models\User;
use App\Models\WorkingGroup;
use App\Models\WorkingGroupMembership;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Laravel\Pennant\Feature;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            // Create Super Admin user
            $superAdmin = User::query()->firstOrCreate(
                ['email' => 'superadmin@printair.com'],
                [
                    'name' => 'Super Admin',
                    'email' => 'superadmin@printair.com',
                    'password' => bcrypt('super admin'),
                    'email_verified_at' => now(),
                ]
            );

            // Create test user
            if (! User::query()->where('email', 'test@example.com')->exists()) {
                User::factory()->create([
                    'name' => 'Test User',
                    'email' => 'test@example.com',
                    'email_verified_at' => now(),
                ]);
            }

            $publicGroup = WorkingGroup::query()->firstOrCreate(
                ['is_public_default' => true],
                [
                    'name' => 'Public',
                    'type' => WorkingGroupType::PUBLIC,
                    'status' => WorkingGroupStatus::ACTIVE,
                    'settings' => [],
                ]
            );

            // Create roles (global + group-scoped)
            $this->ensureRoles($publicGroup->getKey());

            // Assign default membership & roles for all users
            User::query()->each(function (User $user) use ($publicGroup): void {
                WorkingGroupMembership::query()->updateOrCreate(
                    [
                        'working_group_id' => $publicGroup->getKey(),
                        'user_id' => $user->getKey(),
                    ],
                    [
                        'role' => WorkingGroupRole::MEMBER,
                        'status' => MembershipStatus::ACTIVE,
                        'is_default' => true,
                        'joined_at' => now(),
                    ]
                );

                $user->forceFill([
                    'default_working_group_id' => $publicGroup->getKey(),
                ])->save();

                // Set team context to the Public WG for assignment
                app(PermissionRegistrar::class)->setPermissionsTeamId($publicGroup->getKey());
                $user->assignRole(WorkingGroupRole::MEMBER->value);
            });

            // Assign Super Admin role to the super admin user
            $superAdminUser = User::query()->where('email', 'superadmin@printair.com')->first();
            
            if ($superAdminUser) {
                $superAdminUser->memberships()
                    ->where('working_group_id', $publicGroup->getKey())
                    ->update(['role' => WorkingGroupRole::SUPER_ADMIN]);

                // Assign Super Admin role within the public working group context
                app(PermissionRegistrar::class)->setPermissionsTeamId($publicGroup->getKey());
                $superAdminUser->assignRole(WorkingGroupRole::SUPER_ADMIN->value);
            }

            Feature::deactivate(SetCurrentWorkingGroup::FEATURE_KEY);
        });
    }

    private function ensureRoles(int $publicGroupId): void
    {
        // All roles are scoped to the public working group
        app(PermissionRegistrar::class)->setPermissionsTeamId($publicGroupId);

        collect([
            WorkingGroupRole::SUPER_ADMIN,
            WorkingGroupRole::ADMIN,
            WorkingGroupRole::MANAGER,
            WorkingGroupRole::DESIGNER,
            WorkingGroupRole::MARKETING,
            WorkingGroupRole::MEMBER,
        ])->each(function (WorkingGroupRole $role): void {
            Role::query()->firstOrCreate([
                'name' => $role->value,
                'guard_name' => 'web',
            ]);
        });

        // Clear team context
        app(PermissionRegistrar::class)->setPermissionsTeamId(null);
    }
}
