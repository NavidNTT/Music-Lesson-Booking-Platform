<?php

namespace App\Observers;

use App\Models\Review;

class ReviewObserver
{
public function created(Review $review): void
{
    $this->updateTeacherRating($review->teacherProfile);
}

protected function updateTeacherRating($teacherProfile): void
{
    $stats = Review::where('teacher_profile_id', $teacherProfile->id)
        ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total_reviews')
        ->first();

    $teacherProfile->update([
        'rating_avg' => $stats->avg_rating,
        'rating_count' => $stats->total_reviews,
    ]);
}

}
