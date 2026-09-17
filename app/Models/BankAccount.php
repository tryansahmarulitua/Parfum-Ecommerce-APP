<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'bank_name', 'account_number', 'account_name', 'type', 'qr_code', 'instructions', 'is_active'
])]
class BankAccount extends Model
{
    protected $table = 'bank_accounts';
}
