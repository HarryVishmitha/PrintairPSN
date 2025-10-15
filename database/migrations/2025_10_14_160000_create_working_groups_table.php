<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('working_groups', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('type', 20);
            $table->string('status', 20)->default('active');
            $table->json('settings')->nullable();
            $table->unsignedBigInteger('billing_profile_id')->nullable();
            $table->boolean('is_public_default')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['type', 'status']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('working_groups');
    }
};
