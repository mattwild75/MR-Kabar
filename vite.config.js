import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import {
    defineConfig
} from 'vite';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    build: {
        // Pustaka pihak ketiga dipisah ke berkas sendiri: isinya jarang berubah,
        // jadi tetap tersimpan di cache peramban walau kode aplikasi di-deploy
        // ulang; halaman berat (dasbor, sidebar) tidak lagi membawa ulang
        // React/Radix tiap rilis. Ikon lucide sengaja TIDAK disatukan: pemilih ikon
        // Menu Manager memuat seluruh pustaka, dan itu harus tetap terpisah per halaman.
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return undefined;
                    if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) return 'vendor-react';
                    if (id.includes('@radix-ui')) return 'vendor-radix';
                    if (id.includes('recharts') || id.includes('d3-')) return 'vendor-grafik';
                    if (id.includes('@inertiajs') || id.includes('axios')) return 'vendor-inertia';
                    return undefined;
                },
            },
        },
        chunkSizeWarningLimit: 900,
    },
});