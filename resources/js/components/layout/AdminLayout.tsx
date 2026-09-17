import React, { ReactNode, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    LayoutDashboard,
    Package,
    Tags,
    Award,
    ShoppingCart,
    Users,
    Ticket,
    Image as ImageIcon,
    Star,
    BarChart3,
    Landmark,
    Settings as SettingsIcon,
    Store,
    LogOut,
    Menu,
    X,
} from 'lucide-react';

const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Produk', href: '/admin/products', icon: Package },
    { label: 'Kategori', href: '/admin/categories', icon: Tags },
    { label: 'Brand', href: '/admin/brands', icon: Award },
    { label: 'Pesanan', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Konfirmasi Pembayaran', href: '/admin/orders?status=waiting_verification', icon: Award },
    { label: 'Pengguna', href: '/admin/users', icon: Users },
    { label: 'Voucher', href: '/admin/vouchers', icon: Ticket },
    { label: 'Banner', href: '/admin/banners', icon: ImageIcon },
    { label: 'Ulasan', href: '/admin/reviews', icon: Star },
    { label: 'Laporan', href: '/admin/reports', icon: BarChart3 },
    { label: 'Akun Bank / E-Wallet', href: '/admin/bank-accounts', icon: Landmark },
    { label: 'Pengaturan', href: '/admin/settings', icon: SettingsIcon },
];

function SidebarNav({ currentUrl, onClose }: { currentUrl: string; onClose?: () => void }) {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        router.visit('/login');
    };

    return (
        <div className="flex flex-col h-full bg-secondary-background text-foreground border-r-4 border-border font-sans selection:bg-main selection:text-main-foreground">
            {/* Header / Brand Logo */}
            <div className="p-5 border-b-4 border-border flex items-center justify-between bg-main text-main-foreground">
                <Link href="/admin/dashboard" className="text-xl font-black tracking-tight flex items-center gap-2">
                    <span className="bg-secondary-background text-foreground px-2 py-0.5 border-2 border-border font-black text-xs shadow-shadow">
                        ADMIN
                    </span>
                    Parfum<span className="underline decoration-4">Store</span>
                </Link>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="md:hidden p-1.5 bg-secondary-background text-foreground border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
                <div className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-foreground/70">
                    Navigasi Utama
                </div>
                {menuItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentUrl.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3.5 py-2.5 font-black text-sm border-2 transition-all ${
                                isActive
                                    ? 'bg-main text-main-foreground border-border shadow-shadow translate-x-1'
                                    : 'bg-secondary-background text-foreground border-transparent hover:border-border hover:shadow-shadow hover:bg-background'
                            }`}
                        >
                            <Icon className={`w-4 h-4 stroke-[2.5] ${isActive ? 'text-main-foreground' : 'text-foreground'}`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div className="p-3 border-t-4 border-border bg-main/10 space-y-2">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-3.5 py-2 text-xs font-black bg-secondary-background text-foreground border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                >
                    <Store className="w-4 h-4 text-foreground stroke-[2.5]" />
                    <span>Lihat Toko Publik</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-black bg-red-500 text-white border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                >
                    <LogOut className="w-4 h-4 stroke-[2.5]" />
                    <span>Keluar Sesi</span>
                </button>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { url } = usePage();
    const isMobile = useIsMobile();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans text-gray-900">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
                <SidebarNav currentUrl={url} />
            </aside>

            {/* Mobile Drawer Backdrop & Sidebar */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="relative w-72 max-w-[80vw] z-10 h-full">
                        <SidebarNav currentUrl={url} onClose={() => setMobileOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header Bar */}
                <header className="md:hidden bg-main text-main-foreground p-4 border-b-4 border-border flex items-center justify-between">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="p-2 bg-secondary-background text-foreground border-2 border-border shadow-shadow font-black"
                    >
                        <Menu className="w-5 h-5 stroke-[2.5]" />
                    </button>
                    <span className="font-black text-sm tracking-wide uppercase">
                        Parfum<span className="underline decoration-2">Admin</span>
                    </span>
                    <div className="w-9" />
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}