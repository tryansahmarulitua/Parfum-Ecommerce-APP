<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ProductRequest;
use App\Http\Resources\Api\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::query()
            ->with(['category', 'brand', 'images'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->when($request->search, fn($q) => $q->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('sku', 'like', "%{$request->search}%")
                  ->orWhereHas('brand', fn($q) => $q->where('name', 'like', "%{$request->search}%"))
                  ->orWhereHas('category', fn($q) => $q->where('name', 'like', "%{$request->search}%"));
            }))
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->when($request->category_slug, fn($q) => $q->whereHas('category', fn($q) => $q->where('slug', $request->category_slug)))
            ->when($request->brand_id, fn($q) => $q->where('brand_id', $request->brand_id))
            ->when($request->gender, fn($q) => $q->where('gender', $request->gender))
            ->when($request->min_price, fn($q) => $q->where('price', '>=', $request->min_price))
            ->when($request->max_price, fn($q) => $q->where('price', '<=', $request->max_price))
            ->when($request->is_active, fn($q) => $q->where('is_active', $request->boolean('is_active')))
            ->when($request->sort === 'price_asc', fn($q) => $q->orderBy('price', 'asc'))
            ->when($request->sort === 'price_desc', fn($q) => $q->orderBy('price', 'desc'))
            ->when($request->sort === 'newest', fn($q) => $q->latest())
            ->when($request->sort === 'rating', fn($q) => $q->orderByDesc('reviews_avg_rating'))
            ->unless($request->sort, fn($q) => $q->latest())
            ->where('is_active', true)
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
        ]);
    }

    public function store(ProductRequest $request): JsonResponse
    {
        $data = $request->validated();
        unset($data['images']);
        
        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('products', 'public');
        }

        $product = Product::create($data);

        if ($request->hasFile('images')) {
            $files = is_array($request->file('images')) ? $request->file('images') : [$request->file('images')];
            foreach ($files as $index => $image) {
                if ($image && $image->isValid()) {
                    $product->images()->create([
                        'image' => $image->store('products', 'public'),
                        'sort_order' => $index,
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil ditambahkan.',
            'data' => new ProductResource($product->load(['category', 'brand', 'images'])),
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['category', 'brand', 'images', 'reviews' => fn($q) => $q->where('is_visible', true)->with('user')->latest()])
            ->loadAvg('reviews', 'rating')
            ->loadCount('reviews');

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product),
        ]);
    }

    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();
        unset($data['images']);
        
        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('products', 'public');
        }

        $product->update($data);

        if ($request->hasFile('images')) {
            $files = is_array($request->file('images')) ? $request->file('images') : [$request->file('images')];
            foreach ($files as $index => $image) {
                if ($image && $image->isValid()) {
                    $product->images()->create([
                        'image' => $image->store('products', 'public'),
                        'sort_order' => $index,
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil diperbarui.',
            'data' => new ProductResource($product->load(['category', 'brand', 'images'])),
        ]);
    }

    public function deleteImage(ProductImage $image): JsonResponse
    {
        $image->delete();

        return response()->json([
            'success' => true,
            'message' => 'Gambar berhasil dihapus.',
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus.',
        ]);
    }
}