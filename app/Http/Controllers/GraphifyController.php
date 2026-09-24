<?php

namespace App\Http\Controllers;

use App\Services\Graphify\GraphifyService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Utilities > Graphify — peta pengetahuan seluruh MR Kabar (kode, rute,
 * menu, izin, basis data, halaman, dokumen, regulasi, konsep). Hanya
 * Admin dan Super Admin: peta memuat susunan internal aplikasi. Menu
 * memakai izin 'graphify-view'; penjaga di sini memastikan peran lain
 * (termasuk peninjau) tetap ditolak walau izinnya pernah terpasang.
 */
class GraphifyController extends Controller
{
    public function __construct(private readonly GraphifyService $graphify) {}

    private function ensureAdmin(): void
    {
        if (! auth()->user()?->hasAnyRole(['admin', 'super-admin'])) {
            abort(403, 'Graphify hanya dapat diakses oleh Admin dan Super Admin.');
        }
    }

    public function index()
    {
        $this->ensureAdmin();
        // Peta dibangun sekali bila belum ada (instalasi baru).
        $meta = $this->graphify->meta() ?? $this->graphify->bangun();

        return Inertia::render('graphify/Index', [
            'meta' => $meta,
            'jenis' => GraphifyService::JENIS,
        ]);
    }

    /** Data graf lengkap (JSON) untuk peta interaktif. */
    public function data()
    {
        $this->ensureAdmin();

        return response()->json($this->graphify->graf() ?? abort(404));
    }

    public function bangun(Request $request)
    {
        $this->ensureAdmin();
        $meta = $this->graphify->bangun();
        activity()->causedBy($request->user())->withProperties($meta)->log('Bangun ulang Graphify');

        return back()->with('success', "Graphify dibangun ulang: {$meta['simpul']} simpul, {$meta['relasi']} relasi, {$meta['komunitas']} komunitas.");
    }

    public function unduh(string $jenis)
    {
        $this->ensureAdmin();
        [$berkas, $nama] = match ($jenis) {
            'json' => ['graph.json', 'graphify-mrkabar-graph.json'],
            'laporan' => ['laporan.md', 'graphify-mrkabar-laporan.md'],
            default => abort(404),
        };
        if (! is_file($this->graphify->path($berkas))) {
            $this->graphify->bangun();
        }

        return response()->download($this->graphify->path($berkas), $nama);
    }
}
