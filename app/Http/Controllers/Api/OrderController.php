<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\OrderRequest;
use App\Http\Resources\Api\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function __construct(private OrderService $orderService) {}

    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', Auth::id())
            ->with(['items', 'payment', 'address'])
            ->when($request->order_status, fn($q) => $q->where('order_status', $request->order_status))
            ->when($request->payment_status, fn($q) => $q->where('payment_status', $request->payment_status))
            ->latest()
            ->paginate($request->get('per_page', 15));

        foreach ($orders as $order) {
            $order->checkAndProcessExpiration();
        }

        return response()->json([
            'success' => true,
            'data' => OrderResource::collection($orders),
        ]);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $orders = Order::query()
            ->with(['items', 'payment', 'address', 'user'])
            ->when($request->order_status, fn($q) => $q->where('order_status', $request->order_status))
            ->when($request->payment_status, fn($q) => $q->where('payment_status', $request->payment_status))
            ->latest()
            ->paginate($request->get('per_page', 15));

        foreach ($orders as $order) {
            $order->checkAndProcessExpiration();
        }

        return response()->json([
            'success' => true,
            'data' => OrderResource::collection($orders),
        ]);
    }

    public function store(OrderRequest $request): JsonResponse
    {
        try {
            $order = $this->orderService->createOrder(
                Auth::user(),
                $request->address_id,
                $request->payment_method,
                $request->voucher_code,
                $request->notes
            );

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat.',
                'data' => new OrderResource($order->load(['items', 'payment', 'address'])),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function show(Order $order): JsonResponse
    {
        if ($order->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $order->load(['items.product.images', 'payment', 'address', 'voucher']);
        $order->checkAndProcessExpiration();

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order),
        ]);
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'order_status' => 'required|in:pending_payment,waiting_verification,processing,packed,shipped,completed,cancelled',
            'tracking_number' => 'nullable|string|max:100',
            'shipping_courier' => 'nullable|string|max:100',
        ]);

        try {
            $this->orderService->updateOrderStatus($order, $request->order_status);
            
            if ($request->tracking_number) {
                $order->update(['tracking_number' => $request->tracking_number]);
            }
            if ($request->shipping_courier) {
                $order->update(['shipping_courier' => $request->shipping_courier]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Status pesanan berhasil diperbarui.',
                'data' => new OrderResource($order->load(['items', 'payment', 'address'])),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}