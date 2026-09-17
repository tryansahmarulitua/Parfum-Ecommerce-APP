<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\PaymentProofRequest;
use App\Http\Resources\Api\OrderResource;
use App\Http\Resources\Api\PaymentResource;
use App\Models\Order;
use App\Services\MidtransService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
        private MidtransService $midtransService
    ) {}

    public function getPayment(Order $order): JsonResponse
    {
        if ($order->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => PaymentResource::collection($order->payment),
        ]);
    }

    public function uploadProof(Order $order, PaymentProofRequest $request): JsonResponse
    {
        if ($order->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        try {
            $payment = $this->paymentService->uploadProof(
                $order,
                $request->payment_method,
                $request->amount,
                $request->file('proof'),
                $request->notes
            );

            return response()->json([
                'success' => true,
                'message' => 'Bukti pembayaran berhasil diupload.',
                'data' => new PaymentResource($payment),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function verify(int $paymentId): JsonResponse
    {
        $payment = \App\Models\Payment::findOrFail($paymentId);

        if (Auth::user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        try {
            $approved = request()->boolean('approved');
            $payment = $this->paymentService->verifyPayment(
                $payment,
                Auth::id(),
                $approved,
                request('notes')
            );

            return response()->json([
                'success' => true,
                'message' => $approved ? 'Pembayaran disetujui.' : 'Pembayaran ditolak.',
                'data' => new PaymentResource($payment),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function getSnapToken(Order $order): JsonResponse
    {
        if ($order->user_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        try {
            $token = $this->midtransService->getSnapToken($order);

            return response()->json([
                'success' => true,
                'data' => [
                    'token' => $token,
                    'client_key' => config('services.midtrans.client_key'),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function notification(Request $request): JsonResponse
    {
        try {
            $this->midtransService->handleNotification($request->all());

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function syncStatus(Order $order, Request $request): JsonResponse
    {
        if ($order->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        try {
            if ($request->has('transaction_status') || $request->has('order_id')) {
                $this->midtransService->handleNotification($request->all());
            } else {
                $this->midtransService->checkStatus($order);
            }

            return response()->json([
                'success' => true,
                'data' => new OrderResource($order->fresh(['items', 'payment', 'address'])),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}