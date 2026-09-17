<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Order;
use Illuminate\Support\Facades\Storage;

class PaymentService
{
    public function uploadProof(Order $order, string $paymentMethod, float $amount, $proofFile, ?string $notes = null): Payment
    {
        $order->checkAndProcessExpiration();

        if ($order->payment_status === 'expired' || $order->order_status === 'cancelled') {
            throw new \Exception('Batas waktu pembayaran (30 menit) telah habis. Pesanan otomatis kadaluarsa.');
        }

        if ($order->payment_status !== 'pending' && $order->payment_status !== 'rejected') {
            throw new \Exception('Pesanan tidak dapat dibayar pada status ini.');
        }

        $path = $proofFile->store('payment-proofs', 'public');

        $payment = Payment::where('order_id', $order->id)
            ->where('status', 'pending')
            ->first();

        if ($payment) {
            $payment->update([
                'payment_method' => $paymentMethod,
                'amount' => $amount,
                'proof' => $path,
                'status' => 'waiting_verification',
                'notes' => $notes,
                'paid_at' => now(),
            ]);
        } else {
            $payment = Payment::create([
                'order_id' => $order->id,
                'payment_method' => $paymentMethod,
                'amount' => $amount,
                'proof' => $path,
                'status' => 'waiting_verification',
                'notes' => $notes,
                'paid_at' => now(),
            ]);
        }

        $order->update([
            'payment_status' => 'waiting_verification',
            'order_status' => 'waiting_verification',
        ]);

        return $payment;
    }

    public function verifyPayment(Payment $payment, int $adminId, bool $approved, ?string $notes = null): Payment
    {
        if ($payment->status !== 'waiting_verification') {
            throw new \Exception('Pembayaran tidak dapat diverifikasi pada status ini.');
        }

        if ($approved) {
            $payment->update([
                'status' => 'approved',
                'verified_at' => now(),
                'verified_by' => $adminId,
                'notes' => $notes,
            ]);

            $payment->order->update([
                'payment_status' => 'paid',
                'order_status' => 'processing',
                'paid_at' => now(),
            ]);
        } else {
            $payment->update([
                'status' => 'rejected',
                'verified_at' => now(),
                'verified_by' => $adminId,
                'notes' => $notes,
            ]);

            $payment->order->update([
                'payment_status' => 'rejected',
                'order_status' => 'pending_payment',
            ]);
        }

        return $payment;
    }
}