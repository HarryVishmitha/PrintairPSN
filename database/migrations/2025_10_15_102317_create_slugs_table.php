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
        Schema::create('slugs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('entity_type', ['category', 'product'])->index();
            $table->uuid('entity_id')->index();
            $table->string('locale', 10)->nullable();
            $table->string('slug', 140);
            $table->uuid('working_group_id')->nullable()->index();
            $table->boolean('is_canonical')->default(false)->index(); // Only one canonical per entity
            $table->timestamps();

            // Foreign keys will be handled polymorphically in app logic
            // $table->foreign('working_group_id')->references('id')->on('working_groups')->onDelete('cascade');

            // Unique constraint for slug per entity_type, locale, and working_group
            $table->unique(['entity_type', 'slug', 'locale', 'working_group_id'], 'unique_slug_entity');
            
            // Composite indexes for fast lookups
            $table->index(['entity_type', 'entity_id', 'is_canonical']);
            $table->index(['slug', 'entity_type', 'working_group_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('slugs');
    }
};
