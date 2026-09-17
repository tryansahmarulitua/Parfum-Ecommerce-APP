<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ReviewRequest;
use App\Http\Resources\Api\ReviewResource;
use App\Models\OrderItem;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function index(int $productId): JsonResponse
    {
        $reviews = Review::where('product_id', $productId)
            ->where('is_visible', true)
            ->with('user')
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => ReviewResource::collection($reviews),
        ]);
    }

    public function store(ReviewRequest $request, int $productId): JsonResponse
    {
        $request->validate([
            'order_item_id' => 'required|exists:order_items,id',
        ]);

        $orderItem = OrderItem::findOrFail($request->order_item_id);

        if ($orderItem->order->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        if ($orderItem->order->order_status !== 'completed') {
            return response()->json(['success' => false, 'message' => 'Pesanan belum selesai.'], 400);
        }

        $existingReview = Review::where('user_id', Auth::id())
            ->where('order_item_id', $orderItem->id)
            ->exists();

        if ($existingReview) {
            return response()->json(['success' => false, 'message' => 'Anda sudah memberikan review untuk item ini.'], 400);
        }

        $data = $request->validated();
        $data['user_id'] = Auth::id();
        $data['product_id'] = $productId;

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('reviews', 'public');
        }

        $review = Review::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Review berhasil ditambahkan.',
            'data' => new ReviewResource($review),
        ], 201);
    }

    public function toggleVisibility(Review $review): JsonResponse
    {
        $review->update(['is_visible' => !$review->is_visible]);

        return response()->json([
            'success' => true,
            'message' => 'Status review berhasil diperbarui.',
        ]);
    }

    public function destroy(Review $review): JsonResponse
    {
        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review berhasil dihapus.',
        ]);
    }
}