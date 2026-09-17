import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import { useAuth } from '@/contexts/AuthContext';
import LockedState from '@/components/common/LockedState';
import api from '@/services/api';
import { Cart, Address } from '@/types';

const fmt = (x: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(x);

export default function Checkout() {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState<Cart | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [addressId, setAddressId] = useState<number | ''>('');
    const [voucherCode, setVoucherCode] = useState('');
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('midtrans');
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [storeWa, setStoreWa] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) return;
        api.get('/cart').then(r => setCart(r.data.data));
        api.get('/addresses').then(r => { setAddresses(r.data.data); if (r.data.data.length) setAddressId(r.data.data[0].id); });
        api.get('/bank-accounts?active_only=1').then(r => setBankAccounts(r.data.data || []));
        api.get('/settings').then(r => {
            const s = r.data.data || {};
            const num = (s.social_whatsapp || s.store_phone || '').replace(/[^0-9]/g, '');
            setStoreWa(num);
        });
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <UserLayout>
                <Head title="Checkout" />
                <LockedState
                    title="Checkout Terkunci"
                    description="Silakan masuk ke akun Anda terlebih dahulu untuk melanjutkan pembayaran."
                />
            </UserLayout>
        );
    }

    const total = cart?.items?.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0) ?? 0;
    const grandTotal = Math.max(0, total - voucherDiscount);

    const applyVoucher = async () => {
        try {
            const res = await api.post('/vouchers/validate', { code: voucherCode, total });
            setVoucherDiscount(res.data.discount);
        } catch { setError('Invalid voucher code'); }
    };

    const placeOrder = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/orders', {
                address_id: addressId,
                voucher_code: voucherCode || undefined,
                payment_method: paymentMethod,
            });
            router.visit(`/orders/${res.data.data.id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Order failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserLayout>
            <Head title="Checkout" />
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <h2 className="font-semibold mb-2">Shipping Address</h2>
                        {addresses.length === 0 ? (
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
                                <p className="mb-2">Anda belum memiliki alamat pengiriman.</p>
                                <a href="/settings" className="text-purple-700 font-semibold underline">Tambah Alamat di Pengaturan</a>
                            </div>
                        ) : (
                            addresses.map(a => (
                                <label key={a.id} className={`block border rounded-lg p-3 mb-2 cursor-pointer ${addressId === a.id ? 'border-purple-600 bg-purple-50' : ''}`}>
                                    <input type="radio" name="address" value={a.id} checked={addressId === a.id}
                                        onChange={() => setAddressId(a.id)} className="mr-2" />
                                    {a.label} — {a.address}, {a.city}
                                </label>
                            ))
                        )}
                    </div>
                    <div>
                        <h2 className="font-semibold mb-2">Voucher</h2>
                        <div className="flex gap-2">
                            <input value={voucherCode} onChange={e => setVoucherCode(e.target.value)}
                                placeholder="Enter code" className="flex-1 border rounded-lg px-3 py-2" />
                            <button onClick={applyVoucher} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">Apply</button>
                        </div>
                        {voucherDiscount > 0 && <p className="text-green-600 text-sm mt-1">Discount: {fmt(voucherDiscount)}</p>}
                    </div>
                    <div>
                        <h2 className="font-semibold mb-2">Payment Method</h2>
                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2">
                            <option value="midtrans">Midtrans Payment Gateway (QRIS, VA, E-Wallet, Card)</option>
                            {bankAccounts.some(b => b.type === 'bank') && (
                                <option value="bank_transfer">Bank Transfer (Manual Verification)</option>
                            )}
                            {bankAccounts.some(b => b.type === 'e_wallet') && (
                                <option value="e_wallet">E-Wallet (Manual Verification)</option>
                            )}
                            <option value="cod">Cash on Delivery</option>
                        </select>
                        {(paymentMethod === 'bank_transfer' || paymentMethod === 'e_wallet') && (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 space-y-2">
                                <p className="font-bold text-red-600">⏱️ Batas Upload Bukti Bayar: 30 Menit</p>
                                <p>Harap upload bukti pembayaran dalam waktu 30 menit setelah checkout. Jika melewati 30 menit, pesanan otomatis expired/batal.</p>
                                <div className="border-t border-amber-200 pt-2 space-y-1">
                                    <p className="font-bold">Rekening & Akun Tujuan:</p>
                                    {bankAccounts
                                        .filter(b => paymentMethod === 'bank_transfer' ? b.type === 'bank' : b.type === 'e_wallet')
                                        .map(b => (
                                            <div key={b.id} className="bg-white p-2 rounded border border-amber-200">
                                                <p className="font-bold">{b.bank_name}</p>
                                                <p className="font-mono">{b.account_number} a.n. {b.account_name}</p>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                        {paymentMethod === 'cod' && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded-lg text-xs text-green-900 space-y-2">
                                <p className="font-bold">🚚 Konfirmasi Metode COD</p>
                                <p>Untuk metode COD (Cash on Delivery), Anda harus melakukan konfirmasi langsung ke Admin melalui WhatsApp dengan pesan:</p>
                                <p className="font-bold bg-white p-2 rounded border border-green-200 text-green-800 italic font-mono">"Saya ingin melakukan metode COD apakah bisa?"</p>
                                {storeWa && (
                                    <a
                                        href={`https://wa.me/${storeWa}?text=${encodeURIComponent('Saya ingin melakukan metode COD apakah bisa?')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-block bg-green-600 text-white font-bold px-3 py-1.5 rounded hover:bg-green-700 transition"
                                    >
                                        Chat Admin via WhatsApp →
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="font-semibold mb-2">Order Summary</h2>
                    {cart?.items?.map(i => (
                        <div key={i.id} className="flex justify-between py-2 border-b">
                            <span>{i.product?.name} × {i.quantity}</span>
                            <span>{fmt((i.price ?? 0) * i.quantity)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between py-2">
                        <span>Subtotal</span><span>{fmt(total)}</span>
                    </div>
                    {voucherDiscount > 0 && (
                        <div className="flex justify-between py-2 text-green-600">
                            <span>Discount</span><span>-{fmt(voucherDiscount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-2 font-bold text-lg">
                        <span>Total</span><span className="text-purple-700">{fmt(grandTotal)}</span>
                    </div>
                    <button onClick={placeOrder} disabled={loading || !addressId}
                        className="w-full mt-4 bg-purple-700 text-white font-semibold py-3 rounded-lg hover:bg-purple-800 disabled:opacity-50">
                        {loading ? 'Placing order...' : 'Place Order'}
                    </button>
                </div>
            </div>
        </UserLayout>
    );
}
