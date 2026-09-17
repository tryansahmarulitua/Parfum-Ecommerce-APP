<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

// Public routes
Route::prefix('v1')->group(function () {

    // Auth
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    // Public product browsing
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    Route::get('/brands', [BrandController::class, 'index']);
    Route::get('/brands/{brand}', [BrandController::class, 'show']);
    Route::get('/banners', [BannerController::class, 'index']);
    Route::get('/products/{productId}/reviews', [ReviewController::class, 'index']);
    Route::get('/bank-accounts', [\App\Http\Controllers\BankAccountController::class, 'index']);
    Route::get('/settings', [\App\Http\Controllers\Api\AdminSettingController::class, 'getSettings']);
    Route::post('/payment/notification', [PaymentController::class, 'notification']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
        Route::match(['post', 'put'], '/user/profile', [AuthController::class, 'updateProfile']);
        Route::post('/email/verification-notification', [AuthController::class, 'resendVerificationEmail'])->middleware('throttle:6,1')->name('verification.send');

        // Cart
        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart', [CartController::class, 'addItem']);
        Route::post('/cart/items', [CartController::class, 'addItem']);
        Route::put('/cart/{id}', [CartController::class, 'updateItem']);
        Route::put('/cart/items/{id}', [CartController::class, 'updateItem']);
        Route::delete('/cart/{id}', [CartController::class, 'removeItem']);
        Route::delete('/cart/items/{id}', [CartController::class, 'removeItem']);

        // Wishlist
        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist', [WishlistController::class, 'add']);
        Route::delete('/wishlist/{productId}', [WishlistController::class, 'remove']);

        // Addresses
        Route::get('/addresses', [AddressController::class, 'index']);
        Route::post('/addresses', [AddressController::class, 'store']);
        Route::put('/addresses/{address}', [AddressController::class, 'update']);
        Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);

        // Orders
        Route::get('/orders', [OrderController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);

        // Payment
        Route::get('/orders/{order}/payment', [PaymentController::class, 'getPayment']);
        Route::post('/orders/{order}/payment/proof', [PaymentController::class, 'uploadProof']);
        Route::get('/orders/{order}/snap-token', [PaymentController::class, 'getSnapToken']);
        Route::post('/orders/{order}/sync-payment', [PaymentController::class, 'syncStatus']);

        // Vouchers
        Route::post('/vouchers/validate', [VoucherController::class, 'validateVoucher']);

        // Reviews
        Route::post('/products/{productId}/reviews', [ReviewController::class, 'store']);

        // Admin routes
        Route::middleware('admin')->prefix('admin')->group(function () {
            // Products management
            Route::post('/products', [ProductController::class, 'store']);
            Route::match(['post', 'put'], '/products/{product}', [ProductController::class, 'update']);
            Route::delete('/products/images/{image}', [ProductController::class, 'deleteImage']);
            Route::delete('/products/{product}', [ProductController::class, 'destroy']);

            // Categories management
            Route::post('/categories', [CategoryController::class, 'store']);
            Route::put('/categories/{category}', [CategoryController::class, 'update']);
            Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

            // Brands management
            Route::post('/brands', [BrandController::class, 'store']);
            Route::put('/brands/{brand}', [BrandController::class, 'update']);
            Route::delete('/brands/{brand}', [BrandController::class, 'destroy']);

            // Order management
            Route::get('/orders', [OrderController::class, 'adminIndex']);
            Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus']);

            // Payment verification
            Route::post('/payments/{paymentId}/verify', [PaymentController::class, 'verify']);

            // Users management
            Route::get('/users', [UserController::class, 'index']);
            Route::get('/users/{user}', [UserController::class, 'show']);
            Route::put('/users/{user}/toggle-status', [UserController::class, 'toggleStatus']);

            // Vouchers
            Route::get('/vouchers', [VoucherController::class, 'index']);
            Route::post('/vouchers', [VoucherController::class, 'store']);
            Route::put('/vouchers/{voucher}', [VoucherController::class, 'update']);
            Route::delete('/vouchers/{voucher}', [VoucherController::class, 'destroy']);

            // Banners
            Route::post('/banners', [BannerController::class, 'store']);
            Route::put('/banners/{banner}', [BannerController::class, 'update']);
            Route::delete('/banners/{banner}', [BannerController::class, 'destroy']);

            // Reviews management
            Route::put('/reviews/{review}/toggle-visibility', [ReviewController::class, 'toggleVisibility']);
            Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);

            // Bank Accounts management
            Route::get('/bank-accounts', [\App\Http\Controllers\BankAccountController::class, 'index']);
            Route::post('/bank-accounts', [\App\Http\Controllers\BankAccountController::class, 'store']);
            Route::match(['post', 'put'], '/bank-accounts/{bankAccount}', [\App\Http\Controllers\BankAccountController::class, 'update']);
            Route::delete('/bank-accounts/{bankAccount}', [\App\Http\Controllers\BankAccountController::class, 'destroy']);
            Route::put('/bank-accounts/{bankAccount}/toggle-status', [\App\Http\Controllers\BankAccountController::class, 'toggleStatus']);

            // Reports
            Route::get('/reports/dashboard', [ReportController::class, 'dashboard']);
            Route::get('/reports/sales', [ReportController::class, 'sales']);
            Route::get('/reports/top-products', [ReportController::class, 'topProducts']);

            // Settings
            Route::get('/settings', [\App\Http\Controllers\Api\AdminSettingController::class, 'getSettings']);
            Route::match(['post', 'put'], '/settings', [\App\Http\Controllers\Api\AdminSettingController::class, 'updateSettings']);
            Route::post('/profile', [\App\Http\Controllers\Api\AdminSettingController::class, 'updateProfile']);
            Route::put('/password', [\App\Http\Controllers\Api\AdminSettingController::class, 'updatePassword']);
        });
    });
});