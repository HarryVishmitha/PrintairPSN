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
        Schema::create('category_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('category_id')->index();
            $table->enum('type', ['primary', 'gallery'])->default('primary');
            $table->string('disk', 50)->default('public'); // storage disk: public, s3, etc.
            $table->string('path_original'); // path to original file
            $table->json('json_variants')->nullable(); // {thumb, sm, md, lg, webp, avif} with paths
            $table->string('alt_text');
            $table->json('focal_point')->nullable(); // {x: 0.5, y: 0.5} normalized coordinates
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            // Foreign keys
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');

            // Indexes
            $table->index(['category_id', 'type', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_media');
    }
};
