<?php

namespace App\Http\Controllers\Api\V1\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Teacher\UpdateTeacherProfileRequest;
use App\Http\Requests\Api\V1\Teacher\SyncTeacherInstrumentsRequest;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;

class TeacherProfileController extends Controller
{
    use ApiResponse;

    public function show(): JsonResponse
    {
        $profile = auth()->user()
            ->teacherProfile()
            ->with('instruments')
            ->first();

        if (!$profile) {
            return $this->notFound('Profile not found.');
        }

        return $this->success(data: $profile);
    }

    public function update(UpdateTeacherProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        $profile = $user->teacherProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $request->validated()
        );

        return $this->success(
            data: $profile,
            message: 'Profile updated successfully.'
        );
    }

    public function syncInstruments(SyncTeacherInstrumentsRequest $request): JsonResponse
    {
        $profile = $request->user()->teacherProfile;

        if (! $profile) {
            return $this->notFound('Profile not found. Please create your profile first.');
        }

        $syncData = [];

        foreach ($request->instruments as $instrument) {
            $syncData[$instrument['id']] = [
                'can_teach_levels' => json_encode($instrument['levels']),
            ];
        }

        $profile->instruments()->sync($syncData);

        return $this->success(
            data: $profile->load('instruments'),
            message: 'Instruments synced successfully.'
        );
    }
}
