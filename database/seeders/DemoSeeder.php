<?php

namespace Database\Seeders;

use App\Domain\Booking\Models\Booking;
use App\Domain\Instrument\Models\Instrument;
use App\Domain\Review\Models\Review;
use App\Domain\Student\Models\StudentProfile;
use App\Domain\Teacher\Models\TeacherProfile;
use App\Domain\Teacher\Models\TeacherTimeSlot;
use App\Domain\User\Models\User;
use App\Domain\Wallet\Models\Wallet;
use App\Enums\BookingStatus;
use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

/**
 * Idempotent demo data for local development and manual QA.
 *
 * Safe to run repeatedly (uses updateOrCreate / firstOrCreate keyed on
 * natural keys). NOT intended for production — guarded in run().
 *
 * Demo credentials (all password: "password"):
 *   admin@demo.test      (admin)
 *   teacher@demo.test    (teacher, active profile, slots, bookings)
 *   teacher2@demo.test   (teacher, active profile, slots)
 *   student@demo.test    (student, wallet funded, bookings across states)
 *   student2@demo.test   (student, wallet funded)
 */
class DemoSeeder extends Seeder
{
    private const PASSWORD = 'password';

    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn('DemoSeeder skipped: refusing to seed demo data in production.');

            return;
        }

        $this->call(InstrumentSeeder::class);

        $piano = Instrument::where('name', 'Piano')->first();
        $guitar = Instrument::where('name', 'Guitar')->first();
        $violin = Instrument::where('name', 'Violin')->first();

        // --- Admin ---
        $this->makeUser('Demo Admin', 'admin@demo.test', UserRole::Admin);

        // --- Teacher 1: fully populated (profile + instruments + slots + bookings) ---
        $teacher1 = $this->makeUser('Sara Piano', 'teacher@demo.test', UserRole::Teacher);
        $tp1 = TeacherProfile::updateOrCreate(
            ['user_id' => $teacher1->id],
            ['bio' => 'Classically trained pianist with 10 years of teaching experience.', 'price_per_session' => 250000, 'is_active' => true],
        );
        $this->syncInstruments($tp1, [
            $piano?->id => ['beginner', 'intermediate', 'advanced'],
            $violin?->id => ['beginner', 'intermediate'],
        ]);

        // --- Teacher 2: active profile + slots, no bookings (tests empty booking list) ---
        $teacher2 = $this->makeUser('Ali Guitar', 'teacher2@demo.test', UserRole::Teacher);
        $tp2 = TeacherProfile::updateOrCreate(
            ['user_id' => $teacher2->id],
            ['bio' => 'Guitarist specializing in rock and flamenco.', 'price_per_session' => 180000, 'is_active' => true],
        );
        $this->syncInstruments($tp2, [$guitar?->id => ['beginner', 'intermediate']]);

        // --- Students with funded wallets ---
        $student1 = $this->makeUser('Reza Student', 'student@demo.test', UserRole::Student);
        $sp1 = StudentProfile::updateOrCreate(['user_id' => $student1->id], ['bio' => 'Eager beginner.', 'phone_number' => '09120000001']);
        $this->fundWallet($student1, 5000000);

        $student2 = $this->makeUser('Mina Student', 'student2@demo.test', UserRole::Student);
        StudentProfile::updateOrCreate(['user_id' => $student2->id], ['bio' => 'Intermediate learner.', 'phone_number' => '09120000002']);
        $this->fundWallet($student2, 5000000);

        // --- Time slots for teacher 1 (future) ---
        $slotPast = $this->makeSlot($tp1, Carbon::now()->subDays(3)->setTime(10, 0), 60, 1);
        $slotSoon = $this->makeSlot($tp1, Carbon::now()->addDays(2)->setTime(14, 0), 60, 1);
        $slotOpen = $this->makeSlot($tp1, Carbon::now()->addDays(5)->setTime(16, 0), 60, 3);
        $this->makeSlot($tp1, Carbon::now()->addDays(7)->setTime(11, 0), 90, 1);

        // Teacher 2 slots (open, no bookings)
        $this->makeSlot($tp2, Carbon::now()->addDays(3)->setTime(9, 0), 60, 2);
        $this->makeSlot($tp2, Carbon::now()->addDays(4)->setTime(18, 0), 60, 2);

        // --- Bookings across states for student 1 ---
        // Completed (in the past) + review
        $completed = $this->makeBooking($tp1, $sp1, $slotPast, BookingStatus::Completed, 250000, [
            'confirmed_at' => Carbon::now()->subDays(4),
        ]);
        Review::updateOrCreate(
            ['booking_id' => $completed->id],
            [
                'teacher_profile_id' => $tp1->id,
                'student_profile_id' => $sp1->id,
                'rating' => 5,
                'comment' => 'Fantastic lesson, learned a lot!',
            ],
        );

        // Confirmed (upcoming)
        $this->makeBooking($tp1, $sp1, $slotSoon, BookingStatus::Confirmed, 250000, [
            'confirmed_at' => Carbon::now()->subDay(),
        ]);

        // Pending (awaiting teacher confirmation)
        $this->makeBooking($tp1, $sp1, $slotOpen, BookingStatus::Pending, 250000);

        $this->refreshTeacherRating($tp1);

        $this->command?->info('DemoSeeder complete. Login with *@demo.test / password "password".');
    }

    private function makeUser(string $name, string $email, UserRole $role): User
    {
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make(self::PASSWORD),
                'role' => $role->value,
                'email_verified_at' => now(),
            ],
        );

        // Mirror the registration contract: every user has a wallet.
        Wallet::firstOrCreate(['user_id' => $user->id], ['balance' => 0]);

        return $user;
    }

    /** @param array<int|null, list<string>> $map instrument_id => levels */
    private function syncInstruments(TeacherProfile $profile, array $map): void
    {
        $sync = [];
        foreach ($map as $instrumentId => $levels) {
            if ($instrumentId === null) {
                continue;
            }
            $sync[$instrumentId] = ['can_teach_levels' => json_encode($levels)];
        }
        $profile->instruments()->sync($sync);
    }

    private function fundWallet(User $user, int $amount): void
    {
        $wallet = Wallet::firstOrCreate(['user_id' => $user->id], ['balance' => 0]);
        if ((int) $wallet->balance < $amount) {
            $wallet->update(['balance' => $amount]);
        }
    }

    private function makeSlot(TeacherProfile $tp, Carbon $startsAt, int $durationMinutes, int $capacity): TeacherTimeSlot
    {
        return TeacherTimeSlot::updateOrCreate(
            ['teacher_profile_id' => $tp->id, 'starts_at' => $startsAt],
            [
                'ends_at' => (clone $startsAt)->addMinutes($durationMinutes),
                'capacity' => $capacity,
                'is_enabled' => true,
            ],
        );
    }

    /** @param array<string, mixed> $extra */
    private function makeBooking(TeacherProfile $tp, StudentProfile $sp, TeacherTimeSlot $slot, BookingStatus $status, int $amount, array $extra = []): Booking
    {
        $booking = Booking::updateOrCreate(
            ['teacher_time_slot_id' => $slot->id, 'student_profile_id' => $sp->id],
            array_merge([
                'teacher_profile_id' => $tp->id,
                'status' => $status->value,
                'price_amount' => $amount,
            ], $extra),
        );

        // Keep the slot's denormalised booked_count consistent for active bookings.
        $activeCount = Booking::where('teacher_time_slot_id', $slot->id)
            ->whereIn('status', [BookingStatus::Pending->value, BookingStatus::Confirmed->value, BookingStatus::Completed->value])
            ->count();
        $slot->update(['booked_count' => $activeCount]);

        return $booking;
    }

    private function refreshTeacherRating(TeacherProfile $tp): void
    {
        $reviews = Review::where('teacher_profile_id', $tp->id);
        $count = $reviews->count();
        $avg = $count > 0 ? round((float) $reviews->avg('rating'), 2) : 0;
        $tp->update(['rating_avg' => $avg, 'rating_count' => $count]);
    }
}
