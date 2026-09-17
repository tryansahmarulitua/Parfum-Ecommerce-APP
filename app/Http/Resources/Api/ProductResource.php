<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'brand' => new BrandResource($this->whenLoaded('brand')),
            'sku' => $this->sku,
            'name' => $this->name,
            'slug' => $this->slug,
            'gender' => $this->gender,
            'description' => $this->description,
            'price' => (float) $this->price,
            'discount_price' => $this->discount_price ? (float) $this->discount_price : null,
            'effective_price' => $this->discount_price ? (float) $this->discount_price : (float) $this->price,
            'stock' => $this->stock,
            'min_stock' => $this->min_stock,
            'weight' => $this->weight,
            'volume' => $this->volume,
            'top_notes' => $this->top_notes,
            'middle_notes' => $this->middle_notes,
            'base_notes' => $this->base_notes,
            'thumbnail' => $this->thumbnail ? url('storage/' . $this->thumbnail) : null,
            'is_active' => $this->is_active,
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
            'avg_rating' => $this->whenNotNull($this->reviews_avg_rating, round($this->reviews_avg_rating ?? 0, 1)),
            'reviews_count' => $this->whenCounted('reviews'),
            'created_at' => $this->created_at,
        ];
    }
}