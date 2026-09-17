<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\WithCasts;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $order_id
 * @property int $product_id
 * @property string $product_name
 * @property string $product_sku
 * @property float $price
 * @property float $discount
 * @property int $quantity
 * @property float $subtotal
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
#[Fillable([
    'order_id', 'product_id', 'product_name', 'product_sku', 'price',
    'discount', 'quantity', 'subtotal'
])]
#[WithCasts(['price' => 'decimal:2', 'discount' => 'decimal:2', 'subtotal' => 'decimal:2'])]
class OrderItem extends Model
{
    protected $table = 'order_items';

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}