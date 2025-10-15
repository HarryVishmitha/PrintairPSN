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
        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('parent_id')->nullable()->index();
            $table->text('tree_path')->nullable(); // Materialized path: root/print/large-format
            $table->string('name', 120);
            $table->string('slug', 140)->index();
            $table->longText('description')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft')->index();
            $table->enum('visibility', ['global', 'working_group_scoped'])->default('global')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('show_on_home')->default(false)->index();
            $table->integer('sort_order')->default(0)->index();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('locale', 10)->nullable();
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamp('unpublished_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign keys
            $table->foreign('parent_id')->references('id')->on('categories')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            // Composite indexes for performance
            $table->index(['parent_id', 'sort_order']);
            $table->index(['visibility', 'status']);
            $table->index(['is_featured', 'status']);
            $table->index(['show_on_home', 'status']);
            
            // Unique constraint for slug per locale and working group (handled in app logic)
            $table->unique(['slug', 'locale']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
