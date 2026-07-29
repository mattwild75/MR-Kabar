<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Server Side Rendering
    |--------------------------------------------------------------------------
    |
    | SSR SENGAJA DIMATIKAN secara bawaan.
    |
    | Berkas bundle-nya (bootstrap/ssr/ssr.js) memang ada karena ikut terbangun
    | oleh `npm run build`, dan keberadaan berkas itu membuat Inertia mencoba
    | meminta render ke http://127.0.0.1:13714 pada SETIAP permintaan halaman.
    | Selama tidak ada proses `php artisan inertia:start-ssr` yang berjalan,
    | percobaan koneksi itu baru menyerah setelah ~2 detik — dan 2 detik itu
    | ditanggung oleh setiap halaman aplikasi.
    |
    | Terukur: TTFB halaman turun dari ~2,2 detik menjadi ~0,15 detik setelah
    | opsi ini dimatikan, tanpa ada perubahan tampilan sama sekali (aplikasi
    | ini toh di-render di sisi peramban).
    |
    | Kalau suatu saat SSR benar-benar dipakai, nyalakan lewat .env:
    |   INERTIA_SSR_ENABLED=true
    | dan pastikan `php artisan inertia:start-ssr` berjalan sebagai layanan.
    |
    */

    'ssr' => [
        'enabled' => env('INERTIA_SSR_ENABLED', false),
        'url' => env('INERTIA_SSR_URL', 'http://127.0.0.1:13714'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Testing
    |--------------------------------------------------------------------------
    |
    | Lokasi berkas halaman, dipakai assertion pengujian untuk memastikan
    | komponen yang dirujuk benar-benar ada.
    |
    */

    'testing' => [
        'ensure_pages_exist' => true,
        'page_paths' => [
            resource_path('js/pages'),
        ],
        'page_extensions' => [
            'js',
            'jsx',
            'svelte',
            'ts',
            'tsx',
            'vue',
        ],
    ],

];
