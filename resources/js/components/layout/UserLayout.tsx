import React, { ReactNode, useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, ShoppingCart, Search } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import api from '@/services/api';
import { Product } from '@/types';

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        if (isAuthenticated) {
            api.get('/cart').then(r => {
                const items = r.data?.data?.items ?? [];
                setCartCount(items.reduce((sum: number, i: any) => sum + i.quantity, 0));
            }).catch(() => {});
            api.get('/wishlist').then(r => {
                const list = r.data?.data?.data ?? r.data?.data ?? [];
                setWishlistCount(Array.isArray(list) ? list.length : 0);
            }).catch(() => {});
        }
    }, [isAuthenticated]);

    const handleProtectedNav = (path: string) => {
        if (!isAuthenticated) {
            router.visit('/login');
        } else {
            router.visit(path);
        }
    };

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(() => {
            setSearching(true);
            api.get('/products', { params: { search: searchQuery.trim(), per_page: 5 } })
                .then(r => setSearchResults(r.data.data?.data ?? r.data.data ?? []))
                .catch(() => setSearchResults([]))
                .finally(() => setSearching(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.visit(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
        }
    };

    return (
        <header className="bg-secondary-background border-b-2 border-border sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center space-x-8">
                        <Link href="/" className="flex items-center">
                            <img
                                src="/favicon.svg"
                                alt="ParfumStore Logo"
                                className="h-9 w-auto object-contain"
                            />
                        </Link>
                        <nav className="hidden md:flex space-x-6">
                            <Link href="/" className="text-foreground hover:text-main font-medium">Home</Link>
                            <Link href="/products" className="text-foreground hover:text-main font-medium">Produk</Link>
                            <Link href="/about" className="text-foreground hover:text-main font-medium">Tentang Kami</Link>
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        {searchOpen ? (
                            <div className="relative">
                                <form onSubmit={handleSearch}>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Cari produk..."
                                        className="w-48 lg:w-64 border-2 border-main rounded-base px-3 py-1.5 bg-secondary-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                                        autoFocus
                                    />
                                </form>
                                {searchQuery.trim() && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-secondary-background border-2 border-border rounded-base shadow-shadow overflow-hidden z-50">
                                        {searching ? (
                                            <div className="p-3 text-xs text-foreground/60 text-center">Mencari...</div>
                                        ) : searchResults.length > 0 ? (
                                            <div>
                                                {searchResults.map(p => (
                                                    <Link
                                                        key={p.id}
                                                        href={`/products/${p.id}`}
                                                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                                                        className="flex items-center gap-2 p-2 hover:bg-main/10 border-b border-border last:border-0 transition-colors"
                                                    >
                                                        <img src={p.images?.[0]?.image ?? p.thumbnail ?? '/placeholder.png'} alt={p.name}
                                                            onError={e => { e.currentTarget.src = '/placeholder.png'; }}
                                                            className="w-8 h-8 object-cover rounded border border-border" />
                                                        <div className="overflow-hidden text-xs">
                                                            <p className="font-semibold truncate">{p.name}</p>
                                                            <p className="text-main font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(p.price)}</p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-3 text-xs text-foreground/60 text-center">Tidak ditemukan.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button onClick={() => setSearchOpen(true)} className="text-foreground hover:text-main p-2" title="Cari" aria-label="Search">
                                <Search className="w-5 h-5" />
                            </button>
                        )}
                        <button onClick={() => handleProtectedNav('/wishlist')} className="text-foreground hover:text-main p-2 relative" title="Wishlist" aria-label="Wishlist">
                            <Heart className="w-5 h-5" />
                            {isAuthenticated && wishlistCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-main text-main-foreground text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-border">
                                    {wishlistCount > 99 ? '99+' : wishlistCount}
                                </span>
                            )}
                        </button>
                        <button onClick={() => handleProtectedNav('/cart')} className="text-foreground hover:text-main p-2 relative" title="Keranjang" aria-label="Keranjang">
                            <ShoppingCart className="w-5 h-5" />
                            {isAuthenticated && cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-main text-main-foreground text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-border">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </button>
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                {user?.role === 'admin' && (
                                    <Link href="/admin/dashboard" className="bg-main text-main-foreground border-2 border-border px-3 py-1.5 rounded-base text-sm font-medium shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all">Admin</Link>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center hover:opacity-80 transition-opacity">
                                        <Avatar size="sm">
                                            <AvatarImage src={user?.avatar ?? ''} alt={user?.name ?? 'User'} />
                                            <AvatarFallback>{user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}</AvatarFallback>
                                            <AvatarBadge className="bg-green-600" />
                                        </Avatar>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-40 z-50">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem render={<Link href="/profile" className="w-full" />}>Profile</DropdownMenuItem>
                                            <DropdownMenuItem render={<Link href="/orders" className="w-full" />}>Pesanan</DropdownMenuItem>
                                            <DropdownMenuItem render={<Link href="/settings" className="w-full" />}>Settings</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link href="/login" className="text-foreground hover:text-main px-3 py-2 text-sm font-medium">Masuk</Link>
                                <Link href="/register" className="bg-foreground text-background border-2 border-border px-4 py-2 rounded-base text-sm font-medium shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all">Daftar</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default function UserLayout({ children, hideNavbar = false, hideFooter = false }: { children: ReactNode, hideNavbar?: boolean, hideFooter?: boolean }) {
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans text-foreground justify-between">
            {!hideNavbar && <Navbar />}
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col justify-center">
                {children}
            </main>
            {!hideFooter && (
                <footer className="bg-secondary-background border-t-2 border-border py-4 mt-auto">
                    <div className="max-w-7xl mx-auto px-4 text-center text-sm text-foreground">
                        &copy; {new Date().getFullYear()} ParfumStore. Hak Cipta Dilindungi.
                    </div>
                </footer>
            )}
        </div>
    );
}