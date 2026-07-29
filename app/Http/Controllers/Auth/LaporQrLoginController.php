<?php

namespace App\Http\Controllers\Auth;

/**
 * Auto-login sekali klik ke akun bersama LAPOR (role 'lapor-risiko'),
 * dipakai QR code di /panduan supaya pelapor kejadian risiko di lapangan
 * tidak perlu mengetik kredensial manual — langsung diarahkan ke form
 * lapor. Kredensial akun ini SENGAJA publik (disebar lewat QR), jadi
 * endpoint ini tidak butuh proteksi token tambahan; scope aksesnya sendiri
 * sudah dikunci ketat oleh RestrictLaporRisikoRole.
 *
 * Perilaku saat peramban sudah punya sesi lain dijelaskan di QrLoginController.
 *
 * Password dibaca lewat config('mrkabar.akun_bersama.lapor'), yang
 * mengambilnya dari LAPOR_ACCOUNT_PASSWORD di .env (lihat
 * LaporanKejadianSeeder) — TIDAK di-hardcode supaya tidak ikut ter-commit ke
 * riwayat git. Sengaja lewat config(), bukan env() langsung: setelah server
 * menjalankan `php artisan config:cache`, env() di luar folder config/
 * mengembalikan null, dan QR ini akan memantulkan pelapor kembali ke halaman
 * masuk seolah sandinya salah — tanpa pesan galat apa pun.
 */
class LaporQrLoginController extends QrLoginController
{
    protected function username(): string
    {
        return 'LAPOR';
    }

    protected function sandi(): string
    {
        return (string) config('mrkabar.akun_bersama.lapor');
    }

    protected function tujuan(): string
    {
        return '/lapor-kejadian';
    }
}
