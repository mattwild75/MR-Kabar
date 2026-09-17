<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * ERPIKA (RPP, cetak RPP, pengaturan RPP, dan seluruh /erpika) untuk
 * sementara hanya dibuka untuk admin dan super-admin — keputusan pemilik
 * 17 September 2026, selagi datanya masih dibenahi. Ditegakkan di satu
 * penjaga global berdasar prefix URL (seperti RestrictLaporRisikoRole)
 * supaya rute ERPIKA baru mana pun otomatis ikut tertutup; menu ERPIKA
 * juga disembunyikan lewat izin `erpika-view` yang hanya dimiliki admin.
 */
class ErpikaHanyaAdmin
{
    public const PREFIX = ['/erpika', '/rpp', '/rpp-cetak', '/rpp-pengaturan'];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user || ! self::rutePerluAdmin('/'.ltrim($request->path(), '/'))) {
            return $next($request);
        }
        if ($user->hasAnyRole(['admin', 'super-admin'])) {
            return $next($request);
        }

        $pesan = 'Menu ERPIKA untuk sementara hanya dapat dibuka oleh Admin dan Super Admin.';
        if ($request->expectsJson()) {
            return response()->json(['message' => $pesan], 403);
        }

        return redirect('/dashboard')->with('error', $pesan);
    }

    public static function rutePerluAdmin(string $path): bool
    {
        foreach (self::PREFIX as $p) {
            if ($path === $p || str_starts_with($path, $p.'/')) {
                return true;
            }
        }

        return false;
    }
}
