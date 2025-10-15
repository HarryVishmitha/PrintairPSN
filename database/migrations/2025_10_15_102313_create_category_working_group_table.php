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
        Schema::create('category_working_group', function (Blueprint $table) {
            $table->id();
            $table->uuid('category_id')->index();
            $table->uuid('working_group_id')->index();
            $table->enum('visibility_override', ['visible', 'hidden', 'inherited'])->default('inherited');
            $table->string('label_override')->nullable(); // Rename category for this group
            $table->integer('sort_order_override')->nullable(); // Override sort order for this group
            $table->timestamps();

            // Foreign keys
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            // $table->foreign('working_group_id')->references('id')->on('working_groups')->onDelete('cascade');

            // Unique constraint
            $table->unique(['category_id', 'working_group_id'], 'unique_category_working_group');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_working_group');
    }
};
