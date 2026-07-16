<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Akun LAPOR (role 'lapor-risiko') dipakai BERGANTIAN oleh siapa saja
 * (publik, lewat QR code di /panduan) khusus untuk melapor kejadian risiko.
 * Sama pola dengan RestrictCeeSurveyRole: default-deny kecuali whitelist,
 * redirect ke /dashboard (bukan 403 keras) di luar itu.
 */
class RestrictLaporRisikoRole
{
    private const ALLOWED_PREFIXES = [
        '/lapor-kejadian',
        '/dashboard',
        '/panduan',
        '/logout',
        '/session-status',
        '/session-extend',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->hasRole('lapor-risiko')) {
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
