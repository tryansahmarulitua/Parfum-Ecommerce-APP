<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CartItemRequest;
use App\Http\Resources\Api\CartResource;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function __construct(private CartService $cartService) {}

    public function index(): JsonResponse
    {
        $cart = $this->cartService->getOrCreateCart(Auth::user());
        $cart->load('items.product.category', 'items.product.brand', 'items.product.images');

        return response()->json([
            'success' => true,
            'data' => new CartResource($cart),
        ]);
    }

    public function addItem(CartItemRequest $request): JsonResponse
    {
        try {
            $cartItem = $this->cartService->addItem(
                Auth::user(),
                $request->product_id,
                $request->quantity
            );

            return response()->json([
                'success' => true,
                'message' => 'Produk berhasil ditambahkan ke keranjang.',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function updateItem(int $id, CartItemRequest $request): JsonResponse
    {
        try {
            $cartItem = $this->cartService->updateItemQuantity($id, $request->quantity);

            return response()->json([
                'success' => true,
                'message' => 'Quantity berhasil diperbarui.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function removeItem(int $id): JsonResponse
    {
        $this->cartService->removeItem($id);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus dari keranjang.',
        ]);
    }
}