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
Schema::create('teacher_instrument', function (Blueprint $table) {
    $table->id();

    $table->foreignId('teacher_profile_id')
        ->constrained()
        ->cascadeOnDelete();

    $table->foreignId('instrument_id')
        ->constrained()
        ->cascadeOnDelete();

    $table->json('can_teach_levels'); // ["beginner","intermediate"]

    $table->timestamps();

    $table->unique(['teacher_profile_id', 'instrument_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_instrument');
    }
};
