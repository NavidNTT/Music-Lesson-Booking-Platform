<?php

namespace App\Jobs;

use App\Domain\Review\Models\Review;
use App\Domain\Teacher\Models\TeacherProfile;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;

class RecalculateTeacherRating implements ShouldQueue
{
    use Dispatchable, Queueable;

    public function __construct(
        protected TeacherProfile $teacherProfile
    ) {}

    public function handle(): void
    {
        $stats = Review::query()
            ->where('teacher_profile_id', $this->teacherProfile->id)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total_reviews')
            ->first();

        $this->teacherProfile->update([
            'rating_avg' => round((float) $stats->avg_rating, 2),
            'rating_count' => (int) $stats->total_reviews,
        ]);
    }
}
