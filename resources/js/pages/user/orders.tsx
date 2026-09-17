import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Package, ShoppingBag, ArrowRight } from 'lucide-react';
import UserLayout from '@/components/layout/UserLayout';
import api from '@/services/api';
import { Order, Product } from '@/types';

const fmt = (x: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(x);

const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/orders')
            .then(r => {
                const data = r.data.data?.data ?? r.data.data ?? [];
                setOrders(data);
                if (data.length === 0) {
                    api.get('/products', { params: { per_page: 4 } })
                        .then(pr => setSuggestions(pr.data.data?.data ?? pr.data.data ?? []))
                        .catch(() => {});
                }
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <UserLayout>
            <Head title="Pesanan Saya" />
            <div className="flex items-center gap-3 mb-6">
                <Package className="w-7 h-7 text-main" />
                <h1 className="text-2xl font-bold">Pesanan Saya</h1>
            </div>

            {loading ? (
                <div className="p-10 text-center text-foreground/60">Memuat pesanan...</div>
            ) : orders.length === 0 ? (
                <div className="space-y-8">
                    <div className="bg-secondary-background border-2 border-border p-8 rounded-base text-center max-w-md mx-auto my-6 shadow-shadow space-y-4">
                        <ShoppingBag className="w-12 h-12 text-foreground/40 mx-auto" />
                        <h2 className="text-xl font-bold">Belum Ada Pesanan</h2>
                        <p className="text-foreground/70 text-sm">Anda belum melakukan pemesanan produk apapun.</p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 bg-main text-main-foreground font-semibold px-6 py-2.5 rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                        >
                            Jelajahi Produk
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {suggestions.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Rekomendasi Produk</h2>
                                <Link href="/products" className="text-sm font-semibold text-main hover:underline flex items-center gap-1">
                                    Lihat Semua <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {suggestions.map(p => (
                                    <Link key={p.id} href={`/products/${p.id}`}
                                        className="bg-secondary-background border-2 border-border rounded-base overflow-hidden shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all flex flex-col justify-between">
                                        <div>
                                            <img src={p.images?.[0]?.image ?? p.thumbnail ?? '/placeholder.png'} alt={p.name}
                                                onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                                                className="w-full h-40 object-cover border-b-2 border-border" />
                                            <div className="p-3">
                                                <p className="text-xs text-foreground/60">{p.brand?.name}</p>
                                                <h3 className="font-semibold truncate text-sm">{p.name}</h3>
                                                <p className="text-main font-bold text-sm mt-1">{fmt(p.price)}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(o => (
                        <Link key={o.id} href={`/orders/${o.id}`}
                            className="block bg-secondary-background border-2 border-border rounded-base p-4 shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold">{o.order_number}</span>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full border border-border ${statusColor[o.order_status] ?? 'bg-gray-100 text-gray-700'}`}>
                                    {o.order_status}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm text-foreground/70">
                                <span>{new Date(o.created_at).toLocaleDateString('id-ID')}</span>
                                <span className="font-semibold text-foreground">{fmt(o.total)}</span>
                            </div>
                            <p className="text-xs text-foreground/50 mt-1">{o.items?.length ?? 0} item(s)</p>
                        </Link>
                    ))}
                </div>
            )}
        </UserLayout>
    );
}
