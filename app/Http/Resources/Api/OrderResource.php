<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'address' => new AddressResource($this->whenLoaded('address')),
            'voucher' => new VoucherResource($this->whenLoaded('voucher')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'payment' => PaymentResource::collection($this->whenLoaded('payment')),
            'user' => $this->whenLoaded('user', fn() => ['id' => $this->user->id, 'name' => $this->user->name, 'email' => $this->user->email]),
            'subtotal' => (float) $this->subtotal,
            'discount' => (float) $this->discount,
            'shipping_cost' => (float) $this->shipping_cost,
            'total' => (float) $this->total,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'order_status' => $this->order_status,
            'notes' => $this->notes,
            'paid_at' => $this->paid_at,
            'completed_at' => $this->completed_at,
            'cancelled_at' => $this->cancelled_at,
            'created_at' => $this->created_at,
            'expires_at' => $this->created_at ? $this->created_at->addMinutes(30)->toIso8601String() : null,
            'is_expired' => $this->payment_status === 'expired' || ($this->payment_status === 'pending' && $this->created_at && $this->created_at->addMinutes(30)->isPast()),
        ];
    }
}