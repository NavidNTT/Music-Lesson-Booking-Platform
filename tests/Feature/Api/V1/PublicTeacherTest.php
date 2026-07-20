<?php

namespace Tests\Feature\Api\V1;

use App\Domain\Instrument\Models\Instrument;
use App\Domain\Teacher\Models\TeacherProfile;
use App\Domain\Teacher\Models\TeacherTimeSlot;
use App\Domain\User\Models\User;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicTeacherTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_list_active_teachers(): void
    {
        $activeTeacher = TeacherProfile::factory()->create(['is_active' => true]);
        TeacherProfile::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/v1/teachers');

        $response->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $activeTeacher->id)
            ->assertJsonStructure([
                'data' => [
                    'data' => [['id', 'bio', 'price_per_session', 'rating_avg', 'rating_count', 'user', 'instruments']],
                    'current_page',
                    'last_page',
                    'total',
                ],
            ]);
    }

    public function test_teachers_can_be_filtered_by_instrument_slug(): void
    {
        $piano = Instrument::factory()->create(['name' => 'Piano', 'slug' => 'piano']);
        $guitar = Instrument::factory()->create(['name' => 'Guitar', 'slug' => 'guitar']);

        $pianoTeacher = TeacherProfile::factory()->create(['is_active' => true]);
        $pianoTeacher->instruments()->attach($piano->id, ['can_teach_levels' => json_encode(['beginner'])]);

        $guitarTeacher = TeacherProfile::factory()->create(['is_active' => true]);
        $guitarTeacher->instruments()->attach($guitar->id, ['can_teach_levels' => json_encode(['advanced'])]);

        $response = $this->getJson('/api/v1/teachers?instrument=piano');

        $response->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $pianoTeacher->id);
    }

    public function test_teachers_can_be_searched_by_name(): void
    {
        $match = TeacherProfile::factory()
            ->for(User::factory()->create(['name' => 'Aria Mozart', 'role' => UserRole::Teacher]), 'user')
            ->create(['is_active' => true]);
        TeacherProfile::factory()
            ->for(User::factory()->create(['name' => 'John Cage', 'role' => UserRole::Teacher]), 'user')
            ->create(['is_active' => true]);

        $response = $this->getJson('/api/v1/teachers?search=Mozart');

        $response->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $match->id);
    }

    public function test_public_can_view_active_teacher_detail(): void
    {
        $teacher = TeacherProfile::factory()->create(['is_active' => true]);

        $this->getJson("/api/v1/teachers/{$teacher->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $teacher->id);
    }

    public function test_inactive_teacher_detail_returns_404(): void
    {
        $teacher = TeacherProfile::factory()->create(['is_active' => false]);

        $this->getJson("/api/v1/teachers/{$teacher->id}")
            ->assertNotFound();
    }

    public function test_public_slots_only_include_upcoming_enabled_available(): void
    {
        $teacher = TeacherProfile::factory()->create(['is_active' => true]);

        $upcoming = TeacherTimeSlot::factory()->create([
            'teacher_profile_id' => $teacher->id,
            'starts_at' => now()->addDays(2),
            'ends_at' => now()->addDays(2)->addHour(),
            'is_enabled' => true,
            'capacity' => 1,
            'booked_count' => 0,
        ]);

        // Past slot
        TeacherTimeSlot::factory()->create([
            'teacher_profile_id' => $teacher->id,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->subDay()->addHour(),
            'is_enabled' => true,
        ]);

        // Disabled slot
        TeacherTimeSlot::factory()->create([
            'teacher_profile_id' => $teacher->id,
            'starts_at' => now()->addDays(3),
            'ends_at' => now()->addDays(3)->addHour(),
            'is_enabled' => false,
        ]);

        // Full slot
        TeacherTimeSlot::factory()->create([
            'teacher_profile_id' => $teacher->id,
            'starts_at' => now()->addDays(4),
            'ends_at' => now()->addDays(4)->addHour(),
            'is_enabled' => true,
            'capacity' => 1,
            'booked_count' => 1,
        ]);

        $response = $this->getJson("/api/v1/teachers/{$teacher->id}/slots");

        $response->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $upcoming->id)
            ->assertJsonPath('data.data.0.available_seats', 1);
    }
}
