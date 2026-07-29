<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Penjaga tunggal untuk peran `eksekutif`: boleh melihat SELURUH data, tidak
 * boleh mengubah apa pun.
 *
 * Sengaja ditegakkan di SATU titik (seluruh metode yang mengubah state
 * ditolak), bukan dengan menyunting pengecekan peran di 40-an controller.
 * Alasannya: kalau aturannya tersebar, satu controller baru yang lupa
 * memeriksa langsung membocorkan hak tulis. Di sini, fitur apa pun yang
 * ditambahkan kemudian otomatis ikut terkunci tanpa perlu diingat.
 *
 * Yang tetap diizinkan hanya hal yang menyangkut sesi & akun sendiri —
 * tanpa ini pengguna eksekutif tidak bisa keluar dari aplikasi atau
 * mengganti kata sandi sementaranya sendiri.
 */
class ViewerReadOnly
{
    /** Metode HTTP yang mengubah state. */
    private const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

    /**
     * Route yang tetap boleh diakses meski metodenya menulis. Dicocokkan
     * dengan NAMA route, bukan URL, supaya tidak ikut berubah kalau
     * prefix URL-nya diubah.
     */
    private const ALLOWED_ROUTES = [
        'logout',
        'session.extend',
        'password.update',
        'profile.update',
        'notifications.read',
        'notifications.read-all',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->hasRole('eksekutif')) {
            return $next($request);
        }

        if (!in_array($request->method(), self::WRITE_METHODS, true)) {
            return $next($request);
        }

        if (in_array($request->route()?->getName(), self::ALLOWED_ROUTES, true)) {
            return $next($request);
        }

        $pesan = 'Akun peninjau hanya dapat melihat data. Perubahan data tidak diizinkan.';

        if ($request->expectsJson()) {
            return response()->json(['message' => $pesan], 403);
        }

        return back()->with('error', $pesan);
    }
}
