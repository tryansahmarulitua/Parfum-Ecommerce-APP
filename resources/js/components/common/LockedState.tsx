import React from 'react';
import { Link } from '@inertiajs/react';
import { Lock, LogIn, UserPlus } from 'lucide-react';

interface LockedStateProps {
    title?: string;
    description?: string;
}

export default function LockedState({
    title = 'Akses Terkunci',
    description = 'Silakan masuk ke akun Anda terlebih dahulu untuk mengakses fitur ini.',
}: LockedStateProps) {
    return (
        <div className="bg-secondary-background border-2 border-border p-8 rounded-base text-center max-w-md mx-auto my-12 shadow-shadow flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-main/20 rounded-full border-2 border-border flex items-center justify-center">
                <Lock className="w-8 h-8 text-main" />
            </div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-foreground/70 text-sm max-w-xs">{description}</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
                <Link
                    href="/login"
                    className="flex-1 bg-main text-main-foreground font-semibold px-4 py-2.5 rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all flex items-center justify-center gap-2"
                >
                    <LogIn className="w-4 h-4" /> Masuk
                </Link>
                <Link
                    href="/register"
                    className="flex-1 bg-background text-foreground font-semibold px-4 py-2.5 rounded-base border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all flex items-center justify-center gap-2"
                >
                    <UserPlus className="w-4 h-4" /> Daftar
                </Link>
            </div>
        </div>
    );
}
