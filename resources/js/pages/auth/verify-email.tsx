import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export default function VerifyEmail() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const status = searchParams.get('status');
    const queryError = searchParams.get('error');

    const handleResend = async () => {
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const res = await api.post('/email/verification-notification');
            setMessage(res.data.message || 'Link verifikasi baru telah dikirim ke email Anda.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal mengirim link verifikasi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserLayout hideNavbar>
            <Head title="Verifikasi Email" />
            <div className="max-w-md mx-auto mt-10 p-6 bg-secondary-background border-2 border-border rounded-base shadow-shadow text-center">
                <h1 className="text-2xl font-bold mb-4">Verifikasi Email</h1>

                {status === 'verified' && (
                    <div className="mb-4 p-3 bg-green-100 border-2 border-green-800 text-green-900 rounded-base text-sm font-medium">
                        Email Anda berhasil diverifikasi! Selamat datang.
                    </div>
                )}

                {status === 'already-verified' && (
                    <div className="mb-4 p-3 bg-blue-100 border-2 border-blue-800 text-blue-900 rounded-base text-sm font-medium">
                        Email Anda sudah terverifikasi sebelumnya.
                    </div>
                )}

                {queryError === 'invalid' && (
                    <div className="mb-4 p-3 bg-red-100 border-2 border-red-800 text-red-900 rounded-base text-sm font-medium">
                        Link verifikasi tidak valid atau telah kadaluarsa.
                    </div>
                )}

                {message && (
                    <div className="mb-4 p-3 bg-green-100 border-2 border-green-800 text-green-900 rounded-base text-sm font-medium">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border-2 border-red-800 text-red-900 rounded-base text-sm font-medium">
                        {error}
                    </div>
                )}

                {!status && (
                    <p className="text-sm text-foreground/80 mb-6">
                        Terima kasih telah mendaftar! Sebelum memulai, silakan periksa email Anda ({user?.email || 'Anda'}) untuk mengeklik link verifikasi.
                    </p>
                )}

                <div className="space-y-3">
                    {user && (
                        <button
                            onClick={handleResend}
                            disabled={loading}
                            className="w-full bg-main text-main-foreground font-semibold py-2 rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all disabled:opacity-50 text-sm"
                        >
                            {loading ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
                        </button>
                    )}

                    <div>
                        <Link href="/" className="inline-block text-xs font-semibold text-main hover:underline mt-2">
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
