<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'items' => CartItemResource::collection($this->whenLoaded('items')),
            'total' => $this->whenLoaded('items', function () {
                return $this->items->sum(function ($item) {
                    $price = $item->product->discount_price ?? $item->product->price;
                    return $price * $item->quantity;
                });
            }),
        ];
    }
}