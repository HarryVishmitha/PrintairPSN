<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get a working group to assign users to
        $workingGroup = \App\Models\WorkingGroup::first();
        
        if (!$workingGroup) {
            $this->command->error('No working group found. Please run the main DatabaseSeeder first.');
            return;
        }

        // Create test users with different roles
        $users = [
            [
                'name' => 'Jane Admin',
                'email' => 'jane@example.com',
                'role' => 'admin',
                'is_active' => true,
            ],
            [
                'name' => 'John Manager',
                'email' => 'john@example.com',
                'role' => 'manager',
                'is_active' => true,
            ],
            [
                'name' => 'Alice Designer',
                'email' => 'alice@example.com',
                'role' => 'designer',
                'is_active' => true,
            ],
            [
                'name' => 'Bob Marketing',
                'email' => 'bob@example.com',
                'role' => 'marketing',
                'is_active' => true,
            ],
            [
                'name' => 'Charlie Member',
                'email' => 'charlie@example.com',
                'role' => 'member',
                'is_active' => true,
            ],
            [
                'name' => 'David Inactive',
                'email' => 'david@example.com',
                'role' => 'member',
                'is_active' => false,
            ],
        ];

        foreach ($users as $userData) {
            $user = \App\Models\User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => bcrypt('password'),
                    'is_active' => $userData['is_active'],
                    'email_verified_at' => now(),
                ]
            );

            // Assign role with working group context if not already assigned
            if (!$user->hasRole($userData['role'], $workingGroup)) {
                $user->assignRole($userData['role'], $workingGroup);
            }
        }

        $this->command->info('Test users created successfully!');
    }
}
