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
Schema::create('teacher_profiles', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')
        ->constrained()
        ->cascadeOnDelete()
        ->unique();

    $table->text('bio')->nullable();
    $table->unsignedInteger('price_per_session');
    $table->boolean('is_active')->default(true)->index();

    $table->decimal('rating_avg', 3, 2)->default(0);
    $table->unsignedInteger('rating_count')->default(0);

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_profiles');
    }
};
