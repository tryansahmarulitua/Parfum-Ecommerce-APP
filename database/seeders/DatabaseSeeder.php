<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Banner;
use App\Models\Brand;
use App\Models\Cart;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Review;
use App\Models\Setting;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'Admin ParfumStore',
            'email' => 'admin@parfumstore.com',
            'phone' => '081234567890',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        // Create Default Settings
        Setting::create([
            'key' => 'store_name',
            'value' => 'Toko Parfum',
            'type' => 'string',
        ]);
        Setting::create([
            'key' => 'store_email',
            'value' => 'info@parfumstore.com',
            'type' => 'string',
        ]);
        Setting::create([
            'key' => 'store_phone',
            'value' => '081234567890',
            'type' => 'string',
        ]);
        Setting::create([
            'key' => 'store_address',
            'value' => 'Jl. Merdeka No.1',
            'type' => 'string',
        ]);
        Setting::create([
            'key' => 'about_us',
            'value' => 'Kami menyediakan berbagai koleksi parfum autentik terbaik dari brand lokal dan internasional.',
            'type' => 'string',
        ]);
        Setting::create([
            'key' => 'footer_text',
            'value' => '© 2026 ParfumStore. Hak Cipta Dilindungi.',
            'type' => 'string',
        ]);
        Setting::create([
            'key' => 'owner_name',
            'value' => 'Nama Pemilik',
            'type' => 'string',
        ]);
        Setting::create([
            'key' => 'owner_role',
            'value' => 'Founder & CEO ParfumStore',
            'type' => 'string',
        ]);
        Setting::create([
            'key' => 'owner_bio',
            'value' => 'Berpengalaman lebih dari 5 tahun di industri parfum dan kosmetik. Memiliki keahlian dalam kurasi wewangian dan membangun brand yang berfokus pada kepuasan pelanggan.',
            'type' => 'string',
        ]);
    }
}
