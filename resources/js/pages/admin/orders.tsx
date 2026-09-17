import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import api from '@/services/api';
import { Order } from '@/types';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/components/ui/table';

const fmt = (x: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(x);

const statuses = ['pending_payment', 'waiting_verification', 'processing', 'packed', 'shipped', 'completed', 'cancelled'];

export default function AdminOrders() {
    const { url } = usePage();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Order | null>(null);
    const [statusModal, setStatusModal] = useState<Order | null>(null);
    const [statusForm, setStatusForm] = useState({ order_status: '', tracking_number: '', shipping_courier: '' });
    const [statusLoading, setStatusLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(url.split('?')[1]);
        const status = params.get('status');
        if (status) setFilter(status);
    }, [url]);

    const fetchOrders = () => {
        const params: any = { per_page: 100 };
        if (filter) params.order_status = filter;
        api.get('/admin/orders', { params }).then(r => setOrders(r.data.data?.data ?? r.data.data));
    };
    useEffect(() => { fetchOrders(); }, [filter]);

    const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

    const openStatusModal = (order: Order) => {
        setStatusModal(order);
        setStatusForm({ 
            order_status: order.order_status, 
            tracking_number: (order as any).tracking_number || '', 
            shipping_courier: (order as any).shipping_courier || '' 
        });
    };

    const submitStatusUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!statusModal) return;
        setStatusLoading(true);
        try {
            await api.put(`/admin/orders/${statusModal.id}/status`, statusForm);
            setStatusModal(null);
            fetchOrders();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal memperbarui status pesanan.');
        } finally {
            setStatusLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        setUpdatingStatusId(id);
        try {
            await api.put(`/admin/orders/${id}/status`, { order_status: status });
            fetchOrders();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal memperbarui status pesanan.');
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const [verifying, setVerifying] = useState(false);

    const verifyPayment = async (orderId: number, verified: boolean) => {
        // Cari payment dengan status waiting_verification atau yang terbaru (index terakhir)
        const payment = selected?.payment?.slice().reverse().find((p: any) => p.status === 'waiting_verification')
            ?? selected?.payment?.[selected.payment.length - 1];
        const paymentId = payment?.id;
        if (!paymentId) {
            alert('ID pembayaran tidak ditemukan.');
            return;
        }
        if (!confirm(verified ? 'Setujui pembayaran ini?' : 'Tolak pembayaran ini?')) return;
        setVerifying(true);
        try {
            await api.post(`/admin/payments/${paymentId}/verify`, { approved: verified });
            setSelected(null);
            fetchOrders();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal memverifikasi pembayaran. Coba lagi.');
        } finally {
            setVerifying(false);
        }
    };

    const filteredOrders = orders.filter(o => {
        const q = search.toLowerCase();
        const orderNumMatches = o.order_number?.toLowerCase().includes(q);
        const userMatches = o.user?.name?.toLowerCase().includes(q) || o.user?.email?.toLowerCase().includes(q);
        const statusMatches = o.order_status?.toLowerCase().includes(q) || o.payment_status?.toLowerCase().includes(q);
        return orderNumMatches || userMatches || statusMatches;
    });

    return (
        <AdminLayout>
            <Head title="Orders" />
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Orders</h1>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search orders..."
                        className="border rounded-lg px-3 py-2 text-sm w-64"
                    />
                    <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                        <option value="">All Status</option>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredOrders.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                                No orders found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredOrders.map(o => (
                            <TableRow key={o.id}>
                                <TableCell>{o.order_number}</TableCell>
                                <TableCell>{new Date(o.created_at).toLocaleDateString('id-ID')}</TableCell>
                                <TableCell>{fmt(o.total)}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <button 
                                            onClick={() => openStatusModal(o)}
                                            disabled={updatingStatusId === o.id}
                                            className="px-2 py-1 text-[10px] font-black border-2 border-border shadow-xs hover:shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50 bg-main/10"
                                        >
                                            {updatingStatusId === o.id ? '...' : o.order_status.replace('_', ' ').toUpperCase()}
                                        </button>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border-2 border-border w-fit ${
                                            o.payment_status === 'paid' ? 'bg-green-300 text-green-900' : 
                                            o.payment_status === 'waiting_verification' ? 'bg-amber-300 text-amber-900' :
                                            o.payment_status === 'rejected' ? 'bg-red-300 text-red-900' :
                                            'bg-gray-200 text-gray-700'
                                        }`}>
                                            {o.payment_status.toUpperCase()}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{o.payment_method}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {o.payment_status === 'waiting_verification' && o.payment?.[0]?.proof && (
                                            <button 
                                                onClick={() => setSelected(o)} 
                                                className="px-2 py-1 text-[10px] font-black bg-purple-400 text-white border-2 border-border shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                                            >
                                                KONFIRMASI
                                            </button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {selected && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-secondary-background border-4 border-border shadow-shadow w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b-4 border-border pb-3">
                            <h2 className="text-xl font-black uppercase">Konfirmasi Pembayaran - {selected.order_number}</h2>
                            <button onClick={() => setSelected(null)} className="font-black text-lg">✕</button>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="border-2 border-border p-3 bg-white">
                                    <p className="text-[10px] font-black uppercase text-gray-500">Bukti Pembayaran</p>
                                    <a href={selected?.payment?.slice().reverse().find((p: any) => p.proof)?.proof ?? selected?.payment?.[0]?.proof} target="_blank" rel="noreferrer">
                                        <img src={selected?.payment?.slice().reverse().find((p: any) => p.proof)?.proof ?? selected?.payment?.[0]?.proof} alt="Proof" className="w-full h-auto border-2 border-border mt-2" />
                                    </a>
                                    <p className="text-[10px] text-center mt-2 font-bold text-gray-400 italic">Klik gambar untuk memperbesar</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="border-2 border-border p-3 bg-main/5">
                                    <p className="text-[10px] font-black uppercase text-gray-500">Detail Transaksi</p>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex justify-between border-b border-border/20 pb-1">
                                            <span className="text-xs font-bold">Pelanggan:</span>
                                            <span className="text-xs font-black">{selected.user?.name}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-border/20 pb-1">
                                            <span className="text-xs font-bold">Metode:</span>
                                            <span className="text-xs font-black uppercase">{selected.payment_method}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-border/20 pb-1">
                                            <span className="text-xs font-bold">Total Tagihan:</span>
                                            <span className="text-xs font-black text-purple-700">{fmt(selected.total)}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-border/20 pb-1">
                                            <span className="text-xs font-bold">Jumlah Dibayar:</span>
                                            <span className="text-xs font-black text-green-700">{fmt(selected.payment?.[0]?.amount || 0)}</span>
                                        </div>
                                        {selected.payment?.[0]?.notes && (
                                            <div className="pt-1">
                                                <span className="text-xs font-bold">Catatan:</span>
                                                <p className="text-xs bg-white p-2 border border-border mt-1 italic">{selected.payment[0].notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 pt-4">
                                    <button 
                                        onClick={() => verifyPayment(selected.id, true)} 
                                        disabled={verifying}
                                        className="w-full py-3 bg-green-400 text-black font-black border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all disabled:opacity-50"
                                    >
                                        {verifying ? 'Memproses...' : 'SETUJUI PEMBAYARAN'}
                                    </button>
                                    <button 
                                        onClick={() => verifyPayment(selected.id, false)} 
                                        disabled={verifying}
                                        className="w-full py-3 bg-red-400 text-white font-black border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all disabled:opacity-50"
                                    >
                                        {verifying ? 'Memproses...' : 'TOLAK PEMBAYARAN'}
                                    </button>
                                    <button 
                                        onClick={() => setSelected(null)} 
                                        disabled={verifying}
                                        className="w-full py-2 bg-gray-200 text-black font-black border-2 border-border disabled:opacity-50"
                                    >
                                        BATAL
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {statusModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-secondary-background border-4 border-border shadow-shadow w-full max-w-md p-6 space-y-4">
                        <div className="flex justify-between items-center border-b-4 border-border pb-3">
                            <h2 className="text-lg font-black uppercase">Update Status Pesanan</h2>
                            <button onClick={() => setStatusModal(null)} className="font-black text-lg">✕</button>
                        </div>

                        <form onSubmit={submitStatusUpdate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase mb-1">Status Baru</label>
                                <select 
                                    value={statusForm.order_status} 
                                    onChange={e => setStatusForm({ ...statusForm, order_status: e.target.value })}
                                    className="w-full border-2 border-border p-2 font-bold bg-background text-sm"
                                    required
                                >
                                    {statuses.map(s => (
                                        <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            {(statusForm.order_status === 'shipped' || statusForm.order_status === 'packed') && (
                                <>
                                    <div>
                                        <label className="block text-xs font-black uppercase mb-1">Kurir Pengiriman (Opsional)</label>
                                        <input 
                                            type="text" 
                                            placeholder="Contoh: JNE / J&T / SiCepat" 
                                            value={statusForm.shipping_courier} 
                                            onChange={e => setStatusForm({ ...statusForm, shipping_courier: e.target.value })}
                                            className="w-full border-2 border-border p-2 font-bold bg-background text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase mb-1">Nomor Resi / No. Tracking (Opsional)</label>
                                        <input 
                                            type="text" 
                                            placeholder="Nomor Resi" 
                                            value={statusForm.tracking_number} 
                                            onChange={e => setStatusForm({ ...statusForm, tracking_number: e.target.value })}
                                            className="w-full border-2 border-border p-2 font-bold bg-background text-sm font-mono"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex gap-2 pt-2">
                                <button 
                                    type="submit" 
                                    disabled={statusLoading}
                                    className="flex-1 py-2.5 bg-main text-main-foreground font-black border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all disabled:opacity-50"
                                >
                                    {statusLoading ? 'Menyimpan...' : 'SIMPAN STATUS'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setStatusModal(null)} 
                                    className="px-4 py-2.5 bg-gray-200 text-black font-black border-2 border-border"
                                >
                                    BATAL
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
