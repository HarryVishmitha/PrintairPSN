<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update existing users by splitting their name into first_name and last_name
        $users = User::whereNull('first_name')->orWhereNull('last_name')->get();

        foreach ($users as $user) {
            $nameParts = explode(' ', trim($user->name), 2);
            
            $user->first_name = $nameParts[0] ?? '';
            $user->last_name = $nameParts[1] ?? $nameParts[0];
            $user->save();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse this data migration
    }
};
