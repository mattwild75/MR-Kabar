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

        Inertia::share('menus', function () use ($user, $hiddenTitlesForCeeSurvey) {
            if (!$user) return [];

            $isCeeSurvey = $user->hasRole('cee-survey');

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
            $buildTree = function ($parentId = null) use (&$buildTree, $indexed, $user, $isCeeSurvey, $hiddenTitlesForCeeSurvey) {
                return $indexed
                    ->filter(
                        fn($menu) =>
                        $menu->parent_id === $parentId &&
                            (!$menu->permission_name || $user->can($menu->permission_name)) &&
                            !($isCeeSurvey && in_array($menu->title, $hiddenTitlesForCeeSurvey, true))
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
