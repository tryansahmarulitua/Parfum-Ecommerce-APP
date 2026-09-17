<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\BrandRequest;
use App\Http\Resources\Api\BrandResource;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $brands = Brand::query()
            ->when($request->has('is_active'), fn($q) => $q->where('is_active', $request->boolean('is_active')))
            ->withCount('products')
            ->latest()
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => BrandResource::collection($brands),
        ]);
    }

    public function store(BrandRequest $request): JsonResponse
    {
        $data = $request->validated();
        
        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('brands', 'public');
        }

        $brand = Brand::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Brand berhasil ditambahkan.',
            'data' => new BrandResource($brand),
        ], 201);
    }

    public function show(Brand $brand): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new BrandResource($brand->loadCount('products')),
        ]);
    }

    public function update(BrandRequest $request, Brand $brand): JsonResponse
    {
        $data = $request->validated();
        
        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('brands', 'public');
        }

        $brand->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Brand berhasil diperbarui.',
            'data' => new BrandResource($brand),
        ]);
    }

    public function destroy(Brand $brand): JsonResponse
    {
        $brand->delete();

        return response()->json([
            'success' => true,
            'message' => 'Brand berhasil dihapus.',
        ]);
    }
}