<?php

namespace Tests\Feature\Api\V1;

use App\Domain\Booking\Models\Booking;
use App\Domain\Student\Models\StudentProfile;
use App\Domain\Teacher\Models\TeacherProfile;
use App\Domain\Teacher\Models\TeacherTimeSlot;
use App\Domain\User\Models\User;
use App\Enums\BookingStatus;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_can_access_teacher_only_resource(): void
    {
        $teacher = User::factory()->create(['role' => UserRole::Teacher]);
        TeacherProfile::factory()->create(['user_id' => $teacher->id]);
        Sanctum::actingAs($teacher);

        $this->getJson('/api/v1/teacher/slots')->assertOk();
    }

    public function test_student_can_access_student_only_resource(): void
    {
        $student = User::factory()->create(['role' => UserRole::Student]);
        StudentProfile::factory()->create(['user_id' => $student->id]);
        Sanctum::actingAs($student);

        $this->getJson('/api/v1/student/bookings')->assertOk();
    }

    public function test_student_cannot_access_teacher_only_operations(): void
    {
        $student = User::factory()->create(['role' => UserRole::Student]);
        Sanctum::actingAs($student);

        $this->getJson('/api/v1/teacher/slots')->assertForbidden();
        $this->getJson('/api/v1/teacher/bookings')->assertForbidden();
    }

    public function test_teacher_cannot_access_student_only_operations(): void
    {
        $teacher = User::factory()->create(['role' => UserRole::Teacher]);
        Sanctum::actingAs($teacher);

        $this->getJson('/api/v1/student/bookings')->assertForbidden();
    }

    public function test_non_admin_cannot_access_admin_operations(): void
    {
        $teacher = User::factory()->create(['role' => UserRole::Teacher]);
        Sanctum::actingAs($teacher);

        $this->postJson('/api/v1/admin/instruments', ['name' => 'Flute'])
            ->assertForbidden();
    }

    public function test_teacher_cannot_act_on_another_teachers_booking(): void
    {
        $ownerTeacher = User::factory()->create(['role' => UserRole::Teacher]);
        $ownerProfile = TeacherProfile::factory()->create(['user_id' => $ownerTeacher->id]);

        $otherTeacher = User::factory()->create(['role' => UserRole::Teacher]);
        TeacherProfile::factory()->create(['user_id' => $otherTeacher->id]);

        $student = User::factory()->create(['role' => UserRole::Student]);
        $studentProfile = StudentProfile::factory()->create(['user_id' => $student->id]);

        $slot = TeacherTimeSlot::factory()->create(['teacher_profile_id' => $ownerProfile->id]);

        $booking = Booking::factory()->create([
            'teacher_profile_id' => $ownerProfile->id,
            'student_profile_id' => $studentProfile->id,
            'teacher_time_slot_id' => $slot->id,
            'status' => BookingStatus::Pending,
        ]);

        Sanctum::actingAs($otherTeacher);

        $this->postJson("/api/v1/teacher/bookings/{$booking->id}/confirm")
            ->assertForbidden();
    }

    public function test_guest_cannot_access_protected_resources(): void
    {
        $this->getJson('/api/v1/teacher/slots')->assertUnauthorized();
        $this->getJson('/api/v1/student/bookings')->assertUnauthorized();
        $this->getJson('/api/v1/wallet')->assertUnauthorized();
        $this->postJson('/api/v1/admin/instruments', ['name' => 'X'])->assertUnauthorized();
    }
}
