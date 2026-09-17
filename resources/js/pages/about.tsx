import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import api from '@/services/api';

interface Settings {
    store_name?: string;
    store_email?: string;
    store_phone?: string;
    store_address?: string;
    about_us?: string;
    footer_text?: string;
    owner_name?: string;
    owner_role?: string;
    owner_bio?: string;
    owner_photo?: string;
    social_instagram?: string;
    social_facebook?: string;
    social_tiktok?: string;
    social_whatsapp?: string;
    social_youtube?: string;
    social_twitter?: string;
}

interface Props {
    initialSettings?: Settings;
}

export default function About({ initialSettings = {} }: Props) {
    const [settings, setSettings] = useState<Settings>(initialSettings);
    const [loading, setLoading] = useState(!Object.keys(initialSettings).length);

    useEffect(() => {
        api.get('/settings')
            .then(res => {
                if (res.data?.data) {
                    setSettings(res.data.data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const aboutUs = settings.about_us || `ParfumStore lahir dari kecintaan terhadap wewangian premium. Didirikan dengan visi menghadirkan aroma berkualitas tinggi yang terjangkau, kami berkomitmen memberikan pengalaman belanja parfum yang personal dan menyenangkan bagi setiap pelanggan.`;

    const formatUrl = (val: string, prefix: string) => {
        if (!val) return '';
        if (val.startsWith('http://') || val.startsWith('https://')) return val;
        const clean = val.replace(/^@/, '');
        return `${prefix}${clean}`;
    };

    const email = settings.store_email || 'info@parfumstore.com';
    const phone = settings.store_phone || '081234567890';
    const address = settings.store_address || 'Jl. Merdeka No.1';
    const waNumber = (settings.social_whatsapp || phone).replace(/[^0-9]/g, '');

    return (
        <UserLayout>
            <Head title="Tentang Kami" />

            <section className="max-w-3xl mx-auto space-y-10">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2">{settings.store_name || 'Tentang Kami'}</h1>
                    <div className="w-20 h-1 bg-main mx-auto rounded" />
                </div>

                <section className="bg-secondary-background border-2 border-border rounded-base p-6 shadow-shadow">
                    <h2 className="text-xl font-bold mb-3">Cerita Kami</h2>
                    <p className="text-foreground/80 leading-relaxed">
                        {loading ? 'Memuat...' : aboutUs}
                    </p>
                </section>

                <section className="bg-secondary-background border-2 border-border rounded-base p-6 shadow-shadow">
                    <h2 className="text-xl font-bold mb-3">Pemilik Toko</h2>
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <div className="w-32 h-32 rounded-base border-2 border-border bg-foreground/5 overflow-hidden flex items-center justify-center text-foreground/30 text-4xl flex-shrink-0">
                            {settings.owner_photo ? (
                                <img src={settings.owner_photo} alt={settings.owner_name || 'Pemilik Toko'} className="w-full h-full object-cover" />
                            ) : (
                                <span>👤</span>
                            )}
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">{settings.owner_name || 'Nama Pemilik'}</h3>
                            <p className="text-sm text-foreground/60">{settings.owner_role || `Founder & CEO ${settings.store_name || 'Toko'}`}</p>
                            <p className="text-foreground/80 leading-relaxed text-sm">
                                {settings.owner_bio || 'Berpengalaman lebih dari 5 tahun di industri parfum dan kosmetik. Memiliki keahlian dalam kurasi wewangian dan membangun brand yang berfokus pada kepuasan pelanggan.'}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-secondary-background border-2 border-border rounded-base p-6 shadow-shadow">
                    <h2 className="text-xl font-bold mb-3">Portofolio</h2>
                    <ul className="space-y-3 text-sm text-foreground/80">
                        <li className="flex gap-2">
                            <span className="text-main font-bold">✦</span>
                            <span>Kurasi lebih dari 200+ parfum premium dari brand lokal dan internasional</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-main font-bold">✦</span>
                            <span>Melayani ribuan pelanggan setia di seluruh Indonesia</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-main font-bold">✦</span>
                            <span>Partner resmi dari berbagai brand parfum ternama</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-main font-bold">✦</span>
                            <span>Best Seller di berbagai marketplace nasional sejak 2022</span>
                        </li>
                    </ul>
                </section>

                <section className="bg-secondary-background border-2 border-border rounded-base p-6 shadow-shadow">
                    <h2 className="text-xl font-bold mb-4">Kontak & Sosial Media</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <a
                            href={`mailto:${email}`}
                            className="flex items-center gap-2.5 p-3 rounded-base border-2 border-border bg-background hover:bg-main hover:text-main-foreground transition-all shadow-sm group"
                        >
                            <span className="text-lg">📧</span>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-foreground/60 group-hover:text-main-foreground/80">Email</p>
                                <p className="font-semibold truncate">{email}</p>
                            </div>
                        </a>

                        <a
                            href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                            className="flex items-center gap-2.5 p-3 rounded-base border-2 border-border bg-background hover:bg-main hover:text-main-foreground transition-all shadow-sm group"
                        >
                            <span className="text-lg">📱</span>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-foreground/60 group-hover:text-main-foreground/80">Telepon</p>
                                <p className="font-semibold truncate">{phone}</p>
                            </div>
                        </a>

                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 p-3 rounded-base border-2 border-border bg-background hover:bg-main hover:text-main-foreground transition-all shadow-sm group col-span-1 sm:col-span-2"
                        >
                            <span className="text-lg">📍</span>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-foreground/60 group-hover:text-main-foreground/80">Alamat</p>
                                <p className="font-semibold truncate">{address}</p>
                            </div>
                        </a>

                        {waNumber && (
                            <a
                                href={`https://wa.me/${waNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 p-3 rounded-base border-2 border-border bg-background hover:bg-green-500 hover:text-white transition-all shadow-sm group"
                            >
                                <span className="text-lg">💬</span>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-foreground/60 group-hover:text-white/80">WhatsApp</p>
                                    <p className="font-semibold truncate">{settings.social_whatsapp || phone}</p>
                                </div>
                            </a>
                        )}

                        {settings.social_instagram && (
                            <a
                                href={formatUrl(settings.social_instagram, 'https://instagram.com/')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 p-3 rounded-base border-2 border-border bg-background hover:bg-pink-600 hover:text-white transition-all shadow-sm group"
                            >
                                <span className="text-lg">📸</span>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-foreground/60 group-hover:text-white/80">Instagram</p>
                                    <p className="font-semibold truncate">{settings.social_instagram}</p>
                                </div>
                            </a>
                        )}

                        {settings.social_facebook && (
                            <a
                                href={formatUrl(settings.social_facebook, 'https://facebook.com/')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 p-3 rounded-base border-2 border-border bg-background hover:bg-blue-600 hover:text-white transition-all shadow-sm group"
                            >
                                <span className="text-lg">📘</span>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-foreground/60 group-hover:text-white/80">Facebook</p>
                                    <p className="font-semibold truncate">{settings.social_facebook}</p>
                                </div>
                            </a>
                        )}

                        {settings.social_tiktok && (
                            <a
                                href={formatUrl(settings.social_tiktok, 'https://tiktok.com/@')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 p-3 rounded-base border-2 border-border bg-background hover:bg-black hover:text-white transition-all shadow-sm group"
                            >
                                <span className="text-lg">🎵</span>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-foreground/60 group-hover:text-white/80">TikTok</p>
                                    <p className="font-semibold truncate">{settings.social_tiktok}</p>
                                </div>
                            </a>
                        )}

                        {settings.social_youtube && (
                            <a
                                href={formatUrl(settings.social_youtube, 'https://youtube.com/@')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 p-3 rounded-base border-2 border-border bg-background hover:bg-red-600 hover:text-white transition-all shadow-sm group"
                            >
                                <span className="text-lg">▶️</span>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-foreground/60 group-hover:text-white/80">YouTube</p>
                                    <p className="font-semibold truncate">{settings.social_youtube}</p>
                                </div>
                            </a>
                        )}

                        {settings.social_twitter && (
                            <a
                                href={formatUrl(settings.social_twitter, 'https://x.com/')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 p-3 rounded-base border-2 border-border bg-background hover:bg-sky-500 hover:text-white transition-all shadow-sm group"
                            >
                                <span className="text-lg">🐦</span>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-foreground/60 group-hover:text-white/80">Twitter / X</p>
                                    <p className="font-semibold truncate">{settings.social_twitter}</p>
                                </div>
                            </a>
                        )}
                    </div>
                </section>
            </section>
        </UserLayout>
    );
}
