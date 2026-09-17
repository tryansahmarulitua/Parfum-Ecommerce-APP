import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/components/layout/UserLayout';
import api from '@/services/api';
import { Product, Category, Banner } from '@/types';
import { useState, useEffect } from 'react';

const fmt = (x: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(x);

export default function Welcome() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);

    useEffect(() => {
        api.get('/products', { params: { sort: 'newest', per_page: 8 } }).then(r => setProducts(r.data.data?.data ?? r.data.data));
        api.get('/categories').then(r => setCategories(r.data.data?.data ?? r.data.data));
        api.get('/banners').then(r => setBanners(r.data.data?.data ?? r.data.data)).catch(() => {});
    }, []);

    return (
        <UserLayout>
            <Head title="Home" />

            <section className="relative bg-main text-main-foreground py-20 px-6 rounded-base border-2 border-border shadow-shadow mb-10">
                {banners[0]?.image && (
                    <img src={banners[0].image ?? ''} alt="" className="absolute inset-0 w-full h-full object-cover rounded-base opacity-30" />
                )}
                <div className="relative text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold mb-4">Discover Your Signature Scent</h1>
                    <p className="text-lg mb-6">Premium perfumes curated for every occasion</p>
                    <Link href="/products" className="inline-block bg-secondary-background text-foreground font-semibold px-6 py-3 rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all">
                        Shop Now
                    </Link>
                </div>
            </section>

            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-4">Categories</h2>
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {categories.map(c => (
                        <Link key={c.id} href={`/products?category=${c.id}`}
                            className="flex-shrink-0 px-5 py-2 bg-secondary-background border-2 border-border rounded-base shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all font-medium">
                            {c.name}
                        </Link>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4">New Arrivals</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {products.map(p => (
                        <Link key={p.id} href={`/products/${p.id}`}
                            className="bg-secondary-background border-2 border-border rounded-base overflow-hidden shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all">
                            <img src={p.images?.[0]?.image ?? p.thumbnail ?? '/placeholder.png'} alt={p.name}
                                onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                                className="w-full h-48 object-cover border-b-2 border-border" />
                            <div className="p-3">
                                <p className="text-xs text-foreground/60">{p.brand?.name}</p>
                                <h3 className="font-semibold truncate">{p.name}</h3>
                                <p className="text-main font-bold">{fmt(p.price)}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </UserLayout>
    );
}
