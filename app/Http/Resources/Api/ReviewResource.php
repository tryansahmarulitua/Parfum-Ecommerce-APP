<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),
            'rating' => $this->rating,
            'comment' => $this->comment,
            'image' => $this->image ? url('storage/' . $this->image) : null,
            'is_visible' => $this->is_visible,
            'created_at' => $this->created_at,
        ];
    }
}