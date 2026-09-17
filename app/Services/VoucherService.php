<?php

namespace App\Services;

use App\Models\Voucher;
use Carbon\Carbon;

class VoucherService
{
    public function validateVoucher(string $code, float $subtotal): Voucher
    {
        $voucher = Voucher::where('code', $code)
            ->where('is_active', true)
            ->first();

        if (!$voucher) {
            throw new \Exception('Voucher tidak ditemukan atau tidak aktif.');
        }

        $now = Carbon::now();

        if ($now->lt($voucher->start_at)) {
            throw new \Exception('Voucher belum berlaku.');
        }

        if ($now->gt($voucher->end_at)) {
            throw new \Exception('Voucher sudah expired.');
        }

        if ($subtotal < $voucher->min_purchase) {
            throw new \Exception('Minimum pembelian belum terpenuhi untuk menggunakan voucher ini.');
        }

        if ($voucher->quota !== null && $voucher->used_count >= $voucher->quota) {
            throw new \Exception('Kuota voucher sudah habis.');
        }

        return $voucher;
    }

    public function calculateDiscount(string $code, float $subtotal): float
    {
        $voucher = $this->validateVoucher($code, $subtotal);

        if ($voucher->type === 'percentage') {
            $discount = $subtotal * ($voucher->value / 100);

            if ($voucher->max_discount && $discount > $voucher->max_discount) {
                $discount = (float) $voucher->max_discount;
            }
        } else {
            $discount = (float) $voucher->value;
        }

        if ($discount > $subtotal) {
            $discount = $subtotal;
        }

        return round($discount, 2);
    }
}