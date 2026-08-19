import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { toast } from 'sonner';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

/**
 * Pengaman peran peninjau (`eksekutif`) di sisi peramban.
 *
 * Dipasang SEKALI di sini, bukan disebar sebagai pengecekan di puluhan
 * halaman: satu halaman baru yang lupa memeriksa langsung membocorkan tombol
 * yang bisa ditekan. Di sini, setiap kunjungan yang mengubah data dibatalkan
 * lebih awal berikut penjelasannya — jadi pengguna tidak menunggu permintaan
 * pulang-pergi hanya untuk ditolak.
 *
 * Ini murni kenyamanan. Larangan yang sebenarnya ditegakkan middleware
 * ViewerReadOnly di server, yang tetap menolak walau JavaScript ini dilewati.
 */
const AMAN_UNTUK_PENINJAU = ['logout', 'session-extend', 'notifications', 'settings/password'];

// Perannya tidak berubah selama sesi berjalan (ganti akun = muat ulang penuh),
// jadi cukup dibaca sekali dari props halaman pertama.
const isViewer = (() => {
    try {
        const raw = document.getElementById('app')?.dataset.page;
        return Boolean(raw && JSON.parse(raw)?.props?.auth?.isViewer);
    } catch {
        return false;
    }
})();

if (isViewer) {
    router.on('before', (event) => {
        const { method, url } = event.detail.visit;
        if (!method || method.toLowerCase() === 'get') return;
        if (AMAN_UNTUK_PENINJAU.some((s) => String(url).includes(s))) return;

        toast.error('Mode Peninjau — akun ini hanya dapat melihat data, tidak dapat mengubahnya.');
        event.preventDefault();
    });
}

// This will set light / dark mode on load...
initializeTheme();
