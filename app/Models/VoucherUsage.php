<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\WithCasts;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $voucher_id
 * @property int $user_id
 * @property int $order_id
 * @property float $discount_amount
 * @property \Illuminate\Support\Carbon $used_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
#[Fillable([
    'voucher_id', 'user_id', 'order_id', 'discount_amount', 'used_at'
])]
#[WithCasts(['discount_amount' => 'decimal:2'])]
class VoucherUsage extends Model
{
    protected $table = 'voucher_usages';

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}