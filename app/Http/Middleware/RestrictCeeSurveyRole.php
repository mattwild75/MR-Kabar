<?php

namespace App\Http\Middleware;

use Closure;
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
        '/logout',
        '/session-status',
        '/session-extend',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->hasRole('cee-survey')) {
            $path = '/' . ltrim($request->path(), '/');
            $allowed = collect(self::ALLOWED_PREFIXES)->contains(
                fn ($prefix) => $path === $prefix || str_starts_with($path, rtrim($prefix, '/') . '/')
            );

            if (!$allowed) {
                return redirect('/dashboard');
            }
        }

        return $next($request);
    }
}
