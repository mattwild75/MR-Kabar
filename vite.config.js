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
    // Pemisahan bundel pustaka lewat manualChunks sengaja TIDAK dipakai: pada
    // 13 September 2026 pemisahan React dari Radix/Inertia membuat satu chunk
    // membaca React sebelum terinisialisasi ("reading 'forwardRef'") dan seluruh
    // halaman kosong di produksi. Rollup membagi per halaman dengan sendirinya.
    build: {
        chunkSizeWarningLimit: 900,
    },
});