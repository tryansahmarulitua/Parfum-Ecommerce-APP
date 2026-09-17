import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import api from '@/services/api';
import { Order } from '@/types';

const fmt = (x: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(x);

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetail({ id }: { id: number }) {
    const [order, setOrder] = useState<any | null>(null);
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [storeWa, setStoreWa] = useState('');
    const [payLoading, setPayLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [uploadingProof, setUploadingProof] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const fetchOrder = () => {
        api.get(`/orders/${id}`).then(r => setOrder(r.data.data));
    };

    useEffect(() => {
        fetchOrder();
        api.get('/bank-accounts?active_only=1').then(r => setBankAccounts(r.data.data || []));
        api.get('/settings').then(r => {
            const s = r.data.data || {};
            const num = (s.social_whatsapp || s.store_phone || '').replace(/[^0-9]/g, '');
            setStoreWa(num);
        });
    }, [id]);

    useEffect(() => {
        if (!order || !order.expires_at || order.payment_status !== 'pending') {
            setTimeLeft(null);
            return;
        }

        const calcTime = () => {
            const expTime = new Date(order.expires_at).getTime();
            const now = new Date().getTime();
            const diff = Math.floor((expTime - now) / 1000);

            if (diff <= 0) {
                setTimeLeft(0);
                fetchOrder();
            } else {
                setTimeLeft(diff);
            }
        };

        calcTime();
        const timer = setInterval(calcTime, 1000);
        return () => clearInterval(timer);
    }, [order]);

    const checkPaymentStatus = async () => {
        setCheckingStatus(true);
        try {
            const res = await api.post(`/orders/${id}/sync-payment`);
            if (res.data?.data) {
                setOrder(res.data.data);
            }
        } catch (e: any) {
            alert(e.response?.data?.message || 'Gagal mengecek status pembayaran');
        } finally {
            setCheckingStatus(false);
        }
    };

    const syncPaymentStatus = async (result?: any) => {
        try {
            if (result) {
                const res = await api.post(`/orders/${id}/sync-payment`, result);
                if (res.data?.data) {
                    setOrder(res.data.data);
                    return;
                }
            }
        } catch {
            // fallback
        }
        api.get(`/orders/${id}`).then(r => setOrder(r.data.data));
    };

    const handleMidtransPay = async () => {
        setPayLoading(true);
        try {
            const res = await api.get(`/orders/${id}/snap-token`);
            const { token, client_key } = res.data.data;

            const scriptId = 'midtrans-script';
            if (!document.getElementById(scriptId)) {
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
                script.setAttribute('data-client-key', client_key);
                document.body.appendChild(script);
                await new Promise(resolve => { script.onload = resolve; });
            }

            if (window.snap) {
                window.snap.pay(token, {
                    onSuccess: (result) => {
                        syncPaymentStatus(result);
                    },
                    onPending: (result) => {
                        syncPaymentStatus(result);
                    },
                    onError: (result) => {
                        syncPaymentStatus(result);
                        alert('Pembayaran gagal.');
                    },
                    onClose: () => {
                        syncPaymentStatus();
                    }
                });
            }
        } catch (e: any) {
            alert(e.response?.data?.message || 'Gagal memproses pembayaran Midtrans');
        } finally {
            setPayLoading(false);
        }
    };

    const uploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !order) return;
        setUploadingProof(true);
        try {
            const form = new FormData();
            form.append('payment_method', order.payment_method === 'bank' ? 'bank_transfer' : order.payment_method);
            form.append('amount', order.total);
            form.append('proof', file);
            await api.post(`/orders/${id}/payment/proof`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
            fetchOrder();
            alert('Bukti pembayaran berhasil diupload!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal mengupload bukti pembayaran');
        } finally {
            setUploadingProof(false);
        }
    };

    if (!order) return <UserLayout><div className="p-10 text-center">Loading...</div></UserLayout>;

    const statusIdx = statuses.indexOf(order.order_status);

    return (
        <UserLayout>
            <Head title={`Order ${order.order_number}`} />
            <h1 className="text-2xl font-bold mb-6">Order {order.order_number}</h1>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h2 className="font-semibold mb-2">Items</h2>
                    {order.items?.map((i: any) => {
                        const imgUrl = i.product?.images?.[0]?.image ?? i.product?.images?.[0]?.url ?? i.product?.thumbnail ?? '/placeholder.png';
                        return (
                            <div key={i.id} className="flex gap-3 border-b py-3">
                                <img
                                    src={imgUrl}
                                    alt={i.product_name ?? i.product?.name ?? ''}
                                    onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                                    className="w-16 h-16 object-cover rounded-lg border"
                                />
                                <div className="flex-1">
                                    <p className="font-medium">{i.product_name ?? i.product?.name}</p>
                                    <p className="text-sm text-gray-500">{i.quantity} × {fmt(i.price)}</p>
                                </div>
                                <p className="font-semibold">{fmt(i.price * i.quantity)}</p>
                            </div>
                        );
                    })}
                    <div className="flex justify-between font-bold text-lg pt-3">
                        <span>Total</span><span className="text-purple-700">{fmt(order.total)}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h2 className="font-semibold mb-2">Shipping Address</h2>
                        <p className="text-sm text-gray-700">{order.address?.label}<br />
                            {order.address?.address}, {order.address?.city}, {order.address?.postal_code}</p>
                    </div>
                    <div>
                        <h2 className="font-semibold mb-2">Payment</h2>
                        <p className="text-sm">Method: {order.payment_method}</p>
                        <p className="text-sm">Status:
                            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {order.payment_status}
                            </span>
                        </p>
                        {order.payment?.[0]?.proof && (
                            <a href={order.payment[0].proof} target="_blank" rel="noreferrer"
                                className="text-purple-600 text-sm underline">View proof</a>
                        )}
                    </div>

                    <div>
                        <h2 className="font-semibold mb-2">Status Timeline</h2>
                        <div className="flex items-center">
                            {statuses.map((s, i) => (
                                <div key={s} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${i <= statusIdx ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                                        {i + 1}
                                    </div>
                                    {i < statuses.length - 1 && <div className={`w-8 h-1 ${i < statusIdx ? 'bg-purple-600' : 'bg-gray-200'}`} />}
                                </div>
                            ))}
                        </div>
                        <p className="text-sm mt-1 capitalize">{order.order_status}</p>
                    </div>

                    {order.payment_status !== 'paid' && (
                        <div className="space-y-4 pt-2 border-t">
                            {order.payment_method === 'midtrans' ? (
                                <div className="space-y-2">
                                    <h2 className="font-semibold mb-2">Pembayaran Online</h2>
                                    <button
                                        onClick={handleMidtransPay}
                                        disabled={payLoading}
                                        className="w-full bg-purple-700 text-white font-semibold py-2.5 rounded-lg hover:bg-purple-800 disabled:opacity-50 transition"
                                    >
                                        {payLoading ? 'Memuat Midtrans...' : 'Bayar Sekarang (Midtrans)'}
                                    </button>
                                    <button
                                        onClick={checkPaymentStatus}
                                        disabled={checkingStatus}
                                        className="w-full bg-gray-100 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-200 border text-sm transition"
                                    >
                                        {checkingStatus ? 'Mengecek...' : 'Cek Status Pembayaran'}
                                    </button>
                                </div>
                            ) : order.payment_method === 'cod' ? (
                                <div className="space-y-3 bg-green-50 border border-green-300 p-4 rounded-lg text-green-900">
                                    <h2 className="font-bold text-sm">🚚 Konfirmasi Pembayaran COD</h2>
                                    <p className="text-xs">
                                        Untuk metode COD (Cash on Delivery), Anda wajib melakukan konfirmasi langsung ke Admin melalui WhatsApp dengan pesan berikut:
                                    </p>
                                    <div className="bg-white p-3 rounded border border-green-200 text-xs font-mono font-bold text-green-800 italic">
                                        "Saya ingin melakukan metode COD apakah bisa?"
                                    </div>
                                    {storeWa ? (
                                        <a
                                            href={`https://wa.me/${storeWa}?text=${encodeURIComponent('Saya ingin melakukan metode COD apakah bisa?')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700 transition text-sm shadow"
                                        >
                                            <span>Konfirmasi ke WhatsApp Admin →</span>
                                        </a>
                                    ) : (
                                        <p className="text-xs text-red-600 font-bold">Nomor WhatsApp Admin belum dikonfigurasi di Pengaturan.</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="bg-amber-50 border border-amber-300 p-3 rounded-lg">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-xs text-amber-900 uppercase">Batas Waktu Pembayaran</span>
                                            {order.payment_status === 'expired' || timeLeft === 0 ? (
                                                <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">EXPIRED</span>
                                            ) : timeLeft !== null ? (
                                                <span className="font-mono font-bold text-red-600 text-sm">
                                                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="text-xs text-amber-800">Harap transfer dan upload bukti pembayaran sebelum waktu habis.</p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-sm mb-2">Informasi Rekening Tujuan:</h3>
                                        <div className="space-y-2">
                                            {bankAccounts
                                                .filter(b => order.payment_method === 'bank_transfer' ? b.type === 'bank' : b.type === 'e_wallet')
                                                .map(b => (
                                                    <div key={b.id} className="bg-gray-50 p-2.5 rounded-lg border text-sm space-y-1">
                                                        <p className="font-bold">{b.bank_name}</p>
                                                        <p className="font-mono text-purple-700 font-semibold">{b.account_number}</p>
                                                        <p className="text-xs text-gray-600">a.n. {b.account_name}</p>
                                                        {b.instructions && <p className="text-xs text-gray-500 italic mt-1">{b.instructions}</p>}
                                                        {b.qr_code && (
                                                            <div className="mt-2">
                                                                <a href={`/${b.qr_code}`} target="_blank" rel="noreferrer">
                                                                    <img src={`/${b.qr_code}`} alt="QRIS" className="w-24 h-24 object-contain border rounded bg-white" />
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                    {order.payment_status === 'expired' || timeLeft === 0 ? (
                                        <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg font-semibold">
                                            Pesanan telah kadaluarsa karena melewati batas waktu 30 menit. Stok produk telah dikembalikan.
                                        </div>
                                    ) : order.payment?.[0]?.status === 'waiting_verification' ? (
                                        <div className="p-3 bg-blue-50 border border-blue-300 text-blue-800 text-sm rounded-lg">
                                            <p className="font-bold">✅ Bukti pembayaran sudah diupload</p>
                                            <p className="text-xs mt-1">Menunggu konfirmasi dari admin. Kami akan memproses pesanan Anda setelah pembayaran diverifikasi.</p>
                                            {order.payment[0].proof && (
                                                <a href={order.payment[0].proof} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline mt-1 block">Lihat bukti yang diupload →</a>
                                            )}
                                        </div>
                                    ) : order.payment?.[0]?.status === 'rejected' ? (
                                        <div className="space-y-3">
                                            <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-sm rounded-lg">
                                                <p className="font-bold">❌ Bukti pembayaran ditolak</p>
                                                {order.payment[0].notes && <p className="text-xs mt-1">Alasan: {order.payment[0].notes}</p>}
                                                <p className="text-xs mt-1">Harap upload ulang bukti pembayaran yang valid.</p>
                                            </div>
                                            <div>
                                                <h2 className="font-semibold mb-2 text-sm">Upload Ulang Bukti Pembayaran</h2>
                                                <input type="file" accept="image/*" onChange={uploadProof} disabled={uploadingProof} className="text-sm" />
                                                {uploadingProof && <p className="text-xs text-gray-500 mt-1">Mengupload bukti...</p>}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h2 className="font-semibold mb-2 text-sm">Upload Payment Proof</h2>
                                            <input type="file" accept="image/*" onChange={uploadProof} disabled={uploadingProof} className="text-sm" />
                                            {uploadingProof && <p className="text-xs text-gray-500 mt-1">Mengupload bukti...</p>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </UserLayout>
    );
}
