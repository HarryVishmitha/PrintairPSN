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
        Schema::create('moderation_queue', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('entity_type', ['category', 'product'])->index();
            $table->uuid('entity_id')->index();
            $table->enum('action', ['create', 'update', 'archive', 'publish', 'unpublish'])->index();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->index();
            $table->unsignedBigInteger('requested_by');
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->text('notes')->nullable(); // Reviewer notes
            $table->json('payload_snapshot')->nullable(); // Snapshot of proposed changes
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('requested_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('reviewed_by')->references('id')->on('users')->onDelete('set null');

            // Composite index for queries
            $table->index(['entity_type', 'entity_id', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('moderation_queue');
    }
};
