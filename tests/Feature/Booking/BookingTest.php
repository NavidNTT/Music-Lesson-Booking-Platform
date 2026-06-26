<?php

namespace Tests\Feature\Booking;

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\TeacherTimeSlot;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_create_booking(): void
    {
        $student = User::factory()->create([
            'role' => UserRole::Student,
        ]);

        $teacher = User::factory()->create([
            'role' => UserRole::Teacher,
        ]);

        $studentProfile = StudentProfile::factory()->create([
            'user_id' => $student->id,
        ]);

        $teacherProfile = TeacherProfile::factory()->create([
            'user_id' => $teacher->id,
            'price_per_session' => 500000,
        ]);

        TeacherTimeSlot::factory()->create([
            'teacher_profile_id' => $teacherProfile->id,
            'starts_at' => now()->addDay()->setHour(10)->setMinute(0),
            'ends_at' => now()->addDay()->setHour(11)->setMinute(0),
            'is_active' => true,
        ]);

        Wallet::factory()->create([
            'student_profile_id' => $studentProfile->id,
            'balance' => 1000000,
        ]);

        $response = $this->actingAs($student, 'sanctum')
            ->postJson('/api/v1/bookings', [
                'teacher_profile_id' => $teacherProfile->id,
                'starts_at' => now()->addDay()->setHour(10)->setMinute(0)->toDateTimeString(),
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('bookings', [
            'teacher_profile_id' => $teacherProfile->id,
            'student_profile_id' => $studentProfile->id,
            'status' => 'pending',
        ]);
    }

    public function test_booking_conflict_is_rejected(): void
    {
        $student = User::factory()->create([
            'role' => UserRole::Student,
        ]);

        $teacher = User::factory()->create([
            'role' => UserRole::Teacher,
        ]);

        $studentProfile = StudentProfile::factory()->create([
            'user_id' => $student->id,
        ]);

        $teacherProfile = TeacherProfile::factory()->create([
            'user_id' => $teacher->id,
        ]);

        $start = now()->addDay()->setHour(10)->setMinute(0);
        $end = (clone $start)->addHour();

        TeacherTimeSlot::factory()->create([
            'teacher_profile_id' => $teacherProfile->id,
            'starts_at' => $start,
            'ends_at' => $end,
            'is_active' => true,
        ]);

        Booking::factory()->create([
            'teacher_profile_id' => $teacherProfile->id,
            'student_profile_id' => $studentProfile->id,
            'starts_at' => $start,
            'ends_at' => $end,
            'status' => 'confirmed',
        ]);

        Wallet::factory()->create([
            'student_profile_id' => $studentProfile->id,
            'balance' => 1000000,
        ]);

        $response = $this->actingAs($student, 'sanctum')
            ->postJson('/api/v1/bookings', [
                'teacher_profile_id' => $teacherProfile->id,
                'starts_at' => $start->toDateTimeString(),
            ]);

        $response->assertStatus(422);
    }
    public function test_teacher_can_confirm_pending_booking(): void
{
    $teacherUser = User::factory()->create([
        'role' => UserRole::Teacher,
    ]);

    $studentUser = User::factory()->create([
        'role' => UserRole::Student,
    ]);

    $teacherProfile = TeacherProfile::factory()->create([
        'user_id' => $teacherUser->id,
        'price_per_session' => 400000,
    ]);

    $studentProfile = StudentProfile::factory()->create([
        'user_id' => $studentUser->id,
    ]);

    Wallet::factory()->create([
        'student_profile_id' => $studentProfile->id,
        'balance' => 900000,
    ]);

    $booking = Booking::factory()->create([
        'teacher_profile_id' => $teacherProfile->id,
        'student_profile_id' => $studentProfile->id,
        'status' => 'pending',
        'amount' => 400000,
    ]);

    $response = $this->actingAs($teacherUser, 'sanctum')
        ->postJson("/api/v1/teacher/bookings/{$booking->id}/confirm");

    $response->assertOk();

    $this->assertDatabaseHas('bookings', [
        'id' => $booking->id,
        'status' => 'confirmed',
    ]);

    $this->assertDatabaseHas('wallets', [
        'student_profile_id' => $studentProfile->id,
        'balance' => 500000,
    ]);
}

}
