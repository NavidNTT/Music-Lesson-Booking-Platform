<?php

namespace Tests\Feature\Teacher;

use App\Domain\Teacher\Models\TeacherProfile;
use App\Domain\Teacher\Models\TeacherTimeSlot;
use App\Domain\User\Models\User;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherTimeSlotTest extends TestCase
{
    use RefreshDatabase;

    public function test_updating_slot_without_duration_preserves_existing_duration(): void
    {
        $teacher = User::factory()->create(['role' => UserRole::Teacher]);
        $profile = TeacherProfile::factory()->create(['user_id' => $teacher->id]);

        $startsAt = now()->addDays(2)->setTime(10, 0)->startOfMinute();

        $slot = TeacherTimeSlot::factory()->create([
            'teacher_profile_id' => $profile->id,
            'starts_at' => $startsAt,
            'ends_at' => $startsAt->copy()->addMinutes(90),
        ]);

        // Update only capacity; duration (90 min) must be preserved.
        $response = $this->actingAs($teacher, 'sanctum')
            ->patchJson("/api/v1/teacher/slots/{$slot->id}", [
                'capacity' => 3,
            ]);

        $response->assertOk();

        $slot->refresh();
        $this->assertSame(3, $slot->capacity);
        $this->assertEquals(90, $slot->starts_at->diffInMinutes($slot->ends_at));
    }

    public function test_updating_slot_with_duration_changes_duration(): void
    {
        $teacher = User::factory()->create(['role' => UserRole::Teacher]);
        $profile = TeacherProfile::factory()->create(['user_id' => $teacher->id]);

        $startsAt = now()->addDays(2)->setTime(10, 0)->startOfMinute();

        $slot = TeacherTimeSlot::factory()->create([
            'teacher_profile_id' => $profile->id,
            'starts_at' => $startsAt,
            'ends_at' => $startsAt->copy()->addMinutes(60),
        ]);

        $this->actingAs($teacher, 'sanctum')
            ->patchJson("/api/v1/teacher/slots/{$slot->id}", [
                'duration_minutes' => 120,
            ])
            ->assertOk();

        $slot->refresh();
        $this->assertEquals(120, $slot->starts_at->diffInMinutes($slot->ends_at));
    }

    public function test_overlapping_slot_is_rejected(): void
    {
        $teacher = User::factory()->create(['role' => UserRole::Teacher]);
        $profile = TeacherProfile::factory()->create(['user_id' => $teacher->id]);

        $startsAt = now()->addDays(2)->setTime(10, 0)->startOfMinute();

        TeacherTimeSlot::factory()->create([
            'teacher_profile_id' => $profile->id,
            'starts_at' => $startsAt,
            'ends_at' => $startsAt->copy()->addHour(),
        ]);

        $this->actingAs($teacher, 'sanctum')
            ->postJson('/api/v1/teacher/slots', [
                'starts_at' => $startsAt->copy()->addMinutes(30)->toDateTimeString(),
                'duration_minutes' => 60,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['starts_at']);
    }
}
