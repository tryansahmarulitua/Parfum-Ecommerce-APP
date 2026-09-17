<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class VoucherResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'type' => $this->type,
            'value' => (float) $this->value,
            'min_purchase' => (float) $this->min_purchase,
            'max_discount' => $this->max_discount ? (float) $this->max_discount : null,
            'quota' => $this->quota,
            'used_count' => $this->used_count,
            'start_at' => $this->start_at,
            'end_at' => $this->end_at,
            'is_active' => $this->is_active,
        ];
    }
}