<?php

/**
 * Pengaturan khusus aplikasi ini yang berasal dari .env.
 *
 * Semuanya dibaca di sini, bukan dengan memanggil env() langsung dari
 * controller atau service. Alasannya bukan kerapian: begitu server
 * menjalankan `php artisan config:cache` — langkah baku saat deploy —
 * Laravel berhenti membaca berkas .env sama sekali, dan setiap env() di luar
 * folder config/ mengembalikan null. Yang rusak karenanya tidak bersuara:
 * QR login akun bersama hanya memantulkan pengguna kembali ke halaman masuk
 * seolah sandinya salah, dan penunjuk lokasi Node untuk cetak PDF diabaikan
 * begitu saja. Dibaca lewat config() seperti ini, nilainya ikut terbawa ke
 * dalam cache config dan tetap benar.
 */
return [

    /*
     * Sandi akun bersama yang dipakai auto-login lewat QR (lihat
     * LaporQrLoginController & CeeSurveyQrLoginController). Sengaja tidak
     * ditulis di kode: kredensialnya memang dibagikan lewat QR, tapi
     * nilainya tetap milik masing-masing server.
     */
    'akun_bersama' => [
        'lapor' => env('LAPOR_ACCOUNT_PASSWORD', ''),
        'cee_survey' => env('CEE_SURVEY_ACCOUNT_PASSWORD', ''),
    ],

    /*
     * Penunjuk lokasi Node & npm untuk Browsershot (cetak PDF). Hanya perlu
     * diisi kalau Browsershot gagal menemukannya sendiri di PATH — umum
     * terjadi karena PATH milik proses PHP-FPM berbeda dari PATH shell.
     */
    'browsershot' => [
        'node_binary' => env('BROWSERSHOT_NODE_BINARY'),
        'npm_binary' => env('BROWSERSHOT_NPM_BINARY'),
    ],

];
