<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;

class MidtransService
{
    protected string $serverKey;
    protected bool $isProduction;
    protected string $baseUrl;

    public function __construct()
    {
        $this->serverKey = config('services.midtrans.server_key', '');
        $this->isProduction = config('services.midtrans.is_production', false);
        $this->baseUrl = $this->isProduction 
            ? 'https://app.midtrans.com/snap/v1/transactions' 
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    }

    public function getSnapToken(Order $order): string
    {
        $midtransOrderId = $order->order_number . '-' . time();

        $payload = [
            'transaction_details' => [
                'order_id' => $midtransOrderId,
                'gross_amount' => (int) $order->total,
            ],
            'customer_details' => [
                'first_name' => $order->user->name ?? 'Customer',
                'email' => $order->user->email ?? '',
                'phone' => $order->address->phone ?? '',
            ],
            'item_details' => $order->items->map(function ($item) {
                return [
                    'id' => $item->product_id,
                    'price' => (int) ($item->subtotal / max(1, $item->quantity)),
                    'quantity' => $item->quantity,
                    'name' => mb_substr($item->product_name, 0, 50),
                ];
            })->toArray(),
        ];

        $response = Http::withBasicAuth($this->serverKey, '')
            ->post($this->baseUrl, $payload);

        if ($response->failed()) {
            throw new \Exception('Gagal membuat Midtrans Snap Token: ' . $response->body());
        }

        $order->payment()->where('status', 'pending')->update([
            'notes' => $midtransOrderId,
        ]);

        return $response->json('token');
    }

    public function checkStatus(Order $order): void
    {
        $payment = $order->payment()->latest()->first();
        $candidates = array_unique(array_filter([
            $payment?->notes,
            $order->order_number,
        ]));

        $lastResponse = null;

        foreach ($candidates as $orderId) {
            $statusUrl = $this->isProduction
                ? "https://api.midtrans.com/v2/{$orderId}/status"
                : "https://api.sandbox.midtrans.com/v2/{$orderId}/status";

            $response = Http::withBasicAuth($this->serverKey, '')->get($statusUrl);
            $lastResponse = $response;

            if ($response->successful()) {
                $this->handleNotification($response->json());
                return;
            }
        }

        if ($lastResponse && $lastResponse->failed()) {
            throw new \Exception('Midtrans API status check gagal: ' . ($lastResponse->json('status_message') ?? $lastResponse->body()));
        }

        throw new \Exception('Transaksi tidak ditemukan di Midtrans untuk order ini.');
    }

    public function handleNotification(array $notification): void
    {
        $orderId = $notification['order_id'] ?? null;
        if (!$orderId) {
            return;
        }

        // Validate signature key if present (webhook call)
        if (isset($notification['signature_key']) && isset($notification['status_code']) && isset($notification['gross_amount'])) {
            $statusCode = $notification['status_code'];
            $grossAmount = $notification['gross_amount'];
            $serverKey = $this->serverKey;
            $inputSignature = $notification['signature_key'];

            $mySignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

            if ($inputSignature !== $mySignature) {
                throw new \Exception('Invalid signature key');
            }
        }

        // Order number match (handles ORD-20260917-00001-1726589123)
        $order = Order::where('order_number', $orderId)->first();
        if (!$order) {
            $cleanOrderNumber = preg_replace('/-\d+$/', '', $orderId);
            $order = Order::where('order_number', $cleanOrderNumber)->first();
        }

        if (!$order) {
            return;
        }

        $transactionStatus = $notification['transaction_status'] ?? '';
        $fraudStatus = $notification['fraud_status'] ?? null;

        $paymentStatus = 'pending';
        $orderStatus = $order->order_status;

        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'challenge') {
                $paymentStatus = 'waiting_verification';
            } else if ($fraudStatus == 'accept') {
                $paymentStatus = 'paid';
                $orderStatus = 'processing';
            }
        } else if ($transactionStatus == 'settlement') {
            $paymentStatus = 'paid';
            $orderStatus = 'processing';
        } else if ($transactionStatus == 'pending') {
            $paymentStatus = 'pending';
        } else if ($transactionStatus == 'expire') {
            $paymentStatus = 'expired';
            $orderStatus = 'cancelled';
        } else if ($transactionStatus == 'deny' || $transactionStatus == 'cancel') {
            $paymentStatus = 'rejected';
            $orderStatus = 'cancelled';
        }

        $updateData = [
            'payment_status' => $paymentStatus,
            'order_status' => $orderStatus,
        ];

        if ($paymentStatus === 'paid') {
            $updateData['paid_at'] = now();
        }
        if ($orderStatus === 'cancelled') {
            $updateData['cancelled_at'] = now();
        }

        $order->update($updateData);

        $order->payment()->update([
            'status' => $paymentStatus === 'paid' ? 'approved' : (in_array($paymentStatus, ['rejected', 'expired']) ? 'rejected' : 'pending'),
            'paid_at' => $paymentStatus === 'paid' ? now() : null,
        ]);
    }
}
