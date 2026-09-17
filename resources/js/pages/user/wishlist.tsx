import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import LockedState from '@/components/common/LockedState';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Product } from '@/types';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

const fmt = (x: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(x);

export default function WishlistPage() {
    const { isAuthenticated } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = () => {
        if (!isAuthenticated) return;
        setLoading(true);
        api.get('/wishlist')
            .then(r => {
                const list = r.data?.data?.data ?? r.data?.data ?? [];
                setProducts(Array.isArray(list) ? list : []);
            })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        }
    }, [isAuthenticated]);

    const removeFromWishlist = async (productId: number) => {
        try {
            await api.delete(`/wishlist/${productId}`);
            setProducts(prev => prev.filter(p => p.id !== productId));
        } catch (err) {
            console.error('Failed to remove from wishlist', err);
        }
    };

    const addToCart = async (productId: number) => {
        try {
            await api.post('/cart', { product_id: productId, quantity: 1 });
            router.visit('/cart');
        } catch (err) {
            console.error('Failed to add to cart', err);
        }
    };

    if (!isAuthenticated) {
        return (
            <UserLayout>
                <Head title="Wishlist" />
                <LockedState
                    title="Wishlist Terkunci"
                    description="Silakan masuk ke akun Anda terlebih dahulu untuk melihat dan mengelola produk favorit dalam wishlist."
                />
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <Head title="Wishlist Saya" />
            <div className="flex items-center gap-3 mb-6">
                <Heart className="w-7 h-7 text-main fill-main" />
                <h1 className="text-2xl font-bold">Wishlist Saya</h1>
            </div>

            {loading ? (
                <div className="p-10 text-center text-foreground/60">Memuat wishlist...</div>
            ) : products.length === 0 ? (
                <div className="bg-secondary-background border-2 border-border p-8 rounded-base text-center max-w-md mx-auto my-8 shadow-shadow space-y-4">
                    <Heart className="w-12 h-12 text-foreground/40 mx-auto" />
                    <h2 className="text-xl font-bold">Wishlist Anda Kosong</h2>
                    <p className="text-foreground/70 text-sm">Belum ada produk favorit yang disimpan.</p>
                    <Link
                        href="/products"
                        className="inline-block bg-main text-main-foreground font-semibold px-6 py-2.5 rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                    >
                        Jelajahi Produk
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map(p => (
                        <div key={p.id} className="bg-secondary-background border-2 border-border rounded-base overflow-hidden shadow-shadow flex flex-col justify-between">
                            <Link href={`/products/${p.id}`}>
                                <img
                                    src={p.images?.[0]?.image ?? p.thumbnail ?? '/placeholder.png'}
                                    alt={p.name}
                                    onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                                    className="w-full h-48 object-cover border-b-2 border-border"
                                />
                            </Link>
                            <div className="p-3 flex-1 flex flex-col justify-between">
                                <div>
                                    <p className="text-xs text-foreground/60">{p.brand?.name}</p>
                                    <Link href={`/products/${p.id}`} className="font-semibold truncate block hover:text-main">
                                        {p.name}
                                    </Link>
                                    <p className="text-main font-bold mt-1">{fmt(p.effective_price ?? p.price)}</p>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => addToCart(p.id)}
                                        className="flex-1 bg-main text-main-foreground font-semibold px-3 py-2 text-xs rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all flex items-center justify-center gap-1"
                                    >
                                        <ShoppingCart className="w-3.5 h-3.5" /> + Keranjang
                                    </button>
                                    <button
                                        onClick={() => removeFromWishlist(p.id)}
                                        title="Hapus dari wishlist"
                                        className="bg-red-100 text-red-600 hover:bg-red-200 border-2 border-border p-2 rounded-base transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </UserLayout>
    );
}
