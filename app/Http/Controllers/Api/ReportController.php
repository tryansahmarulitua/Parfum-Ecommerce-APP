<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $ninetyDaysAgo = now()->subDays(90)->startOfDay();

        $userStats = User::where('created_at', '>=', $ninetyDaysAgo)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw("SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active"),
                DB::raw("SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive")
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_products' => Product::count(),
                'total_users' => User::where('role', 'user')->count(),
                'total_orders' => Order::count(),
                'new_orders' => Order::where('order_status', 'pending_payment')->count(),
                'processing_orders' => Order::where('order_status', 'processing')->count(),
                'total_revenue' => (float) Order::where('payment_status', 'paid')->sum('total'),
                'products_sold' => OrderItem::whereHas('order', fn($q) => $q->where('payment_status', 'paid'))->sum('quantity'),
                'user_chart' => $userStats,
            ],
        ]);
    }

    public function sales(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = $request->start_date . ' 00:00:00';
        $endDate = $request->end_date . ' 23:59:59';

        $sales = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total_transactions'),
                DB::raw('SUM(total) as total_revenue')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $monthlySales = Order::where('payment_status', 'paid')
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('COUNT(*) as total_transactions'),
                DB::raw('SUM(total) as total_revenue')
            )
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();

        $totalProductsSold = OrderItem::whereHas('order', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate, $endDate])
                  ->where('payment_status', 'paid');
            })
            ->sum('quantity');

        return response()->json([
            'success' => true,
            'data' => [
                'sales' => $sales,
                'monthly_sales' => $monthlySales,
                'total_products_sold' => (int) $totalProductsSold,
                'total_revenue' => (float) $sales->sum('total_revenue'),
                'total_transactions' => (int) $sales->sum('total_transactions'),
            ],
        ]);
    }

    public function topProducts(Request $request): JsonResponse
    {
        $request->validate([
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $topProducts = OrderItem::select(
                'product_id',
                'product_name',
                DB::raw('SUM(quantity) as total_sold'),
                DB::raw('SUM(subtotal) as total_revenue')
            )
            ->whereHas('order', fn($q) => $q->where('payment_status', 'paid'))
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_sold')
            ->limit($request->get('limit', 10))
            ->get();

        return response()->json([
            'success' => true,
            'data' => $topProducts,
        ]);
    }
}