<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id ?? $this->product?->id ?? 'NULL';

        return [
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'required|exists:brands,id',
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $productId,
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:280|unique:products,slug,' . $productId,
            'gender' => 'required|in:male,female,unisex,men,women',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'nullable|integer|min:0',
            'weight' => 'nullable|integer|min:0',
            'volume' => 'nullable|integer|min:0',
            'top_notes' => 'nullable|string|max:500',
            'middle_notes' => 'nullable|string|max:500',
            'base_notes' => 'nullable|string|max:500',
            'thumbnail' => 'nullable|image|max:10240',
            'images' => 'nullable|array',
            'images.*' => 'image|max:10240',
            'is_active' => 'boolean',
        ];
    }

    protected function prepareForValidation(): void
    {
        $merge = [];
        if (!$this->has('sku') || empty($this->sku)) {
            $merge['sku'] = 'PRF-' . strtoupper(substr(uniqid(), -6));
        }
        if (!$this->has('min_stock') || $this->min_stock === null || $this->min_stock === '') {
            $merge['min_stock'] = 0;
        }
        if ($this->gender === 'men') {
            $merge['gender'] = 'male';
        } elseif ($this->gender === 'women') {
            $merge['gender'] = 'female';
        }
        if ($this->has('notes_top') && !$this->has('top_notes')) {
            $merge['top_notes'] = $this->notes_top;
        }
        if ($this->has('notes_middle') && !$this->has('middle_notes')) {
            $merge['middle_notes'] = $this->notes_middle;
        }
        if ($this->has('notes_base') && !$this->has('base_notes')) {
            $merge['base_notes'] = $this->notes_base;
        }

        if (!empty($merge)) {
            $this->merge($merge);
        }
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists' => 'Kategori tidak ditemukan.',
            'brand_id.required' => 'Brand wajib dipilih.',
            'brand_id.exists' => 'Brand tidak ditemukan.',
            'sku.required' => 'SKU wajib diisi.',
            'sku.unique' => 'SKU sudah terdaftar.',
            'name.required' => 'Nama produk wajib diisi.',
            'slug.required' => 'Slug wajib diisi.',
            'slug.unique' => 'Slug sudah terdaftar.',
            'gender.required' => 'Gender wajib dipilih.',
            'price.required' => 'Harga wajib diisi.',
            'price.numeric' => 'Harga harus berupa angka.',
            'price.min' => 'Harga tidak boleh kurang dari 0.',
            'discount_price.numeric' => 'Harga diskon harus berupa angka.',
            'discount_price.min' => 'Harga diskon tidak boleh kurang dari 0.',
            'stock.required' => 'Stok wajib diisi.',
            'stock.integer' => 'Stok harus berupa bilangan bulat.',
            'stock.min' => 'Stok tidak boleh kurang dari 0.',
            'min_stock.required' => 'Stok minimum wajib diisi.',
            'min_stock.integer' => 'Stok minimum harus berupa bilangan bulat.',
            'min_stock.min' => 'Stok minimum tidak boleh kurang dari 0.',
            'weight.integer' => 'Berat harus berupa bilangan bulat.',
            'weight.min' => 'Berat tidak boleh kurang dari 0.',
            'volume.integer' => 'Volume harus berupa bilangan bulat.',
            'volume.min' => 'Volume tidak boleh kurang dari 0.',
            'top_notes.max' => 'Top notes maksimal 500 karakter.',
            'middle_notes.max' => 'Middle notes maksimal 500 karakter.',
            'base_notes.max' => 'Base notes maksimal 500 karakter.',
            'thumbnail.image' => 'File harus berupa gambar.',
            'thumbnail.max' => 'Ukuran file maksimal 2MB.',
        ];
    }
}