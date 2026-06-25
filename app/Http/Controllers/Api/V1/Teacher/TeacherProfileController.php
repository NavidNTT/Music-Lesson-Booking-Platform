<?php

namespace App\Http\Controllers\Api\V1\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Teacher\UpdateTeacherProfileRequest;
use App\Http\Requests\Api\V1\Teacher\SyncTeacherInstrumentsRequest; // <--- اینو حتما اضافه کن
use App\Models\TeacherProfile;
use Illuminate\Http\JsonResponse;

class TeacherProfileController extends Controller
{
    public function show(): JsonResponse
    {
        $profile = auth()->user()
            ->teacherProfile()
            ->with('instruments')
            ->first();

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        return response()->json(['data' => $profile]);
    }

    public function update(UpdateTeacherProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        // اگه پروفایل نداشت بسازه، اگه داشت آپدیت کنه
        $profile = $user->teacherProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $request->validated()
        );

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $profile,
        ]);
    }

    // --- این همون متدی هست که پرسیدی کجا بذارم ---
    public function syncInstruments(SyncTeacherInstrumentsRequest $request): JsonResponse
    {
        $profile = $request->user()->teacherProfile;

        if (! $profile) {
            return response()->json(['message' => 'Profile not found. Please create your profile first.'], 404);
        }

        $syncData = [];

        foreach ($request->instruments as $instrument) {
            $syncData[$instrument['id']] = [
                'can_teach_levels' => json_encode($instrument['levels']),
            ];
        }

        $profile->instruments()->sync($syncData);

        return response()->json([
            'message' => 'Instruments synced successfully',
            'data' => $profile->load('instruments') // لود می‌کنیم که نتیجه رو ببینی
        ]);
    }
}
