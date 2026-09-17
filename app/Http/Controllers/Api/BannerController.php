<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\BannerResource;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $banners = Banner::query()
            ->when($request->has('is_active'), fn($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('sort_order')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => BannerResource::collection($banners),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'image' => 'required|image|max:2048',
            'link' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $data = $request->all();
        $data['image'] = $request->file('image')->store('banners', 'public');

        $banner = Banner::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Banner berhasil ditambahkan.',
            'data' => new BannerResource($banner),
        ], 201);
    }

    public function update(Request $request, Banner $banner): JsonResponse
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'image' => 'sometimes|image|max:2048',
            'link' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer|min:0',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $data = $request->all();
        
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('banners', 'public');
        }

        $banner->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Banner berhasil diperbarui.',
            'data' => new BannerResource($banner),
        ]);
    }

    public function destroy(Banner $banner): JsonResponse
    {
        $banner->delete();

        return response()->json([
            'success' => true,
            'message' => 'Banner berhasil dihapus.',
        ]);
    }
}