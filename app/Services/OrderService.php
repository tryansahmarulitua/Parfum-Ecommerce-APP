<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function createOrder(User $user, int $addressId, string $paymentMethod, ?string $voucherCode = null, ?string $notes = null): Order
    {
        return DB::transaction(function () use ($user, $addressId, $paymentMethod, $voucherCode, $notes) {
            $cart = $user->cart->load('items.product');
            
            if (!$cart || $cart->items->isEmpty()) {
                throw new \Exception('Keranjang belanja kosong.');
            }

            $subtotal = 0;
            $orderItems = [];

            foreach ($cart->items as $item) {
                $product = $item->product;

                if (!$product->is_active) {
                    throw new \Exception("Produk {$product->name} tidak tersedia.");
                }

                // Lock row for stock validation
                $product = Product::lockForUpdate()->find($product->id);

                if ($product->stock < $item->quantity) {
                    throw new \Exception("Stok produk {$product->name} tidak mencukupi.");
                }

                $price = (float) $product->price;
                $discountPrice = $product->discount_price ? (float) $product->discount_price : 0;
                $effectivePrice = $discountPrice > 0 ? $discountPrice : $price;
                $itemSubtotal = $effectivePrice * $item->quantity;

                $orderItems[] = new OrderItem([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'price' => $price,
                    'discount' => $discountPrice,
                    'quantity' => $item->quantity,
                    'subtotal' => $itemSubtotal,
                ]);

                $subtotal += $itemSubtotal;

                // Decrement stock
                $product->decrement('stock', $item->quantity);
            }

            // Calculate discount
            $discount = 0;
            $voucher = null;

            if ($voucherCode) {
                $voucherService = new VoucherService();
                $discount = $voucherService->calculateDiscount($voucherCode, $subtotal);
                $voucher = Voucher::where('code', $voucherCode)->first();
            }

            $shippingCost = 0; // Can be calculated via shipping API later
            $total = $subtotal - $discount + $shippingCost;

            $orderNumber = $this->generateOrderNumber();

            $order = Order::create([
                'user_id' => $user->id,
                'address_id' => $addressId,
                'voucher_id' => $voucher?->id,
                'order_number' => $orderNumber,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'payment_method' => $paymentMethod,
                'payment_status' => 'pending',
                'order_status' => 'pending_payment',
                'notes' => $notes,
            ]);

            $order->items()->saveMany($orderItems);

            // Create payment record
            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $paymentMethod,
                'amount' => $total,
                'status' => 'pending',
            ]);

            // Record voucher usage
            if ($voucher && $discount > 0) {
                VoucherUsage::create([
                    'voucher_id' => $voucher->id,
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'discount_amount' => $discount,
                    'used_at' => Carbon::now(),
                ]);

                $voucher->increment('used_count');
            }

            // Clear cart
            $cart->items()->delete();

            return $order;
        });
    }

    public function generateOrderNumber(): string
    {
        $date = Carbon::now()->format('Ymd');
        $lastOrder = Order::where('order_number', 'LIKE', "ORD-{$date}-%")
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastOrder ? (int) substr($lastOrder->order_number, -5) + 1 : 1;

        return 'ORD-' . $date . '-' . str_pad($sequence, 5, '0', STR_PAD_LEFT);
    }

    public function updateOrderStatus(Order $order, string $status): Order
    {
        $validStatuses = [
            'pending_payment', 'waiting_verification', 'processing',
            'packed', 'shipped', 'completed', 'cancelled'
        ];

        if (!in_array($status, $validStatuses)) {
            throw new \Exception('Status pesanan tidak valid.');
        }

        $updateData = ['order_status' => $status];

        if ($status === 'completed') {
            $updateData['completed_at'] = Carbon::now();
        }

        if ($status === 'cancelled') {
            $updateData['cancelled_at'] = Carbon::now();
            // Restore stock
            foreach ($order->items as $item) {
                \App\Models\Product::where('id', $item->product_id)
                    ->increment('stock', $item->quantity);
            }
        }

        $order->update($updateData);
        return $order;
    }
}