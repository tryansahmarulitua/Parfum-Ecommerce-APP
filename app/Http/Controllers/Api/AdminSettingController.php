<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\UserResource;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminSettingController extends Controller
{
    public function getSettings(): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'store_name' => 'nullable|string|max:255',
            'store_email' => 'nullable|email|max:255',
            'store_phone' => 'nullable|string|max:50',
            'store_address' => 'nullable|string',
            'about_us' => 'nullable|string',
            'footer_text' => 'nullable|string',
            'owner_name' => 'nullable|string|max:255',
            'owner_role' => 'nullable|string|max:255',
            'owner_bio' => 'nullable|string',
            'owner_photo' => 'nullable|image|max:10240',
            'social_instagram' => 'nullable|string|max:255',
            'social_facebook' => 'nullable|string|max:255',
            'social_tiktok' => 'nullable|string|max:255',
            'social_whatsapp' => 'nullable|string|max:255',
            'social_youtube' => 'nullable|string|max:255',
            'social_twitter' => 'nullable|string|max:255',
        ]);

        if ($request->hasFile('owner_photo')) {
            $file = $request->file('owner_photo');
            $filename = 'owner_' . time() . '.' . strtolower($file->getClientOriginalExtension() ?: 'jpg');
            $path = $file->storeAs('settings', $filename, 'public');
            $data['owner_photo'] = url('storage/' . $path);
        }

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value ?? '', 'type' => 'string']
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan berhasil diperbarui.',
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|max:10240',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone;

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $extension = strtolower($file->getClientOriginalExtension() ?: 'jpg');
            $nameSlug = Str::slug($user->name, '_');
            $dateStr = date('Y-m-d_His');
            $filename = "admin_{$nameSlug}_{$dateStr}.{$extension}";

            $targetDir = storage_path('app/public/avatars');
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }
            $file->move($targetDir, $filename);

            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            $user->avatar = 'avatars/' . $filename;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil admin berhasil diperbarui.',
            'data' => new UserResource($user),
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password saat ini salah.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diperbarui.',
        ]);
    }
}
