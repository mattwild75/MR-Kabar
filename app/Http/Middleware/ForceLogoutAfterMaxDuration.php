<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ForceLogoutAfterMaxDuration
{
    /**
     * Batas maksimum durasi sesi SEJAK LOGIN (bukan sejak aktivitas
     * terakhir seperti session lifetime bawaan Laravel) — 4 jam, sesuai
     * kebijakan keamanan sesi aplikasi ini. Nilai yg sama juga dipakai di
     * SessionStatusController (poll status) dan session-timeout-warning.tsx
     * (teks peringatan) — ketiganya harus konsisten.
     */
    private const MAX_SESSION_SECONDS = 4 * 60 * 60;

    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $loginAt = $request->session()->get('login_at');

            // Sesi lama sebelum fitur ini ada tidak punya login_at — anggap
            // baru login sekarang, bukan langsung logout paksa.
            if ($loginAt === null) {
                $request->session()->put('login_at', now()->timestamp);
            } elseif (now()->timestamp - $loginAt >= self::MAX_SESSION_SECONDS) {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')
                    ->with('status', 'Sesi Anda telah berakhir setelah 4 jam. Silakan login kembali.');
            }
        }

        return $next($request);
    }
}
