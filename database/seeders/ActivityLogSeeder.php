<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\User;
use App\Models\Order;
use App\Models\WorkingGroup;
use Illuminate\Database\Seeder;

class ActivityLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::take(3)->get();
        $orders = Order::take(5)->get();
        $workingGroups = WorkingGroup::take(2)->get();

        if ($users->isEmpty()) {
            $this->command->warn('No users found. Skipping activity log seeding.');
            return;
        }

        // Sample activities
        $activities = [
            // User activities
            [
                'log_name' => 'wg-audit',
                'description' => 'User logged in',
                'subject_type' => null,
                'subject_id' => null,
                'causer_type' => User::class,
                'causer_id' => $users->first()?->id,
                'properties' => json_encode([
                    'ip' => '192.168.1.1',
                    'user_agent' => 'Mozilla/5.0',
                ]),
                'created_at' => now()->subDays(5),
            ],
            [
                'log_name' => 'wg-audit',
                'description' => 'User updated profile',
                'subject_type' => User::class,
                'subject_id' => $users->first()?->id,
                'causer_type' => User::class,
                'causer_id' => $users->first()?->id,
                'properties' => json_encode([
                    'old' => ['name' => 'Old Name'],
                    'new' => ['name' => 'New Name'],
                ]),
                'created_at' => now()->subDays(4),
            ],
        ];

        // Order activities
        if ($orders->isNotEmpty()) {
            foreach ($orders as $index => $order) {
                $activities[] = [
                    'log_name' => 'wg-audit',
                    'description' => 'Order created',
                    'subject_type' => Order::class,
                    'subject_id' => $order->id,
                    'causer_type' => User::class,
                    'causer_id' => $users->random()?->id,
                    'properties' => json_encode([
                        'total' => $order->total,
                        'status' => $order->status,
                    ]),
                    'created_at' => now()->subDays($index + 1),
                ];

                $activities[] = [
                    'log_name' => 'wg-audit',
                    'description' => 'Order updated',
                    'subject_type' => Order::class,
                    'subject_id' => $order->id,
                    'causer_type' => User::class,
                    'causer_id' => $users->random()?->id,
                    'properties' => json_encode([
                        'old' => ['status' => 'pending'],
                        'new' => ['status' => $order->status],
                        'changes' => ['status'],
                    ]),
                    'created_at' => now()->subDays($index),
                ];
            }
        }

        // Working Group activities
        if ($workingGroups->isNotEmpty()) {
            foreach ($workingGroups as $index => $group) {
                $activities[] = [
                    'log_name' => 'wg-audit',
                    'description' => 'working_group_created',
                    'subject_type' => WorkingGroup::class,
                    'subject_id' => $group->id,
                    'causer_type' => User::class,
                    'causer_id' => $users->first()?->id,
                    'properties' => json_encode([
                        'name' => $group->name,
                        'type' => $group->type->value,
                        'status' => $group->status->value,
                    ]),
                    'created_at' => now()->subDays(10 + $index),
                ];

                $activities[] = [
                    'log_name' => 'wg-audit',
                    'description' => 'working_group_updated',
                    'subject_type' => WorkingGroup::class,
                    'subject_id' => $group->id,
                    'causer_type' => User::class,
                    'causer_id' => $users->random()?->id,
                    'properties' => json_encode([
                        'name' => $group->name,
                        'changes' => ['description'],
                    ]),
                    'created_at' => now()->subDays(9 + $index),
                ];
            }
        }

        // Admin actions
        $activities[] = [
            'log_name' => 'security-audit',
            'description' => 'admin_created_user',
            'subject_type' => User::class,
            'subject_id' => $users->last()?->id,
            'causer_type' => User::class,
            'causer_id' => $users->first()?->id,
            'properties' => json_encode([
                'email' => $users->last()?->email,
                'role' => 'member',
            ]),
            'created_at' => now()->subDays(7),
        ];

        $activities[] = [
            'log_name' => 'security-audit',
            'description' => 'User logged out',
            'subject_type' => null,
            'subject_id' => null,
            'causer_type' => User::class,
            'causer_id' => $users->first()?->id,
            'properties' => json_encode([
                'ip' => '192.168.1.1',
            ]),
            'created_at' => now()->subHours(2),
        ];

        // Recent activities
        $activities[] = [
            'log_name' => 'wg-audit',
            'description' => 'User logged in',
            'subject_type' => null,
            'subject_id' => null,
            'causer_type' => User::class,
            'causer_id' => $users->first()?->id,
            'properties' => json_encode([
                'ip' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            ]),
            'created_at' => now()->subMinutes(30),
        ];

        foreach ($activities as $activity) {
            ActivityLog::create($activity);
        }

        $this->command->info('Activity logs seeded successfully!');
    }
}
