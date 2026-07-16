<?php

namespace Tests\Feature\Booking;

use App\Domain\Booking\Models\Booking;
use App\Domain\Student\Models\StudentProfile;
use App\Domain\Teacher\Models\TeacherProfile;
use App\Domain\Teacher\Models\TeacherTimeSlot;
use App\Domain\User\Models\User;
use App\Domain\Wallet\Models\Wallet;
use App\Enums\BookingStatus;
use App\Enums\UserRole;
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

        $slot = TeacherTimeSlot::factory()->create([
            'teacher_profile_id' => $teacherProfile->id,
            'starts_at' => now()->addDay()->setHour(10)->setMinute(0),
            'ends_at' => now()->addDay()->setHour(11)->setMinute(0),
            'is_enabled' => true,
        ]);

        Wallet::factory()->create([
            'user_id' => $student->id,
            'balance' => 1000000,
        ]);

        $response = $this->actingAs($student, 'sanctum')
            ->postJson('/api/v1/student/bookings', [
                'teacher_time_slot_id' => $slot->id,
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('bookings', [
            'teacher_profile_id' => $teacherProfile->id,
            'student_profile_id' => $studentProfile->id,
            'teacher_time_slot_id' => $slot->id,
            'status' => BookingStatus::Pending->value,
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

        $slot = TeacherTimeSlot::factory()->create([
            'teacher_profile_id' => $teacherProfile->id,
            'starts_at' => $start,
            'ends_at' => $end,
            'is_enabled' => true,
            'capacity' => 1,
        ]);

        // First booking - uses the slot
        Booking::factory()->create([
            'teacher_profile_id' => $teacherProfile->id,
            'student_profile_id' => $studentProfile->id,
            'teacher_time_slot_id' => $slot->id,
            'status' => BookingStatus::Confirmed,
        ]);

        $slot->increment('booked_count');

        Wallet::factory()->create([
            'user_id' => $student->id,
            'balance' => 1000000,
        ]);

        // Second booking - tries the same slot (should fail, slot is full)
        $response = $this->actingAs($student, 'sanctum')
            ->postJson('/api/v1/student/bookings', [
                'teacher_time_slot_id' => $slot->id,
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

        $slot = TeacherTimeSlot::factory()->create([
            'teacher_profile_id' => $teacherProfile->id,
        ]);

        Wallet::factory()->create([
            'user_id' => $studentUser->id,
            'balance' => 900000,
        ]);

        $booking = Booking::factory()->create([
            'teacher_profile_id' => $teacherProfile->id,
            'student_profile_id' => $studentProfile->id,
            'teacher_time_slot_id' => $slot->id,
            'status' => BookingStatus::Pending,
            'price_amount' => 400000,
        ]);

        $response = $this->actingAs($teacherUser, 'sanctum')
            ->postJson("/api/v1/teacher/bookings/{$booking->id}/confirm");

        $response->assertOk();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => BookingStatus::Confirmed->value,
        ]);

        $this->assertDatabaseHas('wallets', [
            'user_id' => $studentUser->id,
            'balance' => 500000,
        ]);
    }
}
