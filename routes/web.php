<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes (Inertia SPA Pages)
|--------------------------------------------------------------------------
*/

// Public Pages
Route::get('/', fn() => Inertia::render('welcome'))->name('home');
Route::get('/login', fn() => Inertia::render('auth/login'))->name('login');
Route::get('/register', fn() => Inertia::render('auth/register'))->name('register');
Route::get('/forgot-password', fn() => Inertia::render('auth/forgot-password'))->name('password.request');
Route::get('/verify-email', fn() => Inertia::render('auth/verify-email'))->name('verification.notice');
Route::get('/email/verify/{id}/{hash}', function (\Illuminate\Http\Request $request, $id, $hash) {
    $user = \App\Models\User::findOrFail($id);

    if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
        return redirect('/verify-email?error=invalid');
    }

    if ($user->hasVerifiedEmail()) {
        return redirect('/verify-email?status=already-verified');
    }

    if ($user->markEmailAsVerified()) {
        event(new \Illuminate\Auth\Events\Verified($user));
    }

    return redirect('/verify-email?status=verified');
})->middleware(['signed'])->name('verification.verify');

Route::get('/products', fn() => Inertia::render('user/products'))->name('products.index');
Route::get('/products/{id}', fn($id) => Inertia::render('user/product-detail', ['id' => $id]))->name('products.show');
Route::get('/categories', fn() => redirect('/products'))->name('categories.index');
Route::get('/about', function () {
    return Inertia::render('about', [
        'initialSettings' => \App\Models\Setting::all()->pluck('value', 'key'),
    ]);
})->name('about');

// Protected User Pages
Route::get('/cart', fn() => Inertia::render('user/cart'))->name('cart');
Route::get('/checkout', fn() => Inertia::render('user/checkout'))->name('checkout');
Route::get('/orders', fn() => Inertia::render('user/orders'))->name('orders.index');
Route::get('/orders/{id}', fn($id) => Inertia::render('user/order-detail', ['id' => $id]))->name('orders.show');
Route::get('/wishlist', fn() => Inertia::render('user/wishlist'))->name('wishlist');
Route::get('/profile', fn() => Inertia::render('user/profile'))->name('profile');
Route::get('/settings', fn() => Inertia::render('user/settings'))->name('settings');

// Admin Pages
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('admin/dashboard', [
            'initialStats' => [
                'products' => \App\Models\Product::count(),
                'users' => \App\Models\User::where('role', 'user')->count(),
                'orders' => \App\Models\Order::count(),
                'revenue' => (float) \App\Models\Order::where('payment_status', 'paid')->sum('total'),
            ],
        ]);
    })->name('dashboard');
    Route::get('/products', fn() => Inertia::render('admin/products'))->name('products');
    Route::get('/orders', fn() => Inertia::render('admin/orders'))->name('orders');
    Route::get('/categories', function () {
        return Inertia::render('admin/categories', [
            'initialCategories' => \App\Models\Category::withCount('products')->latest()->get(),
        ]);
    })->name('categories');
    Route::get('/brands', function () {
        return Inertia::render('admin/brands', [
            'initialBrands' => \App\Models\Brand::withCount('products')->latest()->get(),
        ]);
    })->name('brands');
    Route::get('/users', function () {
        return Inertia::render('admin/users', [
            'initialUsers' => \App\Models\User::where('role', 'user')->latest()->get(),
        ]);
    })->name('users');
    Route::get('/vouchers', function () {
        return Inertia::render('admin/vouchers', [
            'initialVouchers' => \App\Models\Voucher::latest()->get(),
        ]);
    })->name('vouchers');
    Route::get('/banners', function () {
        return Inertia::render('admin/banners', [
            'initialBanners' => \App\Models\Banner::orderBy('sort_order')->latest()->get(),
        ]);
    })->name('banners');
    Route::get('/reviews', function () {
        return Inertia::render('admin/reviews', [
            'initialReviews' => \App\Models\Review::with(['user', 'product'])->latest()->get(),
        ]);
    })->name('reviews');
    Route::get('/bank-accounts', function () {
        return Inertia::render('admin/bank-accounts', [
            'initialAccounts' => \App\Models\BankAccount::latest()->get(),
        ]);
    })->name('bank-accounts');
    Route::get('/settings', fn() => Inertia::render('admin/settings'))->name('settings');
    Route::get('/reports', function (\Illuminate\Http\Request $request) {
        $startDate = $request->get('start_date', now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->get('end_date', now()->format('Y-m-d'));

        $sales = \App\Models\Order::whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->where('payment_status', 'paid')
            ->select(
                \Illuminate\Support\Facades\DB::raw('DATE(created_at) as date'),
                \Illuminate\Support\Facades\DB::raw('COUNT(*) as total_transactions'),
                \Illuminate\Support\Facades\DB::raw('SUM(total) as total_revenue')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $monthlySales = \App\Models\Order::where('payment_status', 'paid')
            ->select(
                \Illuminate\Support\Facades\DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                \Illuminate\Support\Facades\DB::raw('COUNT(*) as total_transactions'),
                \Illuminate\Support\Facades\DB::raw('SUM(total) as total_revenue')
            )
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();

        $topProducts = \App\Models\OrderItem::select(
                'product_id',
                'product_name',
                \Illuminate\Support\Facades\DB::raw('SUM(quantity) as total_sold'),
                \Illuminate\Support\Facades\DB::raw('SUM(subtotal) as total_revenue')
            )
            ->whereHas('order', fn($q) => $q->where('payment_status', 'paid'))
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        return Inertia::render('admin/reports', [
            'initialSales' => $sales,
            'initialMonthlySales' => $monthlySales,
            'initialTopProducts' => $topProducts,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'summary' => [
                'total_revenue' => (float) $sales->sum('total_revenue'),
                'total_transactions' => (int) $sales->sum('total_transactions'),
            ]
        ]);
    })->name('reports');
});
