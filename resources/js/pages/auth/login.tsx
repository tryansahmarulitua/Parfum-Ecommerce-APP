import { Head, Link, router } from '@inertiajs/react';
import { useState, FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import UserLayout from '@/components/layout/UserLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export default function Login() {
    const { setUser, setToken } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/login', { email, password });
            const authData = res.data.data ?? res.data;
            setToken(authData.token);
            setUser(authData.user);
            if (authData.user?.role === 'admin') {
                router.visit('/admin/dashboard');
            } else {
                router.visit('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserLayout hideNavbar>
            <Head title="Login" />
            <div className="max-w-md mx-auto mt-10 p-6 bg-secondary-background border-2 border-border rounded-base shadow-shadow">
                <h1 className="text-2xl font-bold mb-6">Login</h1>
                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full border-2 border-border rounded-base px-3 py-2 bg-secondary-background focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium">Password</label>
                            <Link href="/forgot-password" className="text-xs font-medium text-main hover:underline">
                                Lupa password?
                            </Link>
                        </div>
                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full border-2 border-border rounded-base px-3 py-2 pr-10 bg-secondary-background focus:outline-none focus:ring-2 focus:ring-ring" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-all duration-200 transform hover:scale-110 active:scale-90">
                                {showPassword ? <Eye size={18} className="animate-in fade-in zoom-in-75 duration-200" /> : <EyeOff size={18} className="animate-in fade-in zoom-in-75 duration-200" />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full bg-main text-main-foreground font-semibold py-2 rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all disabled:opacity-50">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Belum punya akun?{' '}
                    <Link href="/register" className="font-semibold text-main hover:underline">
                        Daftar di sini
                    </Link>
                </div>
            </div>
        </UserLayout>
    );
}
