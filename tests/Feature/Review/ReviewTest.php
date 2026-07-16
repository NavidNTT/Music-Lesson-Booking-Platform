<?php

namespace Tests\Feature\Review;

use App\Domain\Booking\Models\Booking;
use App\Domain\Review\Models\Review;
use App\Domain\Student\Models\StudentProfile;
use App\Domain\Teacher\Models\TeacherProfile;
use App\Domain\User\Models\User;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_review_completed_booking(): void
    {
        $studentUser = User::factory()->create([
            'role' => UserRole::Student,
        ]);

        $teacherUser = User::factory()->create([
            'role' => UserRole::Teacher,
        ]);

        $studentProfile = StudentProfile::factory()->create([
            'user_id' => $studentUser->id,
        ]);

        $teacherProfile = TeacherProfile::factory()->create([
            'user_id' => $teacherUser->id,
            'rating_avg' => 0,
            'rating_count' => 0,
        ]);

        $booking = Booking::factory()->create([
            'student_profile_id' => $studentProfile->id,
            'teacher_profile_id' => $teacherProfile->id,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($studentUser, 'sanctum')
            ->postJson('/api/v1/reviews', [
                'booking_id' => $booking->id,
                'rating' => 5,
                'comment' => 'Excellent lesson',
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('reviews', [
            'booking_id' => $booking->id,
            'rating' => 5,
        ]);

        $teacherProfile->refresh();

        $this->assertEquals(5.0, (float) $teacherProfile->rating_avg);
        $this->assertEquals(1, $teacherProfile->rating_count);
    }

    public function test_student_cannot_review_non_completed_booking(): void
    {
        $studentUser = User::factory()->create([
            'role' => UserRole::Student,
        ]);

        $teacherUser = User::factory()->create([
            'role' => UserRole::Teacher,
        ]);

        $studentProfile = StudentProfile::factory()->create([
            'user_id' => $studentUser->id,
        ]);

        $teacherProfile = TeacherProfile::factory()->create([
            'user_id' => $teacherUser->id,
        ]);

        $booking = Booking::factory()->create([
            'student_profile_id' => $studentProfile->id,
            'teacher_profile_id' => $teacherProfile->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($studentUser, 'sanctum')
            ->postJson('/api/v1/reviews', [
                'booking_id' => $booking->id,
                'rating' => 4,
            ]);

        $response->assertStatus(422);
    }

    public function test_student_cannot_review_same_booking_twice(): void
    {
        $studentUser = User::factory()->create([
            'role' => UserRole::Student,
        ]);

        $teacherUser = User::factory()->create([
            'role' => UserRole::Teacher,
        ]);

        $studentProfile = StudentProfile::factory()->create([
            'user_id' => $studentUser->id,
        ]);

        $teacherProfile = TeacherProfile::factory()->create([
            'user_id' => $teacherUser->id,
        ]);

        $booking = Booking::factory()->create([
            'student_profile_id' => $studentProfile->id,
            'teacher_profile_id' => $teacherProfile->id,
            'status' => 'completed',
        ]);

        Review::factory()->create([
            'booking_id' => $booking->id,
            'student_profile_id' => $studentProfile->id,
            'teacher_profile_id' => $teacherProfile->id,
        ]);

        $response = $this->actingAs($studentUser, 'sanctum')
            ->postJson('/api/v1/reviews', [
                'booking_id' => $booking->id,
                'rating' => 5,
            ]);

        $response->assertStatus(422);
    }
}
