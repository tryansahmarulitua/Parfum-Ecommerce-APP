<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\WithCasts;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $category_id
 * @property int $brand_id
 * @property string $sku
 * @property string $name
 * @property string $slug
 * @property string $gender
 * @property string|null $description
 * @property float $price
 * @property float|null $discount_price
 * @property int $stock
 * @property int $min_stock
 * @property int|null $weight
 * @property int|null $volume
 * @property string|null $top_notes
 * @property string|null $middle_notes
 * @property string|null $base_notes
 * @property string|null $thumbnail
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 */
#[Fillable([
    'category_id', 'brand_id', 'sku', 'name', 'slug', 'gender',
    'description', 'price', 'discount_price', 'stock', 'min_stock',
    'weight', 'volume', 'top_notes', 'middle_notes', 'base_notes',
    'thumbnail', 'is_active'
])]
#[Hidden(['slug'])]
#[WithCasts(['is_active' => 'boolean', 'price' => 'decimal:2', 'discount_price' => 'decimal:2'])]
class Product extends Model
{
    use SoftDeletes;

    protected $table = 'products';

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}