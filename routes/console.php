<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('orders:cancel-expired', function () {
    $orders = \App\Models\Order::where('payment_status', 'pending')
        ->where('order_status', 'pending_payment')
        ->where('created_at', '<=', now()->subMinutes(30))
        ->get();

    $count = 0;
    foreach ($orders as $order) {
        $order->checkAndProcessExpiration();
        $count++;
    }

    $this->info("Berhasil memeriksa dan membatalkan {$count} pesanan kadaluarsa.");
})->purpose('Membatalkan pesanan manual payment yang melewati batas waktu 30 menit');

Schedule::command('orders:cancel-expired')->everyMinute();
