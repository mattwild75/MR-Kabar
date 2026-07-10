<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Menu;

class CheckMenuPermission
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Abaikan jika belum login
        if (!$user) {
            return redirect()->route('login');
        }

        // Path aktual yang diakses, mis. "menus/5/edit" atau "krs_pemda/12".
        // $request->route()->uri() mengembalikan POLA route (mis.
        // "menus/{menu}/edit"), yang tidak akan pernah cocok dengan path
        // literal yang tersimpan di kolom `menus.route` (mis. "/menus") —
        // sehingga semua sub-route berparameter (edit/update/destroy dsb.)
        // lolos tanpa pengecekan permission sama sekali. Di sini kita
        // cocokkan `menus.route` sebagai PREFIX dari path aktual, supaya
        // sub-route ikut permission menu induknya.
        $path = '/' . ltrim($request->path(), '/');

        $menu = Menu::whereNotNull('route')
            ->where('route', '!=', '')
            ->where('route', '!=', '#')
            ->get()
            ->filter(fn ($m) => $path === $m->route || str_starts_with($path, rtrim($m->route, '/') . '/'))
            ->sortByDesc(fn ($m) => strlen($m->route))
            ->first();

        // Menu dengan permission_name dicek izinnya. Menu TANPA permission_name
        // (mis. halaman visualisasi & data risiko krs_pemda/irs_pemda/krs_pd/
        // irs_pd/kro_pd/iro_pd) memang sengaja terbuka untuk semua user yang
        // sudah login — proteksi tulis (create/update/delete) ditangani di
        // level controller (ensureCanManage / RiskOwnershipPolicy), bukan di
        // sini. Jadi middleware ini fail-open untuk menu tanpa permission:
        // JANGAN diubah jadi default-deny, itu akan memblokir 403 halaman yang
        // seharusnya bisa diakses semua user.
        if ($menu && $menu->permission_name) {
            if (!$user->can($menu->permission_name)) {
                abort(403, 'Anda tidak memiliki izin untuk mengakses halaman ini.');
            }
        }

        return $next($request);
    }
}
