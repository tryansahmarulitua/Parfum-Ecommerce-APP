<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class PaymentProofRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_method' => 'required|string|in:bank_transfer,e_wallet,transfer,qris,ewallet',
            'amount' => 'required|numeric|min:0',
            'proof' => 'required|file|max:10240|mimes:jpg,jpeg,png,webp,pdf',
        ];
    }

    public function messages(): array
    {
        return [
            'payment_method.required' => 'Metode pembayaran wajib diisi.',
            'payment_method.in' => 'Metode pembayaran tidak valid.',
            'amount.required' => 'Nominal pembayaran wajib diisi.',
            'amount.numeric' => 'Nominal pembayaran harus berupa angka.',
            'amount.min' => 'Nominal pembayaran tidak boleh kurang dari 0.',
            'proof.required' => 'Bukti pembayaran wajib diupload.',
            'proof.file' => 'File harus berupa dokumen.',
            'proof.max' => 'Ukuran file maksimal 10MB.',
            'proof.mimes' => 'Format file harus JPG, JPEG, PNG, WEBP, atau PDF.',
        ];
    }
}