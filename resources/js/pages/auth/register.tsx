import { Head, Link, router } from '@inertiajs/react';
import { useState, FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import UserLayout from '@/components/layout/UserLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export default function Register() {
    const { setUser, setToken } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/register', { name, email, phone, password, password_confirmation: passwordConfirmation });
            const authData = res.data.data ?? res.data;
            setToken(authData.token);
            setUser(authData.user);
            router.visit('/verify-email');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserLayout hideNavbar>
            <Head title="Register" />
            <div className="max-w-sm mx-auto p-4 bg-secondary-background border-2 border-border rounded-base shadow-shadow">
                <h1 className="text-xl font-bold mb-3 text-center">Create Account</h1>
                {error && <p className="text-red-500 mb-2 text-xs">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-2.5">
                    <div>
                        <label className="block text-xs font-medium mb-0.5">Name</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)}
                            className="w-full border-2 border-border rounded-base px-2.5 py-1 text-sm bg-secondary-background focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-0.5">Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full border-2 border-border rounded-base px-2.5 py-1 text-sm bg-secondary-background focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-0.5">Phone</label>
                        <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                            className="w-full border-2 border-border rounded-base px-2.5 py-1 text-sm bg-secondary-background focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-0.5">Password</label>
                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full border-2 border-border rounded-base px-2.5 py-1 pr-8 text-sm bg-secondary-background focus:outline-none focus:ring-2 focus:ring-ring" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-all duration-200 transform hover:scale-110 active:scale-90">
                                {showPassword ? <Eye size={16} className="animate-in fade-in zoom-in-75 duration-200" /> : <EyeOff size={16} className="animate-in fade-in zoom-in-75 duration-200" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-0.5">Confirm Password</label>
                        <div className="relative">
                            <input type={showConfirmPassword ? 'text' : 'password'} required value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)}
                                className="w-full border-2 border-border rounded-base px-2.5 py-1 pr-8 text-sm bg-secondary-background focus:outline-none focus:ring-2 focus:ring-ring" />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-all duration-200 transform hover:scale-110 active:scale-90">
                                {showConfirmPassword ? <Eye size={16} className="animate-in fade-in zoom-in-75 duration-200" /> : <EyeOff size={16} className="animate-in fade-in zoom-in-75 duration-200" />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full bg-main text-main-foreground font-semibold py-1.5 text-sm rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all disabled:opacity-50 mt-1">
                        {loading ? 'Creating...' : 'Register'}
                    </button>
                </form>
                <div className="mt-3 text-center text-xs">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-semibold text-main hover:underline">
                        Masuk di sini
                    </Link>
                </div>
            </div>
        </UserLayout>
    );
}
