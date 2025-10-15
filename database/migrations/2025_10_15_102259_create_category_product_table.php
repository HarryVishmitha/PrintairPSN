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
        Schema::create('category_product', function (Blueprint $table) {
            $table->id();
            $table->uuid('category_id')->index();
            $table->uuid('product_id')->index();
            $table->uuid('working_group_id')->nullable()->index(); // Allows group-specific associations
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Foreign keys (products table assumed to exist or will be created)
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            // $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            // $table->foreign('working_group_id')->references('id')->on('working_groups')->onDelete('cascade');

            // Unique constraint to prevent duplicate associations
            // PostgreSQL: NULLS FIRST; MySQL: treat NULL as distinct
            $table->unique(['product_id', 'category_id', 'working_group_id'], 'unique_category_product_group');
            
            // Composite index for queries
            $table->index(['category_id', 'working_group_id', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_product');
    }
};
