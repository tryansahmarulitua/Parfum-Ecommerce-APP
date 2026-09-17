<?php

namespace App\Http\Controllers;

use App\Models\BankAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class BankAccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = BankAccount::query();

        if ($request->has('active_only') && $request->boolean('active_only')) {
            $query->where('is_active', true);
        }

        $accounts = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $accounts,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if (Auth::user()?->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $data = $request->validate([
            'bank_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:100',
            'account_name' => 'required|string|max:255',
            'type' => 'required|in:bank,e_wallet',
            'qr_code' => 'nullable|image|max:10240',
            'instructions' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('qr_code')) {
            $file = $request->file('qr_code');
            $filename = 'qr_' . time() . '.' . strtolower($file->getClientOriginalExtension() ?: 'jpg');
            $path = $file->storeAs('bank-qrs', $filename, 'public');
            $data['qr_code'] = 'storage/' . $path;
        }

        $bankAccount = BankAccount::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Akun bank/e-wallet berhasil ditambahkan.',
            'data' => $bankAccount,
        ], 201);
    }

    public function update(Request $request, BankAccount $bankAccount): JsonResponse
    {
        if (Auth::user()?->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $data = $request->validate([
            'bank_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:100',
            'account_name' => 'required|string|max:255',
            'type' => 'required|in:bank,e_wallet',
            'qr_code' => 'nullable|image|max:10240',
            'instructions' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('qr_code')) {
            $file = $request->file('qr_code');
            $filename = 'qr_' . time() . '.' . strtolower($file->getClientOriginalExtension() ?: 'jpg');
            $path = $file->storeAs('bank-qrs', $filename, 'public');
            $data['qr_code'] = 'storage/' . $path;
        }

        $bankAccount->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Akun bank/e-wallet berhasil diperbarui.',
            'data' => $bankAccount,
        ]);
    }

    public function destroy(BankAccount $bankAccount): JsonResponse
    {
        if (Auth::user()?->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        if ($bankAccount->qr_code) {
            $relativePath = str_replace('storage/', '', $bankAccount->qr_code);
            Storage::disk('public')->delete($relativePath);
        }

        $bankAccount->delete();

        return response()->json([
            'success' => true,
            'message' => 'Akun bank/e-wallet berhasil dihapus.',
        ]);
    }

    public function toggleStatus(BankAccount $bankAccount): JsonResponse
    {
        if (Auth::user()?->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $bankAccount->update([
            'is_active' => !$bankAccount->is_active,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status akun bank berhasil diubah.',
            'data' => $bankAccount,
        ]);
    }
}
