<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product' => new ProductResource($this->whenLoaded('product')),
            'quantity' => $this->quantity,
            'price' => $this->whenLoaded('product', function () {
                return (float) ($this->product->discount_price ?? $this->product->price);
            }),
            'subtotal' => $this->whenLoaded('product', function () {
                $price = (float) ($this->product->discount_price ?? $this->product->price);
                return $price * $this->quantity;
            }),
        ];
    }
}