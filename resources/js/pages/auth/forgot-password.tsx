import { Head, Link, router } from '@inertiajs/react';
import { useState, FormEvent } from 'react';
import { Eye, EyeOff, ArrowLeft, KeyRound, Mail, CheckCircle2 } from 'lucide-react';
import UserLayout from '@/components/layout/UserLayout';
import api from '@/services/api';

export default function ForgotPassword() {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Step 1: Request OTP
    const handleSendOtp = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            const res = await api.post('/forgot-password', { email });
            setMessage(res.data.message || 'Kode OTP telah dikirim ke email Anda.');
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal mengirim kode OTP.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            const res = await api.post('/verify-otp', { email, otp });
            setMessage(res.data.message || 'Kode OTP valid.');
            setStep(3);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kode OTP salah atau telah kadaluarsa.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (password !== passwordConfirmation) {
            setError('Konfirmasi password tidak cocok');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/reset-password', {
                email,
                otp,
                password,
                password_confirmation: passwordConfirmation,
            });
            setMessage(res.data.message || 'Password berhasil diubah.');
            setStep(4);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal mereset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserLayout hideNavbar>
            <Head title="Lupa Password" />
            <div className="max-w-md mx-auto mt-10 p-6 bg-secondary-background border-2 border-border rounded-base shadow-shadow">

                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-6 border-b-2 border-border pb-3">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <KeyRound size={22} className="text-main" /> Lupa Password
                    </h1>
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span className={`px-2 py-0.5 border-2 border-border rounded-base ${step >= 1 ? 'bg-main text-main-foreground' : 'bg-background'}`}>1</span>
                        <span>-</span>
                        <span className={`px-2 py-0.5 border-2 border-border rounded-base ${step >= 2 ? 'bg-main text-main-foreground' : 'bg-background'}`}>2</span>
                        <span>-</span>
                        <span className={`px-2 py-0.5 border-2 border-border rounded-base ${step >= 3 ? 'bg-main text-main-foreground' : 'bg-background'}`}>3</span>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border-2 border-red-800 text-red-900 rounded-base text-xs font-semibold">
                        {error}
                    </div>
                )}

                {message && step !== 4 && (
                    <div className="mb-4 p-3 bg-green-100 border-2 border-green-800 text-green-900 rounded-base text-xs font-semibold">
                        {message}
                    </div>
                )}

                {/* STEP 1: Input Email */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <p className="text-xs text-foreground/80 font-medium">
                            Masukkan email terdaftar Anda. Kami akan mengirimkan 6-digit kode OTP ke email tersebut.
                        </p>
                        <div>
                            <label className="block text-xs font-bold mb-1">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@email.com"
                                    className="w-full border-2 border-border rounded-base px-3 py-2 text-sm bg-secondary-background focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-main text-main-foreground font-bold py-2 text-sm rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all disabled:opacity-50"
                        >
                            {loading ? 'Mengirim OTP...' : 'Kirim Kode OTP'}
                        </button>
                    </form>
                )}

                {/* STEP 2: Input OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <p className="text-xs text-foreground/80 font-medium">
                            Kode OTP 6-digit telah dikirim ke <strong>{email}</strong>. Masukkan kode tersebut di bawah ini.
                        </p>
                        <div>
                            <label className="block text-xs font-bold mb-1">Kode OTP</label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="123456"
                                className="w-full border-2 border-border rounded-base px-3 py-2 text-center text-xl tracking-[8px] font-mono bg-secondary-background focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full bg-main text-main-foreground font-bold py-2 text-sm rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all disabled:opacity-50"
                        >
                            {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
                        </button>

                        <div className="flex justify-between items-center text-xs pt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-foreground/70 hover:text-foreground font-medium underline flex items-center gap-1"
                            >
                                <ArrowLeft size={14} /> Ubah Email
                            </button>
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={loading}
                                className="text-main font-bold hover:underline"
                            >
                                Kirim Ulang OTP
                            </button>
                        </div>
                    </form>
                )}

                {/* STEP 3: Reset Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-3">
                        <p className="text-xs text-foreground/80 font-medium">
                            Kode OTP diverifikasi. Silakan buat password baru Anda.
                        </p>
                        <div>
                            <label className="block text-xs font-bold mb-1">Password Baru</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border-2 border-border rounded-base px-3 py-2 pr-10 text-sm bg-secondary-background focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground"
                                >
                                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold mb-1">Konfirmasi Password Baru</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    minLength={8}
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    className="w-full border-2 border-border rounded-base px-3 py-2 pr-10 text-sm bg-secondary-background focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground"
                                >
                                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-main text-main-foreground font-bold py-2 text-sm rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all disabled:opacity-50 mt-2"
                        >
                            {loading ? 'Mereset Password...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {/* STEP 4: Success */}
                {step === 4 && (
                    <div className="text-center space-y-4 py-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 border-2 border-green-800 text-green-800 rounded-base mb-1">
                            <CheckCircle2 size={28} />
                        </div>
                        <h2 className="text-lg font-bold">Password Berhasil Diubah!</h2>
                        <p className="text-xs text-foreground/80 font-medium">
                            Password Anda telah diperbarui. Silakan login kembali dengan password baru.
                        </p>
                        <Link
                            href="/login"
                            className="inline-block w-full bg-main text-main-foreground font-bold py-2 text-sm rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
                        >
                            Ke Halaman Login
                        </Link>
                    </div>
                )}

                <div className="mt-6 text-center text-xs border-t-2 border-border pt-4">
                    Teringat password?{' '}
                    <Link href="/login" className="font-bold text-main hover:underline">
                        Masuk di sini
                    </Link>
                </div>
            </div>
        </UserLayout>
    );
}
