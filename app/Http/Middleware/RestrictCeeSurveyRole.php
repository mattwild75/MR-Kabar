<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Akun CEE_Survey (role 'cee-survey') dipakai BERGANTIAN oleh siapa saja
 * min. eselon IV lintas OPD, khusus mengisi Form Input CEE (1a/1b/1c). Menu
 * lain (termasuk data risiko krs_pemda dkk) sengaja TIDAK punya permission_name
 * di CheckMenuPermission (fail-open utk semua user login) — jadi role ini
 * butuh proteksi TERPISAH & lebih ketat: default-deny kecuali whitelist CEE.
 * Di luar whitelist, redirect balik ke /dashboard (bukan 403 keras) supaya
 * navigasi tersesat tidak memutus sesi/pengalaman login.
 */
class RestrictCeeSurveyRole
{
    /**
     * Prefix path yang boleh diakses role cee-survey (selain logout/session).
     * /data-umum ikut diizinkan karena Form 1c mengambil data Kepala OPD
     * (penandatangan) dari Data Umum milik akun yang login.
     */
    private const ALLOWED_PREFIXES = [
        '/cee',
        '/cetak/cee',
        '/data-umum',
        '/dashboard',
        '/panduan',
        // Termasuk /login/lapor-kejadian & /login/cee-survey. Tanpa ini,
        // perangkat yang tadi dipakai memindai QR CEE akan dipantulkan ke
        // /dashboard begitu memindai QR LAPOR — penjaga ini berjalan pada
        // SETIAP permintaan, jadi ia menolak URL QR-nya lebih dulu, sebelum
        // controller sempat menukar sesinya ke akun bersama yang benar.
        '/login',
        '/logout',
        '/session-status',
        '/session-extend',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if (! self::bolehAkses($request->user(), '/'.ltrim($request->path(), '/'))) {
            return redirect('/dashboard');
        }

        return $next($request);
    }

    /**
     * Apakah $user boleh membuka $path menurut aturan peran ini?
     *
     * Dijadikan publik supaya QrLoginController bisa bertanya lebih dulu —
     * "kalau sesi yang sedang aktif ini dibiarkan, apakah dia akan sampai ke
     * form tujuan?" — tanpa menyalin ulang daftar whitelist di atas. Kalau
     * disalin, suatu saat daftarnya berubah di satu tempat saja dan QR-nya
     * kembali membuang orang ke dashboard tanpa ada yang menyadari.
     */
    public static function bolehAkses(?Authenticatable $user, string $path): bool
    {
        if (! $user || ! $user->hasRole('cee-survey')) {
            return true;
        }

        return collect(self::ALLOWED_PREFIXES)->contains(
            fn ($prefix) => $path === $prefix || str_starts_with($path, rtrim($prefix, '/').'/')
        );
    }
}
