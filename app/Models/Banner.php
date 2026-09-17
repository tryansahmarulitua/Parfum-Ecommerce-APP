<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string|null $title
 * @property string|null $subtitle
 * @property string $image
 * @property string|null $link
 * @property int $sort_order
 * @property \Illuminate\Support\Carbon|null $start_at
 * @property \Illuminate\Support\Carbon|null $end_at
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
#[Fillable([
    'title', 'subtitle', 'image', 'link', 'sort_order',
    'start_at', 'end_at', 'is_active'
])]
#[WithCasts(['is_active' => 'boolean'])]
class Banner extends Model
{
    protected $table = 'banners';
}