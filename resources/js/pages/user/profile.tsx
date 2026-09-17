import { Head, Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from '@/components/ui/avatar';
import api from '@/services/api';
import { Camera, Eye, Upload, X, RotateCcw, RotateCw, ZoomIn, ZoomOut, Check } from 'lucide-react';

async function compressImageIfNeeded(file: File): Promise<File> {
    if (file.size <= 10 * 1024 * 1024) return file;
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            const maxDim = 1920;
            if (width > maxDim || height > maxDim) {
                if (width > height) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                } else {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                    } else {
                        resolve(file);
                    }
                },
                'image/jpeg',
                0.75
            );
        };
        img.onerror = () => resolve(file);
    });
}

export default function Profile() {
    const { user, setUser, logout } = useAuth();
    const [name, setName] = useState(user?.name ?? '');
    const [phone, setPhone] = useState(user?.phone ?? '');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Crop & Rotate State
    const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
    const [selectedFileName, setSelectedFileName] = useState<string>('avatar.jpg');
    const [showCropModal, setShowCropModal] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const cropCanvasRef = useRef<HTMLCanvasElement>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        try {
            const res = await api.put('/user/profile', { name, phone });
            if (res.data?.data) {
                setUser(res.data.data);
            }
            setMessage('Profil berhasil diperbarui.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal memperbarui profil.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setShowOptionsModal(false);
        setSelectedFileName(file.name);

        const url = URL.createObjectURL(file);
        setSelectedImageSrc(url);
        setRotation(0);
        setZoom(1);
        setShowCropModal(true);
    };

    // Render Canvas preview inside crop modal
    useEffect(() => {
        if (!selectedImageSrc || !cropCanvasRef.current || !showCropModal) return;
        const canvas = cropCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.src = selectedImageSrc;
        img.onload = () => {
            const size = 260;
            canvas.width = size;
            canvas.height = size;

            ctx.clearRect(0, 0, size, size);
            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.scale(zoom, zoom);

            const scaleRatio = Math.min(size / img.width, size / img.height);
            const w = img.width * scaleRatio;
            const h = img.height * scaleRatio;

            ctx.drawImage(img, -w / 2, -h / 2, w, h);
            ctx.restore();
        };
    }, [selectedImageSrc, rotation, zoom, showCropModal]);

    const handleCropAndUpload = async () => {
        if (!selectedImageSrc) return;
        setShowCropModal(false);
        setMessage('');
        setError('');
        setAvatarLoading(true);

        const img = new Image();
        img.src = selectedImageSrc;
        await new Promise((res) => {
            img.onload = res;
        });

        const exportCanvas = document.createElement('canvas');
        const exportSize = 500;
        exportCanvas.width = exportSize;
        exportCanvas.height = exportSize;
        const ctx = exportCanvas.getContext('2d');

        if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, exportSize, exportSize);
            ctx.save();
            ctx.translate(exportSize / 2, exportSize / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.scale(zoom, zoom);

            const scaleRatio = Math.min(exportSize / img.width, exportSize / img.height);
            const w = img.width * scaleRatio;
            const h = img.height * scaleRatio;

            ctx.drawImage(img, -w / 2, -h / 2, w, h);
            ctx.restore();
        }

        exportCanvas.toBlob(async (blob) => {
            if (!blob) {
                setAvatarLoading(false);
                return;
            }

            let file = new File([blob], selectedFileName, { type: 'image/jpeg' });

            if (file.size > 10 * 1024 * 1024) {
                setMessage('Ukuran file > 10MB, mengompres gambar...');
                file = await compressImageIfNeeded(file);
            }

            const formData = new FormData();
            formData.append('avatar', file);

            try {
                const res = await api.post('/user/profile', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (res.data?.data) {
                    setUser(res.data.data);
                }
                setMessage('Avatar berhasil diperbarui.');
            } catch (err: any) {
                setError(err.response?.data?.message || 'Gagal mengunggah avatar.');
            } finally {
                setAvatarLoading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }, 'image/jpeg', 0.85);
    };

    return (
        <UserLayout>
            <Head title="Profil Saya" />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-secondary-background border-2 border-border rounded-base p-6 shadow-shadow flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group cursor-pointer" onClick={() => setShowOptionsModal(true)}>
                        <Avatar size="lg" className="w-24 h-24 text-2xl border-2 border-border transition-transform group-hover:scale-105">
                            <AvatarImage src={user?.avatar ?? ''} alt={user?.name ?? 'User'} />
                            <AvatarFallback>{user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}</AvatarFallback>
                            <AvatarBadge className="bg-green-600" />
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                        {avatarLoading && (
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                Upload...
                            </div>
                        )}
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />

                    <div className="space-y-1 text-center sm:text-left flex-1">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                            <h1 className="text-2xl font-bold">{user?.name}</h1>
                            <button
                                type="button"
                                onClick={() => setShowOptionsModal(true)}
                                className="text-xs text-foreground/70 hover:text-foreground underline font-medium"
                            >
                                Ubah Avatar
                            </button>
                        </div>
                        <p className="text-sm text-foreground/70">{user?.email}</p>
                        <span className="inline-block bg-main text-main-foreground px-2.5 py-0.5 rounded-base text-xs font-semibold border border-border">
                            {user?.role === 'admin' ? 'Administrator' : 'Pelanggan'}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <Link href="/orders" className="bg-secondary-background hover:bg-main text-foreground px-4 py-2 text-sm font-semibold rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all">
                            Pesanan Saya
                        </Link>
                    </div>
                </div>

                <div className="bg-secondary-background border-2 border-border rounded-base p-6 shadow-shadow space-y-4">
                    <h2 className="text-xl font-bold">Edit Informasi Profil</h2>

                    {message && <div className="p-3 bg-green-100 border-2 border-green-500 text-green-800 rounded-base text-sm font-medium">{message}</div>}
                    {error && <div className="p-3 bg-red-100 border-2 border-red-500 text-red-800 rounded-base text-sm font-medium">{error}</div>}

                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                className="w-full border-2 border-border rounded-base px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                value={user?.email ?? ''}
                                disabled
                                className="w-full border-2 border-border rounded-base px-3 py-2 bg-foreground/10 cursor-not-allowed text-sm text-foreground/60"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Nomor Telepon</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="08xxxxxxxxxx"
                                className="w-full border-2 border-border rounded-base px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                            />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-main text-main-foreground font-semibold px-6 py-2 rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all text-sm disabled:opacity-50"
                            >
                                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>

                            <button
                                type="button"
                                onClick={logout}
                                className="text-red-600 hover:text-red-800 text-sm font-semibold p-2"
                            >
                                Keluar Akun
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal Pilihan Avatar (Lihat Foto / Upload Foto) */}
            {showOptionsModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-secondary-background border-2 border-border rounded-base p-6 max-w-sm w-full shadow-shadow space-y-4 relative">
                        <button
                            type="button"
                            onClick={() => setShowOptionsModal(false)}
                            className="absolute top-3 right-3 text-foreground/70 hover:text-foreground p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-bold text-center">Foto Profil</h3>
                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowOptionsModal(false);
                                    setShowViewModal(true);
                                }}
                                className="flex items-center justify-center gap-2 bg-background hover:bg-main hover:text-main-foreground border-2 border-border px-4 py-2.5 rounded-base font-semibold text-sm transition-all shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
                            >
                                <Eye className="w-4 h-4" />
                                Lihat Foto
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowOptionsModal(false);
                                    fileInputRef.current?.click();
                                }}
                                className="flex items-center justify-center gap-2 bg-main text-main-foreground border-2 border-border px-4 py-2.5 rounded-base font-semibold text-sm transition-all shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
                            >
                                <Upload className="w-4 h-4" />
                                Upload Foto Baru
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Crop & Rotate Editor */}
            {showCropModal && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-secondary-background border-2 border-border rounded-base p-6 max-w-md w-full shadow-shadow space-y-4 relative flex flex-col items-center">
                        <button
                            type="button"
                            onClick={() => setShowCropModal(false)}
                            className="absolute top-3 right-3 text-foreground/70 hover:text-foreground p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-bold">Edit & Potong Avatar</h3>

                        <div className="relative border-2 border-border rounded-full overflow-hidden w-[260px] h-[260px] bg-black/10 shadow-inner flex items-center justify-center">
                            <canvas ref={cropCanvasRef} className="max-w-full max-h-full" />
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4 w-full justify-center pt-2">
                            <button
                                type="button"
                                title="Putar Kiri"
                                onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                                className="p-2 border-2 border-border rounded-base bg-background hover:bg-main transition-all shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                title="Putar Kanan"
                                onClick={() => setRotation((r) => (r + 90) % 360)}
                                className="p-2 border-2 border-border rounded-base bg-background hover:bg-main transition-all shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
                            >
                                <RotateCw className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-2 border-2 border-border rounded-base bg-background px-3 py-1">
                                <ZoomOut className="w-4 h-4 text-foreground/70" />
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2.5"
                                    step="0.1"
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-24 accent-main cursor-pointer"
                                />
                                <ZoomIn className="w-4 h-4 text-foreground/70" />
                            </div>
                        </div>

                        <div className="flex gap-2 w-full pt-2">
                            <button
                                type="button"
                                onClick={() => setShowCropModal(false)}
                                className="flex-1 border-2 border-border px-4 py-2 rounded-base font-semibold text-sm hover:bg-foreground/10 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleCropAndUpload}
                                className="flex-1 flex items-center justify-center gap-2 bg-main text-main-foreground border-2 border-border px-4 py-2 rounded-base font-semibold text-sm shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                            >
                                <Check className="w-4 h-4" />
                                Simpan & Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Lihat Foto Penuh */}
            {showViewModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowViewModal(false)}>
                    <div className="relative max-w-md w-full bg-secondary-background border-2 border-border rounded-base p-4 flex flex-col items-center gap-4 shadow-shadow" onClick={e => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setShowViewModal(false)}
                            className="absolute top-3 right-3 text-foreground/70 hover:text-foreground p-1"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h3 className="text-lg font-bold">Foto Profil</h3>
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-64 h-64 object-cover rounded-base border-2 border-border"
                            />
                        ) : (
                            <div className="w-64 h-64 bg-background border-2 border-border rounded-base flex items-center justify-center text-4xl font-bold">
                                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                            </div>
                        )}
                        <div className="flex gap-2 w-full">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowViewModal(false);
                                    fileInputRef.current?.click();
                                }}
                                className="flex-1 flex items-center justify-center gap-2 bg-main text-main-foreground border-2 border-border px-4 py-2 rounded-base font-semibold text-sm shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                            >
                                <Upload className="w-4 h-4" />
                                Ganti Foto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </UserLayout>
    );
}
