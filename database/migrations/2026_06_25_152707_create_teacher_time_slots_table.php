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
    Schema::create('teacher_time_slots', function (Blueprint $table) {
        $table->id();

        $table->foreignId('teacher_profile_id')
            ->constrained()
            ->cascadeOnDelete();

        $table->dateTime('starts_at')->index();
        $table->dateTime('ends_at')->index();

        $table->unsignedInteger('capacity')->default(1);
        $table->unsignedInteger('booked_count')->default(0);

        $table->boolean('is_enabled')->default(true)->index();

        $table->timestamps();

        $table->unique(['teacher_profile_id', 'starts_at', 'ends_at'], 'teacher_slot_unique');
        $table->index(['teacher_profile_id', 'starts_at', 'ends_at'], 'teacher_slot_time_index');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_time_slots');
    }
};
