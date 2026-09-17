<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\WithCasts;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property string $type
 * @property float $value
 * @property float $min_purchase
 * @property float|null $max_discount
 * @property int|null $quota
 * @property int $used_count
 * @property \Illuminate\Support\Carbon $start_at
 * @property \Illuminate\Support\Carbon $end_at
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
#[Fillable([
    'code', 'name', 'type', 'value', 'min_purchase', 'max_discount',
    'quota', 'used_count', 'start_at', 'end_at', 'is_active'
])]
#[WithCasts([
    'value' => 'decimal:2', 'min_purchase' => 'decimal:2',
    'max_discount' => 'decimal:2'
])]
class Voucher extends Model
{
    protected $table = 'vouchers';

    public function usages(): HasMany
    {
        return $this->hasMany(VoucherUsage::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}