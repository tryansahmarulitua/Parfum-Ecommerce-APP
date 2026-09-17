<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\WithCasts;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $address_id
 * @property int|null $voucher_id
 * @property string $order_number
 * @property float $subtotal
 * @property float $discount
 * @property float $shipping_cost
 * @property float $total
 * @property string $payment_method
 * @property string $payment_status
 * @property string $order_status
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $paid_at
 * @property \Illuminate\Support\Carbon|null $completed_at
 * @property \Illuminate\Support\Carbon|null $cancelled_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
#[Fillable([
    'user_id', 'address_id', 'voucher_id', 'order_number', 'subtotal',
    'discount', 'shipping_cost', 'total', 'payment_method', 'payment_status',
    'order_status', 'notes', 'paid_at', 'completed_at', 'cancelled_at'
])]

#[WithCasts([
    'subtotal' => 'decimal:2', 'discount' => 'decimal:2',
    'shipping_cost' => 'decimal:2', 'total' => 'decimal:2'
])]
class Order extends Model
{
    protected $table = 'orders';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function voucherUsage(): HasOne
    {
        return $this->hasOne(VoucherUsage::class);
    }

    public function checkAndProcessExpiration(): void
    {
        if ($this->payment_status === 'pending' && $this->order_status === 'pending_payment') {
            if ($this->created_at && $this->created_at->addMinutes(30)->isPast()) {
                \Illuminate\Support\Facades\DB::transaction(function () {
                    $this->update([
                        'payment_status' => 'expired',
                        'order_status' => 'cancelled',
                        'cancelled_at' => now(),
                    ]);
                    foreach ($this->items as $item) {
                        Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                    }
                });
                $this->refresh();
            }
        }
    }
}