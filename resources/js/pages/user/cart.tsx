import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import LockedState from '@/components/common/LockedState';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Cart } from '@/types';
import { ShoppingCart } from 'lucide-react';

const fmt = (x: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(x);

export default function CartPage() {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCart = () => {
        if (!isAuthenticated) return;
        setLoading(true);
        api.get('/cart')
            .then(r => setCart(r.data.data))
            .catch(() => setCart(null))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated]);

    const updateQty = async (itemId: number, newQty: number, productId?: number) => {
        if (newQty < 1) return;
        setCart(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                items: prev.items.map(item => item.id === itemId ? { ...item, quantity: newQty } : item)
            };
        });
        try {
            await api.put(`/cart/${itemId}`, { quantity: newQty, product_id: productId });
        } catch {
            fetchCart();
        }
    };

    const removeItem = async (itemId: number) => {
        setCart(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                items: prev.items.filter(item => item.id !== itemId)
            };
        });
        try {
            await api.delete(`/cart/${itemId}`);
        } catch {
            fetchCart();
        }
    };

    if (!isAuthenticated) {
        return (
            <UserLayout>
                <Head title="Keranjang Belanja" />
                <LockedState
                    title="Keranjang Terkunci"
                    description="Silakan masuk ke akun Anda terlebih dahulu untuk melihat dan mengelola keranjang belanja."
                />
            </UserLayout>
        );
    }

    const total = cart?.items?.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0) ?? 0;

    return (
        <UserLayout>
            <Head title="Keranjang Belanja" />
            <div className="flex items-center gap-3 mb-6">
                <ShoppingCart className="w-7 h-7 text-main" />
                <h1 className="text-2xl font-bold">Keranjang Belanja</h1>
            </div>

            {loading ? (
                <div className="p-10 text-center text-foreground/60">Memuat keranjang...</div>
            ) : !cart?.items?.length ? (
                <div className="bg-secondary-background border-2 border-border p-8 rounded-base text-center max-w-md mx-auto my-8 shadow-shadow space-y-4">
                    <ShoppingCart className="w-12 h-12 text-foreground/40 mx-auto" />
                    <h2 className="text-xl font-bold">Keranjang Anda Kosong</h2>
                    <p className="text-foreground/70 text-sm">Belum ada produk dalam keranjang belanja Anda.</p>
                    <Link
                        href="/products"
                        className="inline-block bg-main text-main-foreground font-semibold px-6 py-2.5 rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                    >
                        Jelajahi Produk
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {cart.items.map(item => (
                        <div key={item.id} className="flex items-center gap-4 bg-secondary-background border-2 border-border rounded-base p-4 shadow-shadow">
                            <img src={item.product?.images?.[0]?.image ?? item.product?.thumbnail ?? '/placeholder.png'} alt={item.product?.name}
                                onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                                className="w-20 h-20 object-cover rounded-base border-2 border-border" />
                            <div className="flex-1">
                                <Link href={`/products/${item.product_id}`} className="font-semibold hover:text-main block">
                                    {item.product?.name}
                                </Link>
                                <p className="text-sm text-foreground/60">{item.product?.brand?.name}</p>
                                <p className="text-main font-bold">{fmt(item.price ?? 0)}</p>
                            </div>
                            <div className="flex items-center border-2 border-border rounded-base">
                                <button onClick={() => updateQty(item.id, item.quantity - 1, item.product_id)} className="px-3 py-1 border-r-2 border-border font-bold">-</button>
                                <input
                                    type="number"
                                    min={1}
                                    max={item.product?.stock}
                                    value={item.quantity}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value, 10);
                                        if (!isNaN(val) && val >= 1) {
                                            const maxStock = item.product?.stock ?? 9999;
                                            updateQty(item.id, Math.min(val, maxStock), item.product_id);
                                        }
                                    }}
                                    className="w-12 text-center text-sm font-semibold bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button onClick={() => updateQty(item.id, item.quantity + 1, item.product_id)} className="px-3 py-1 border-l-2 border-border font-bold">+</button>
                            </div>
                            <p className="font-semibold w-28 text-right">{fmt((item.price ?? 0) * item.quantity)}</p>
                            <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 font-bold text-lg p-1">✕</button>
                        </div>
                    ))}

                    <div className="flex justify-between items-center border-2 border-border pt-4 mt-4 rounded-base p-4 bg-secondary-background shadow-shadow">
                        <span className="text-xl font-bold">Total Pembayaran</span>
                        <span className="text-xl font-bold text-main">{fmt(total)}</span>
                    </div>
                    <Link href="/checkout"
                        className="block w-full text-center bg-main text-main-foreground font-semibold py-3 rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all">
                        Lanjut ke Pembayaran
                    </Link>
                </div>
            )}
        </UserLayout>
    );
}
