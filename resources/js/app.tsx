import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from '@/contexts/AuthContext';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: {
        color: '#4B5563',
    },
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
        return (pages[`./pages/${name}.tsx`] as { default: React.ComponentType<unknown> }).default;
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <AuthProvider>
                <App {...props} />
            </AuthProvider>
        );
    },
});
