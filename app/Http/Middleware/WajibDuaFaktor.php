<?php

namespace App\Http\Middleware;

use App\Services\DuaFaktorService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Menahan pemegang akses tertinggi sampai tahap kedua terlampaui.
 *
 * Dua keadaan yang ditangani, dan keduanya harus dipisah:
 *
 *  1. 2FA sudah aktif tetapi kodenya belum dimasukkan pada sesi ini
 *     -> dipantulkan ke layar tantangan.
 *
 *  2. Perannya mewajibkan 2FA tetapi ia belum memasangnya sama sekali
 *     -> dipantulkan ke Pengaturan Profil, dengan penjelasan.
 *
 * Keadaan kedua yang membuat kewajibannya berarti. Tanpa itu, "wajib" hanya
 * berlaku bagi yang sudah sukarela memasangnya — yaitu justru orang yang
 * paling tidak perlu dipaksa.
 *
 * Sengaja dipasang GLOBAL di grup web, bukan ditempel per-rute. Penjaga
 * keamanan yang harus diingat-ingat untuk dipasang cepat atau lambat akan
 * terlewat di satu rute; audit PASS 1 menemukan persis kekeliruan seperti itu
 * pada penjaga akses OPD yang disalin, bukan dipakai bersama.
 */
class WajibDuaFaktor
{
    /**
     * Boleh dibuka dalam keadaan apa pun.
     *
     * Layar tantangan itu sendiri harus ada di sini — kalau tidak,
     * pemantulannya berputar tanpa ujung. `logout` wajib ada supaya orang
     * yang ponselnya tidak di tangan tetap bisa keluar.
     */
    private const SELALU_BOLEH = [
        'dua-faktor',
        'logout',
    ];

    /**
     * Tambahan yang boleh dibuka HANYA selagi memasang 2FA (keadaan 2).
     *
     * SENGAJA TIDAK berlaku bagi keadaan 1. Orang yang sudah menyerahkan
     * sandi tetapi belum melewati tahap kedua belum boleh menyentuh apa pun,
     * halaman profilnya sekalipun: dari sana surelnya bisa diganti, dan
     * surel yang berganti membuka jalan lewat pemulihan sandi. Lapisan kedua
     * yang bisa dilangkahi lewat satu halaman bukan lapisan kedua.
     */
    private const BOLEH_SAAT_MEMASANG = [
        'settings/profile',
        'settings/dua-faktor',
        'session-status',
        'session-extend',
        'notifications',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user) {
            return $next($request);
        }

        $jalur = ltrim($request->path(), '/');
        $duaFaktor = app(DuaFaktorService::class);

        // Keadaan 1: sudah aktif, tahap kedua belum dilewati pada sesi ini.
        if ($duaFaktor->aktif($user) && ! $request->session()->get('dua_faktor_lulus')) {
            if ($this->cocok($jalur, self::SELALU_BOLEH)) {
                return $next($request);
            }

            return $request->expectsJson()
                ? response()->json(['message' => 'Autentikasi dua faktor diperlukan.'], 423)
                : redirect()->route('dua-faktor.tampil');
        }

        // Keadaan 2: perannya mewajibkan, tetapi belum dipasang sama sekali.
        if ($duaFaktor->wajibBagi($user) && ! $duaFaktor->aktif($user)) {
            if ($this->cocok($jalur, self::SELALU_BOLEH) || $this->cocok($jalur, self::BOLEH_SAAT_MEMASANG)) {
                return $next($request);
            }

            return $request->expectsJson()
                ? response()->json(['message' => 'Autentikasi dua faktor wajib dipasang.'], 423)
                : redirect()->route('profile.edit')->with('warning',
                    'Akun Anda memegang akses lintas perangkat daerah, jadi autentikasi dua faktor wajib dipasang '
                    .'sebelum menu lain dapat dibuka. Ikuti langkahnya di bagian Autentikasi Dua Faktor di bawah.');
        }

        return $next($request);
    }

    /**
     * @param  array<int, string>  $daftar
     */
    private function cocok(string $jalur, array $daftar): bool
    {
        foreach ($daftar as $izin) {
            if ($jalur === $izin || str_starts_with($jalur, $izin.'/')) {
                return true;
            }
        }

        return false;
    }
}
