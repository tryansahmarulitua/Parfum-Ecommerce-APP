<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\VoucherResource;
use App\Models\Voucher;
use App\Services\VoucherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    public function validateVoucher(Request $request, VoucherService $voucherService): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'total' => 'required|numeric|min:0',
        ]);

        try {
            $discount = $voucherService->calculateDiscount($request->code, (float) $request->total);

            return response()->json([
                'success' => true,
                'discount' => $discount,
                'message' => 'Voucher berhasil digunakan.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function index(Request $request): JsonResponse
    {
        $vouchers = Voucher::query()
            ->when($request->has('is_active'), fn($q) => $q->where('is_active', $request->boolean('is_active')))
            ->latest()
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => VoucherResource::collection($vouchers),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|max:50|unique:vouchers,code',
            'name' => 'required|string|max:150',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'quota' => 'nullable|integer|min:0',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
            'is_active' => 'boolean',
        ]);

        $voucher = Voucher::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Voucher berhasil ditambahkan.',
            'data' => new VoucherResource($voucher),
        ], 201);
    }

    public function update(Request $request, Voucher $voucher): JsonResponse
    {
        $request->validate([
            'code' => 'sometimes|string|max:50|unique:vouchers,code,' . $voucher->id,
            'name' => 'sometimes|string|max:150',
            'type' => 'sometimes|in:percentage,fixed',
            'value' => 'sometimes|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'quota' => 'nullable|integer|min:0',
            'start_at' => 'sometimes|date',
            'end_at' => 'sometimes|date|after:start_at',
            'is_active' => 'boolean',
        ]);

        $voucher->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Voucher berhasil diperbarui.',
            'data' => new VoucherResource($voucher),
        ]);
    }

    public function destroy(Voucher $voucher): JsonResponse
    {
        $voucher->delete();

        return response()->json([
            'success' => true,
            'message' => 'Voucher berhasil dihapus.',
        ]);
    }
}