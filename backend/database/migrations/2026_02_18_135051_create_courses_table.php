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
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('instructor')->nullable();
            $table->decimal('original_price', 12, 0)->default(0);
            $table->decimal('discounted_price', 12, 0)->default(0);
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->string('image_url')->nullable();
            $table->string('download_file_path')->nullable(); 
            $table->string('download_file_name')->nullable();
            $table->boolean('is_published')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
