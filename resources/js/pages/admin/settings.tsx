import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Info, User, Globe, Save, Lock, Upload, CheckCircle2, AlertCircle, Share2, Phone, MessageSquare, Video, AtSign } from 'lucide-react';

export default function AdminSettings() {
    const { user, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'about' | 'profile' | 'website' | 'social'>('about');

    // Website, About, & Social settings state
    const [settings, setSettings] = useState({
        store_name: '',
        store_email: '',
        store_phone: '',
        store_address: '',
        about_us: '',
        footer_text: '',
        owner_name: '',
        owner_role: '',
        owner_bio: '',
        owner_photo: '',
        social_instagram: '',
        social_facebook: '',
        social_tiktok: '',
        social_whatsapp: '',
        social_youtube: '',
        social_twitter: '',
    });
    const [ownerPhotoFile, setOwnerPhotoFile] = useState<File | null>(null);
    const [ownerPhotoPreview, setOwnerPhotoPreview] = useState<string | null>(null);
    const [loadingSettings, setLoadingSettings] = useState(false);
    const [settingMsg, setSettingMsg] = useState('');
    const [settingErr, setSettingErr] = useState('');

    // Profile state
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
    const [profileMsg, setProfileMsg] = useState('');
    const [profileErr, setProfileErr] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passMsg, setPassMsg] = useState('');
    const [passErr, setPassErr] = useState('');
    const [passLoading, setPassLoading] = useState(false);

    const fetchSettings = async () => {
        setLoadingSettings(true);
        try {
            const res = await api.get('/admin/settings');
            if (res.data?.data) {
                setSettings(prev => ({
                    ...prev,
                    ...res.data.data,
                }));
                if (res.data.data.owner_photo) {
                    setOwnerPhotoPreview(res.data.data.owner_photo);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSettings(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
            if (user.avatar) {
                setAvatarPreview(user.avatar);
            }
        }
    }, [user]);

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingMsg('');
        setSettingErr('');
        try {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('store_name', settings.store_name || '');
            formData.append('store_email', settings.store_email || '');
            formData.append('store_phone', settings.store_phone || '');
            formData.append('store_address', settings.store_address || '');
            formData.append('about_us', settings.about_us || '');
            formData.append('footer_text', settings.footer_text || '');
            formData.append('owner_name', settings.owner_name || '');
            formData.append('owner_role', settings.owner_role || '');
            formData.append('owner_bio', settings.owner_bio || '');
            formData.append('social_instagram', settings.social_instagram || '');
            formData.append('social_facebook', settings.social_facebook || '');
            formData.append('social_tiktok', settings.social_tiktok || '');
            formData.append('social_whatsapp', settings.social_whatsapp || '');
            formData.append('social_youtube', settings.social_youtube || '');
            formData.append('social_twitter', settings.social_twitter || '');
            if (ownerPhotoFile) {
                formData.append('owner_photo', ownerPhotoFile);
            }

            const res = await api.post('/admin/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSettingMsg('Pengaturan berhasil disimpan!');
            fetchSettings();
        } catch (err: any) {
            setSettingErr(err.response?.data?.message || 'Gagal menyimpan pengaturan.');
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMsg('');
        setProfileErr('');
        setProfileLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', profileForm.name);
            formData.append('email', profileForm.email);
            formData.append('phone', profileForm.phone || '');
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const res = await api.post('/admin/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data?.data) {
                setUser(res.data.data);
            }
            setProfileMsg('Profil admin berhasil diperbarui!');
        } catch (err: any) {
            setProfileErr(err.response?.data?.message || 'Gagal memperbarui profil.');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassMsg('');
        setPassErr('');

        if (newPassword !== confirmPassword) {
            setPassErr('Konfirmasi password tidak cocok.');
            return;
        }

        setPassLoading(true);
        try {
            await api.put('/admin/password', {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword,
            });
            setPassMsg('Password berhasil diperbarui!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setPassErr(err.response?.data?.message || 'Gagal mengubah password.');
        } finally {
            setPassLoading(false);
        }
    };

    const tabs = [
        { id: 'about', label: 'Tentang Kami', icon: Info },
        { id: 'profile', label: 'Profile Admin', icon: User },
        { id: 'website', label: 'Website', icon: Globe },
        { id: 'social', label: 'Sosial Media', icon: Share2 },
    ] as const;

    return (
        <AdminLayout>
            <Head title="Pengaturan Sistem" />

            {/* Header Neobrutalism Banner */}
            <div className="bg-secondary-background border-4 border-border p-6 mb-8 shadow-shadow font-sans">
                <div className="flex items-center gap-3 mb-2">
                    <span className="bg-main text-main-foreground px-3 py-1 border-2 border-border text-xs font-black uppercase shadow-shadow">
                        SYSTEM CONFIG
                    </span>
                </div>
                <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">
                    Pengaturan Sistem
                </h1>
                <p className="text-sm font-bold text-foreground/80 mt-1">
                    Kelola profil admin, deskripsi tentang kami, dan identitas utama toko.
                </p>
            </div>

            {/* Navigation Sub-sections (Neobrutalism Tabs) */}
            <div className="flex flex-wrap gap-3 mb-8 font-sans w-full">
                {tabs.map(t => {
                    const Icon = t.icon;
                    const isActive = activeTab === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-3 font-black text-sm border-2 transition-all ${
                                isActive
                                    ? 'bg-main text-main-foreground border-border shadow-shadow translate-x-0.5 -translate-y-0.5'
                                    : 'bg-secondary-background text-foreground border-border shadow-sm hover:border-border hover:shadow-shadow hover:bg-main/20'
                            }`}
                        >
                            <Icon className="w-4 h-4 stroke-[2.5]" />
                            <span>{t.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Section 1: Tentang Kami */}
            {activeTab === 'about' && (
                <div className="bg-secondary-background border-4 border-border p-6 shadow-shadow font-sans">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-4 border-border">
                        <div className="p-2.5 bg-chart-3 text-foreground border-2 border-border shadow-shadow">
                            <Info className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                                Pengaturan Halaman Tentang Kami
                            </h2>
                            <p className="text-xs font-bold text-foreground/70">
                                Informasi sejarah, visi, dan filosofi toko publik
                            </p>
                        </div>
                    </div>

                    {settingMsg && (
                        <div className="mb-6 p-4 bg-chart-4/30 border-2 border-border text-foreground font-black text-sm shadow-shadow flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 stroke-[2.5] text-foreground" />
                            <span>{settingMsg}</span>
                        </div>
                    )}
                    {settingErr && (
                        <div className="mb-6 p-4 bg-chart-5/30 border-2 border-border text-foreground font-black text-sm shadow-shadow flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 stroke-[2.5] text-foreground" />
                            <span>{settingErr}</span>
                        </div>
                    )}

                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground">
                                Deskripsi Tentang Kami (About Us)
                            </label>
                            <textarea
                                rows={8}
                                value={settings.about_us}
                                onChange={e => setSettings({ ...settings, about_us: e.target.value })}
                                placeholder="Tuliskan cerita, visi, misi, atau sejarah toko..."
                                className="w-full border-2 border-border bg-background/30 p-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                            />
                            <p className="text-xs font-bold text-foreground/60 mt-1.5">
                                Teks ini ditayangkan pada halaman publik "About Us" dan ringkasan toko.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground">
                                Teks Footer Website
                            </label>
                            <input
                                type="text"
                                value={settings.footer_text}
                                onChange={e => setSettings({ ...settings, footer_text: e.target.value })}
                                placeholder="Contoh: © 2026 ParfumStore. Hak Cipta Dilindungi."
                                className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                            />
                        </div>

                        {/* Pemilik Toko Section */}
                        <div className="pt-6 border-t-4 border-border space-y-5">
                            <h3 className="text-lg font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                                <User className="w-5 h-5 text-main stroke-[2.5]" />
                                Informasi Pemilik Toko (Halaman About)
                            </h3>

                            <div className="flex items-center gap-5 pb-2">
                                <div className="w-20 h-20 border-2 border-border bg-background shadow-shadow overflow-hidden flex items-center justify-center relative shrink-0">
                                    {ownerPhotoPreview ? (
                                        <img src={ownerPhotoPreview} alt="Pemilik" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-foreground/40 stroke-[2]" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 border-2 border-border text-xs font-black uppercase bg-chart-3 text-foreground shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all">
                                        <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                                        <span>Upload Foto Pemilik</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setOwnerPhotoFile(file);
                                                    setOwnerPhotoPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </label>
                                    <p className="text-xs font-bold text-foreground/60">
                                        Format JPG, PNG. Ukuran berkas maksimum 10MB.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground">
                                        Nama Pemilik Toko
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.owner_name}
                                        onChange={e => setSettings({ ...settings, owner_name: e.target.value })}
                                        placeholder="Contoh: Ahmad Subagja"
                                        className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground">
                                        Jabatan / Peran
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.owner_role}
                                        onChange={e => setSettings({ ...settings, owner_role: e.target.value })}
                                        placeholder="Contoh: Founder & CEO ParfumStore"
                                        className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground">
                                    Bio / Deskripsi Pemilik Toko
                                </label>
                                <textarea
                                    rows={4}
                                    value={settings.owner_bio}
                                    onChange={e => setSettings({ ...settings, owner_bio: e.target.value })}
                                    placeholder="Berpengalaman lebih dari 5 tahun di industri parfum..."
                                    className="w-full border-2 border-border bg-background/30 p-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t-2 border-border">
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-main text-main-foreground px-6 py-3 border-2 border-border text-sm font-black uppercase shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                            >
                                <Save className="w-4 h-4 stroke-[2.5]" />
                                <span>Simpan Tentang Kami</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Section 2: Profile Admin */}
            {activeTab === 'profile' && (
                <div className="space-y-8 w-full font-sans">
                    {/* Data Profile Card */}
                    <div className="bg-secondary-background border-4 border-border p-6 shadow-shadow">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b-4 border-border">
                            <div className="p-2.5 bg-main text-main-foreground border-2 border-border shadow-shadow">
                                <User className="w-6 h-6 stroke-[2.5]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                                    Informasi Profil Admin
                                </h2>
                                <p className="text-xs font-bold text-foreground/70">
                                    Perbarui identitas personal dan foto profil administrator
                                </p>
                            </div>
                        </div>

                        {profileMsg && (
                            <div className="mb-6 p-4 bg-chart-4/30 border-2 border-border text-foreground font-black text-sm shadow-shadow flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                                <span>{profileMsg}</span>
                            </div>
                        )}
                        {profileErr && (
                            <div className="mb-6 p-4 bg-chart-5/30 border-2 border-border text-foreground font-black text-sm shadow-shadow flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 stroke-[2.5]" />
                                <span>{profileErr}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            <div className="flex items-center gap-6 pb-2">
                                <div className="w-24 h-24 border-4 border-border bg-background shadow-shadow overflow-hidden flex items-center justify-center relative shrink-0">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-foreground/40 stroke-[2]" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border-2 border-border text-xs font-black uppercase bg-chart-3 text-foreground shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all">
                                        <Upload className="w-4 h-4 stroke-[2.5]" />
                                        <span>Ganti Foto Profil</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setAvatarFile(file);
                                                    setAvatarPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </label>
                                    <p className="text-xs font-bold text-foreground/60">
                                        Format JPG, PNG. Ukuran berkas maksimum 10MB.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={profileForm.name}
                                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                        className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground">
                                        Alamat Email
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        value={profileForm.email}
                                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                                        className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground">
                                        Nomor Telepon
                                    </label>
                                    <input
                                        type="text"
                                        value={profileForm.phone}
                                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        placeholder="08xxxxxxxxxx"
                                        className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t-2 border-border">
                                <button
                                    type="submit"
                                    disabled={profileLoading}
                                    className="flex items-center gap-2 bg-main text-main-foreground px-6 py-3 border-2 border-border text-sm font-black uppercase shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4 stroke-[2.5]" />
                                    <span>{profileLoading ? 'Menyimpan...' : 'Update Profil Admin'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security Card */}
                    <div className="bg-secondary-background border-4 border-border p-6 shadow-shadow">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b-4 border-border">
                            <div className="p-2.5 bg-chart-5 text-white border-2 border-border shadow-shadow">
                                <Lock className="w-6 h-6 stroke-[2.5]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                                    Keamanan & Kata Sandi
                                </h2>
                                <p className="text-xs font-bold text-foreground/70">
                                    Ubah password untuk menjaga privasi akun admin
                                </p>
                            </div>
                        </div>

                        {passMsg && (
                            <div className="mb-6 p-4 bg-chart-4/30 border-2 border-border text-foreground font-black text-sm shadow-shadow flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                                <span>{passMsg}</span>
                            </div>
                        )}
                        {passErr && (
                            <div className="mb-6 p-4 bg-chart-5/30 border-2 border-border text-foreground font-black text-sm shadow-shadow flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 stroke-[2.5]" />
                                <span>{passErr}</span>
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground">
                                    Password Saat Ini
                                </label>
                                <input
                                    required
                                    type="password"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground">
                                        Password Baru
                                    </label>
                                    <input
                                        required
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground">
                                        Konfirmasi Password Baru
                                    </label>
                                    <input
                                        required
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t-2 border-border">
                                <button
                                    type="submit"
                                    disabled={passLoading}
                                    className="flex items-center gap-2 bg-chart-5 text-white px-6 py-3 border-2 border-border text-sm font-black uppercase shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all disabled:opacity-50"
                                >
                                    <Lock className="w-4 h-4 stroke-[2.5]" />
                                    <span>{passLoading ? 'Memproses...' : 'Ubah Password Admin'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Section 3: Website */}
            {activeTab === 'website' && (
                <div className="bg-secondary-background border-4 border-border p-6 shadow-shadow font-sans">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-4 border-border">
                        <div className="p-2.5 bg-chart-4 text-foreground border-2 border-border shadow-shadow">
                            <Globe className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                                Identitas & Kontak Website
                            </h2>
                            <p className="text-xs font-bold text-foreground/70">
                                Konfigurasi nama toko, nomor layanan pelanggan, dan alamat operasional
                            </p>
                        </div>
                    </div>

                    {settingMsg && (
                        <div className="mb-6 p-4 bg-chart-4/30 border-2 border-border text-foreground font-black text-sm shadow-shadow flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                            <span>{settingMsg}</span>
                        </div>
                    )}
                    {settingErr && (
                        <div className="mb-6 p-4 bg-chart-5/30 border-2 border-border text-foreground font-black text-sm shadow-shadow flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 stroke-[2.5]" />
                            <span>{settingErr}</span>
                        </div>
                    )}

                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground">
                                    Nama Toko / Brand Website
                                </label>
                                <input
                                    type="text"
                                    value={settings.store_name}
                                    onChange={e => setSettings({ ...settings, store_name: e.target.value })}
                                    placeholder="Contoh: Toko Parfum"
                                    className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground">
                                    Email Resmi Toko
                                </label>
                                <input
                                    type="email"
                                    value={settings.store_email}
                                    onChange={e => setSettings({ ...settings, store_email: e.target.value })}
                                    placeholder="info@parfumstore.com"
                                    className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground">
                                Nomor Telepon / Whatsapp CS
                            </label>
                            <input
                                type="text"
                                value={settings.store_phone}
                                onChange={e => setSettings({ ...settings, store_phone: e.target.value })}
                                placeholder="081234567890"
                                className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground">
                                Alamat Operasional Toko
                            </label>
                            <textarea
                                rows={3}
                                value={settings.store_address}
                                onChange={e => setSettings({ ...settings, store_address: e.target.value })}
                                placeholder="Jl. Merdeka No.1, Jakarta..."
                                className="w-full border-2 border-border bg-background/30 p-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                            />
                        </div>

                        <div className="pt-4 border-t-2 border-border">
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-main text-main-foreground px-6 py-3 border-2 border-border text-sm font-black uppercase shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                            >
                                <Save className="w-4 h-4 stroke-[2.5]" />
                                <span>Simpan Identitas Website</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Section 4: Sosial Media */}
            {activeTab === 'social' && (
                <div className="bg-secondary-background border-4 border-border p-6 shadow-shadow font-sans">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-4 border-border">
                        <div className="p-2.5 bg-chart-1 text-white border-2 border-border shadow-shadow">
                            <Share2 className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                                Link & Akun Sosial Media
                            </h2>
                            <p className="text-xs font-bold text-foreground/70">
                                Atur link akun sosial media resmi toko yang akan ditampilkan di website
                            </p>
                        </div>
                    </div>

                    {settingMsg && (
                        <div className="mb-6 p-4 bg-chart-4/30 border-2 border-border text-foreground font-black text-sm shadow-shadow flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                            <span>{settingMsg}</span>
                        </div>
                    )}
                    {settingErr && (
                        <div className="mb-6 p-4 bg-chart-5/30 border-2 border-border text-foreground font-black text-sm shadow-shadow flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 stroke-[2.5]" />
                            <span>{settingErr}</span>
                        </div>
                    )}

                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground flex items-center gap-1.5">
                                    <AtSign className="w-4 h-4 text-pink-600 stroke-[2.5]" />
                                    <span>Instagram</span>
                                </label>
                                <input
                                    type="text"
                                    value={settings.social_instagram}
                                    onChange={e => setSettings({ ...settings, social_instagram: e.target.value })}
                                    placeholder="https://instagram.com/username atau @username"
                                    className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground flex items-center gap-1.5">
                                    <Globe className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                                    <span>Facebook</span>
                                </label>
                                <input
                                    type="text"
                                    value={settings.social_facebook}
                                    onChange={e => setSettings({ ...settings, social_facebook: e.target.value })}
                                    placeholder="https://facebook.com/halaman"
                                    className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground flex items-center gap-1.5">
                                    <MessageSquare className="w-4 h-4 text-green-600 stroke-[2.5]" />
                                    <span>WhatsApp CS</span>
                                </label>
                                <input
                                    type="text"
                                    value={settings.social_whatsapp}
                                    onChange={e => setSettings({ ...settings, social_whatsapp: e.target.value })}
                                    placeholder="Nomor WhatsApp (Contoh: 6281234567890)"
                                    className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground flex items-center gap-1.5">
                                    <Share2 className="w-4 h-4 text-black stroke-[2.5]" />
                                    <span>TikTok</span>
                                </label>
                                <input
                                    type="text"
                                    value={settings.social_tiktok}
                                    onChange={e => setSettings({ ...settings, social_tiktok: e.target.value })}
                                    placeholder="https://tiktok.com/@username atau @username"
                                    className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground flex items-center gap-1.5">
                                    <Video className="w-4 h-4 text-red-600 stroke-[2.5]" />
                                    <span>YouTube</span>
                                </label>
                                <input
                                    type="text"
                                    value={settings.social_youtube}
                                    onChange={e => setSettings({ ...settings, social_youtube: e.target.value })}
                                    placeholder="https://youtube.com/@channel"
                                    className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-foreground flex items-center gap-1.5">
                                    <AtSign className="w-4 h-4 text-sky-500 stroke-[2.5]" />
                                    <span>Twitter / X</span>
                                </label>
                                <input
                                    type="text"
                                    value={settings.social_twitter}
                                    onChange={e => setSettings({ ...settings, social_twitter: e.target.value })}
                                    placeholder="https://x.com/username atau @username"
                                    className="w-full border-2 border-border bg-background/30 px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-main focus:bg-secondary-background shadow-sm transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t-2 border-border">
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-main text-main-foreground px-6 py-3 border-2 border-border text-sm font-black uppercase shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                            >
                                <Save className="w-4 h-4 stroke-[2.5]" />
                                <span>Simpan Sosial Media</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
}
