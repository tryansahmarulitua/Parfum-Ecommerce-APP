<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class BrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $brandId = $this->route('brand')?->id ?? $this->brand?->id ?? 'NULL';

        return [
            'name' => 'required|string|max:150',
            'slug' => 'required|string|max:180|unique:brands,slug,' . $brandId,
            'logo' => 'nullable|image|max:2048',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama brand wajib diisi.',
            'slug.required' => 'Slug wajib diisi.',
            'slug.unique' => 'Slug sudah terdaftar.',
            'logo.image' => 'File harus berupa gambar.',
            'logo.max' => 'Ukuran file maksimal 2MB.',
        ];
    }
}