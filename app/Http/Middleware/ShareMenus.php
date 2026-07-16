<?php

namespace App\Http\Middleware;

use App\Models\Menu;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ShareMenus
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Akun bersama CEE_Survey (role 'cee-survey') hanya mengisi CEE —
        // grup menu risiko lain sudah diblok RestrictCeeSurveyRole di
        // backend, tapi tetap disembunyikan di sini biar tidak membingungkan.
        $hiddenTitlesForCeeSurvey = [
            'Risiko Strategis Pemda',
            'Risiko Strategis PD',
            'Risiko Operasional PD',
            'Kelola Pertanyaan CEE',
        ];

        // Akun bersama LAPOR (role 'lapor-risiko') hanya perlu Dashboard,
        // panduan, dan menu form lapor itu sendiri — WHITELIST (bukan
        // blacklist seperti CeeSurvey di atas) karena akun ini dipakai
        // publik lewat QR code, jadi sengaja dibuat seminimal mungkin
        // menu yang terlihat. Proteksi sesungguhnya tetap di
        // RestrictLaporRisikoRole (backend), ini cuma menyembunyikan menu
        // yang toh akan ditolak kalau diklik supaya tidak membingungkan.
        $allowedTitlesForLaporRisiko = [
            'Dashboard',
            'Apa itu Manajemen Risiko / MR Kabar',
            'Utilities',
            'Lapor Kejadian Risiko',
        ];

        Inertia::share('menus', function () use ($user, $hiddenTitlesForCeeSurvey, $allowedTitlesForLaporRisiko) {
            if (!$user) return [];

            $isCeeSurvey = $user->hasRole('cee-survey');
            $canManageCeeQuestions = $user->hasAnyRole(['admin', 'super-admin']);
            $isLaporRisiko = $user->hasRole('lapor-risiko');

            // Ambil semua menu secara flat dan hapus duplikat yang sama persis
            $allMenus = Menu::orderBy('parent_id')
                ->orderBy('order')
                ->get()
                ->unique(function ($menu) {
                    return implode('|', [
                        $menu->parent_id ?? 'root',
                        $menu->title,
                        $menu->route ?? '',
                        $menu->icon ?? '',
                        $menu->permission_name ?? '',
                    ]);
                })
                ->values();

            // Index berdasarkan ID
            $indexed = $allMenus->keyBy('id');

            // Recursive builder (filtered by permission)
            $buildTree = function ($parentId = null) use (&$buildTree, $indexed, $user, $isCeeSurvey, $hiddenTitlesForCeeSurvey, $canManageCeeQuestions, $isLaporRisiko, $allowedTitlesForLaporRisiko) {
                return $indexed
                    ->filter(
                        fn($menu) =>
                        $menu->parent_id === $parentId &&
                            (!$menu->permission_name || $user->can($menu->permission_name)) &&
                            !($isCeeSurvey && in_array($menu->title, $hiddenTitlesForCeeSurvey, true)) &&
                            !($menu->title === 'Kelola Pertanyaan CEE' && !$canManageCeeQuestions) &&
                            (!$isLaporRisiko || in_array($menu->title, $allowedTitlesForLaporRisiko, true))
                    )
                    ->map(function ($menu) use (&$buildTree) {
                        $menu->children = $buildTree($menu->id)->values();
                        return $menu;
                    })
                    ->filter(
                        fn($menu) =>
                        ($menu->route && $menu->route !== '#') || $menu->children->isNotEmpty()
                    )
                    ->values();
            };

            $menus = $buildTree();

            return $menus;
        });

        return $next($request);
    }
}
