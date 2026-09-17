<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_id
 * @property string $image
 * @property int $sort_order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
#[Fillable(['product_id', 'image', 'sort_order'])]
class ProductImage extends Model
{
    protected $table = 'product_images';

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}