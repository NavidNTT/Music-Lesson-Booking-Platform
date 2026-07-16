<?php

namespace Tests\Feature\Teacher;

use App\Domain\Booking\Models\Booking;
use App\Domain\Instrument\Models\Instrument;
use App\Domain\Teacher\Models\TeacherProfile;
use App\Domain\Student\Models\StudentProfile;
use App\Domain\Teacher\Models\TeacherTimeSlot;
use App\Domain\User\Models\User;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
class TeacherProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_can_update_profile(): void
    {
        $teacher = User::factory()->create([
            'role' => UserRole::Teacher,
        ]);

        TeacherProfile::factory()->create([
            'user_id' => $teacher->id,
        ]);

        $response = $this->actingAs($teacher, 'sanctum')
            ->patchJson('/api/v1/teacher/profile', [
                'bio' => 'Experienced piano teacher',
                'price_per_session' => 500000,
                'is_active' => true,
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('teacher_profiles', [
            'user_id' => $teacher->id,
            'bio' => 'Experienced piano teacher',
            'price_per_session' => 500000,
            'is_active' => true,
        ]);
    }

    public function test_teacher_can_sync_instruments(): void
    {
        $teacher = User::factory()->create([
            'role' => UserRole::Teacher,
        ]);

        $profile = TeacherProfile::factory()->create([
            'user_id' => $teacher->id,
        ]);

        $piano = Instrument::factory()->create();
        $guitar = Instrument::factory()->create();

        $response = $this->actingAs($teacher, 'sanctum')
            ->postJson('/api/v1/teacher/profile/instruments', [
                'instruments' => [
                    [
                        'id' => $piano->id,
                        'levels' => ['beginner', 'intermediate'],
                    ],
                    [
                        'id' => $guitar->id,
                        'levels' => ['advanced'],
                    ],
                ],
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('teacher_instrument', [
            'teacher_profile_id' => $profile->id,
            'instrument_id' => $piano->id,
        ]);
    }

    public function test_student_cannot_access_teacher_routes(): void
    {
        $student = User::factory()->create([
            'role' => UserRole::Student,
        ]);

        $response = $this->actingAs($student, 'sanctum')
            ->getJson('/api/v1/teacher/profile');

        $response->assertForbidden();
    }
    public function test_other_teacher_cannot_confirm_booking(): void
{
    $ownerTeacher = User::factory()->create([
        'role' => UserRole::Teacher,
    ]);

    $otherTeacher = User::factory()->create([
        'role' => UserRole::Teacher,
    ]);

    $studentUser = User::factory()->create([
        'role' => UserRole::Student,
    ]);

    $teacherProfile = TeacherProfile::factory()->create([
        'user_id' => $ownerTeacher->id,
        'price_per_session' => 400000,
    ]);

    $studentProfile = StudentProfile::factory()->create([
        'user_id' => $studentUser->id,
    ]);

    $slot = TeacherTimeSlot::factory()->create([
        'teacher_profile_id' => $teacherProfile->id,
    ]);

    $booking = Booking::factory()->create([
        'teacher_profile_id' => $teacherProfile->id,
        'student_profile_id' => $studentProfile->id,
        'teacher_time_slot_id' => $slot->id,
        'status' => 'pending',
        'price_amount' => 400000,
    ]);

    $response = $this->actingAs($otherTeacher, 'sanctum')
        ->postJson("/api/v1/teacher/bookings/{$booking->id}/confirm");

    $response->assertForbidden();
}

}
