<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;

class CartService
{
    public function getOrCreateCart(User $user): Cart
    {
        return Cart::firstOrCreate(['user_id' => $user->id]);
    }

    public function addItem(User $user, int $productId, int $quantity = 1): CartItem
    {
        $cart = $this->getOrCreateCart($user);
        $product = Product::findOrFail($productId);

        if (!$product->is_active) {
            throw new \Exception('Produk tidak tersedia.');
        }

        if ($product->stock < $quantity) {
            throw new \Exception('Stok produk tidak mencukupi.');
        }

        $cartItem = CartItem::updateOrCreate(
            ['cart_id' => $cart->id, 'product_id' => $productId],
            ['quantity' => \DB::raw("quantity + $quantity")]
        );

        // Validate total quantity doesn't exceed stock
        $cartItem->refresh();
        if ($cartItem->quantity > $product->stock) {
            $cartItem->update(['quantity' => $product->stock]);
        }

        return $cartItem;
    }

    public function updateItemQuantity(int $cartItemId, int $quantity): CartItem
    {
        $cartItem = CartItem::findOrFail($cartItemId);
        $product = $cartItem->product;

        if ($quantity > $product->stock) {
            throw new \Exception('Quantity tidak boleh melebihi stok.');
        }

        $cartItem->update(['quantity' => $quantity]);
        return $cartItem;
    }

    public function removeItem(int $cartItemId): bool
    {
        return CartItem::findOrFail($cartItemId)->delete();
    }

    public function clearCart(User $user): bool
    {
        $cart = $this->getOrCreateCart($user);
        return $cart->items()->delete();
    }
}