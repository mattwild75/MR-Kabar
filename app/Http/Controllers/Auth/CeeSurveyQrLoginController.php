<?php

namespace App\Http\Controllers\Auth;

/**
 * Auto-login sekali klik ke akun bersama CEE_Survey (role 'cee-survey'),
 * dipakai QR code di /panduan supaya responden CEE lintas-OPD tidak perlu
 * mengetik kredensial manual — langsung diarahkan ke 1a_Kuesioner CEE. Sama
 * pola dengan LaporQrLoginController (akun bersama LAPOR): kredensial akun
 * ini SENGAJA dipakai bersama (disebar lewat QR), scope aksesnya dikunci
 * ketat oleh RestrictCeeSurveyRole + ShareMenus (whitelist menu CEE saja).
 *
 * Perilaku saat peramban sudah punya sesi lain dijelaskan di QrLoginController.
 *
 * Password dibaca lewat config('mrkabar.akun_bersama.cee_survey'), yang
 * mengambilnya dari CEE_SURVEY_ACCOUNT_PASSWORD di .env — TIDAK hardcode di
 * kode. Sengaja lewat config(), bukan env() langsung: setelah server
 * menjalankan `php artisan config:cache`, env() di luar folder config/
 * mengembalikan null, dan QR ini akan memantulkan responden kembali ke
 * halaman masuk seolah sandinya salah — tanpa pesan galat apa pun.
 */
class CeeSurveyQrLoginController extends QrLoginController
{
    protected function username(): string
    {
        return 'CEE_Survey';
    }

    protected function sandi(): string
    {
        return (string) config('mrkabar.akun_bersama.cee_survey');
    }

    protected function tujuan(): string
    {
        return '/cee/1a';
    }
}
