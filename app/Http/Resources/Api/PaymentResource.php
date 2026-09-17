<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'payment_method' => $this->payment_method,
            'amount' => (float) $this->amount,
            'proof' => $this->proof ? url('storage/' . $this->proof) : null,
            'status' => $this->status,
            'notes' => $this->notes,
            'paid_at' => $this->paid_at,
            'verified_at' => $this->verified_at,
            'verified_by' => $this->verified_by,
            'created_at' => $this->created_at,
        ];
    }
}