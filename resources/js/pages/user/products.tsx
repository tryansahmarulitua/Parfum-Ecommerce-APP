import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import api from '@/services/api';
import { Product, Category, Brand } from '@/types';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';

const fmt = (x: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(x);

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get('search') ?? '');
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');
    const [gender, setGender] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sort, setSort] = useState('newest');

    const categoryItems = useMemo(() => {
        const map: Record<string, string> = { all: 'All' };
        categories.forEach(c => { map[String(c.id)] = c.name; });
        return map;
    }, [categories]);

    const brandItems = useMemo(() => {
        const map: Record<string, string> = { all: 'All' };
        brands.forEach(b => { map[String(b.id)] = b.name; });
        return map;
    }, [brands]);

    const genderItems = useMemo(() => ({
        all: 'All',
        male: 'Men',
        female: 'Women',
        unisex: 'Unisex',
    }), []);

    const sortItems = useMemo(() => ({
        newest: 'Newest',
        price_asc: 'Price: Low to High',
        price_desc: 'Price: High to Low',
        popular: 'Popular',
    }), []);

    useEffect(() => {
        api.get('/categories').then(r => setCategories(r.data.data?.data ?? r.data.data));
        api.get('/brands').then(r => setBrands(r.data.data?.data ?? r.data.data));
    }, []);

    useEffect(() => {
        const params: any = { sort, per_page: 24 };
        if (search) params.search = search;
        if (category) params.category_id = category;
        if (brand) params.brand_id = brand;
        if (gender) params.gender = gender;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        api.get('/products', { params }).then(r => setProducts(r.data.data?.data ?? r.data.data));
    }, [search, category, brand, gender, minPrice, maxPrice, sort]);

    return (
        <UserLayout>
            <Head title="Products" />
            <div className="flex flex-col md:flex-row gap-6">
                <aside className="w-full md:w-64 space-y-4 bg-secondary-background p-4 border-2 border-border rounded-base shadow-shadow">
                    <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full border-2 border-border rounded-base px-3 py-2 bg-secondary-background focus:outline-none focus:ring-2 focus:ring-ring" />
                    <div>
                        <label className="text-sm font-medium">Category</label>
                        <Select items={categoryItems} value={category || 'all'} onValueChange={(val) => setCategory(val === 'all' ? '' : (val ?? ''))}>
                            <SelectTrigger className="mt-1 bg-secondary-background text-foreground">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Brand</label>
                        <Select items={brandItems} value={brand || 'all'} onValueChange={(val) => setBrand(val === 'all' ? '' : (val ?? ''))}>
                            <SelectTrigger className="mt-1 bg-secondary-background text-foreground">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {brands.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Gender</label>
                        <Select items={genderItems} value={gender || 'all'} onValueChange={(val) => setGender(val === 'all' ? '' : (val ?? ''))}>
                            <SelectTrigger className="mt-1 bg-secondary-background text-foreground">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="male">Men</SelectItem>
                                <SelectItem value="female">Women</SelectItem>
                                <SelectItem value="unisex">Unisex</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                            className="w-1/2 border-2 border-border rounded-base px-3 py-2 bg-secondary-background focus:outline-none focus:ring-2 focus:ring-ring" />
                        <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                            className="w-1/2 border-2 border-border rounded-base px-3 py-2 bg-secondary-background focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Sort</label>
                        <Select items={sortItems} value={sort} onValueChange={(val) => setSort(val ?? 'newest')}>
                            <SelectTrigger className="mt-1 bg-secondary-background text-foreground">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                                <SelectItem value="popular">Popular</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </aside>

                <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                                    {p.avg_rating && (
                                        <p className="text-yellow-500 text-sm">{'★'.repeat(Math.round(p.avg_rating))} ({p.avg_rating})</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                    {products.length === 0 && <p className="text-foreground/60 text-center py-10">No products found.</p>}
                </div>
            </div>
        </UserLayout>
    );
}
