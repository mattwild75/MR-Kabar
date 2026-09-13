<?php

namespace App\Http\Controllers;

use App\Services\PenyimpananService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Utilities > Storage: pemakaian disk per kelompok, dan penghapusan berkas
 * yang aman. Hanya Super Admin — sama alasannya dengan halaman Backup:
 * yang dihapus dari sini hilang untuk semua pengguna.
 */
class PenyimpananController extends Controller
{
    public function __construct(private readonly PenyimpananService $penyimpanan) {}

    private function ensureSuperAdmin(): void
    {
        if (! auth()->user()?->hasRole('super-admin')) {
            abort(403, 'Storage hanya dapat diakses oleh Super Admin.');
        }
    }

    public function index(Request $request)
    {
        $this->ensureSuperAdmin();

        return Inertia::render('storage/Index', [
            'potret' => $this->penyimpanan->potret($request->boolean('segar')),
        ]);
    }

    /** Hapus satu atau beberapa butir sekaligus; tiap butir diperiksa sendiri oleh PenyimpananService. */
    public function hapus(Request $request)
    {
        $this->ensureSuperAdmin();
        $data = $request->validate([
            'butir' => ['required', 'array', 'min:1', 'max:300'],
            'butir.*.jenis' => ['required', 'in:media,cadangan,log,sementara'],
            'butir.*.id' => ['required', 'string', 'max:255'],
        ]);

        $terhapus = [];
        $gagal = [];
        foreach ($data['butir'] as $b) {
            try {
                $terhapus[] = $this->penyimpanan->hapus($b['jenis'], $b['id']);
            } catch (\RuntimeException|\InvalidArgumentException $e) {
                $gagal[] = $b['id'].': '.$e->getMessage();
            }
        }
        if ($terhapus !== []) {
            activity()->causedBy($request->user())->withProperties(['berkas' => $terhapus])->log('Hapus berkas dari Storage');
        }

        if ($gagal !== []) {
            return back()->with('error', ($terhapus !== [] ? count($terhapus).' berkas dihapus; ' : '').'gagal: '.implode('; ', $gagal));
        }

        return back()->with('success', count($terhapus) === 1 ? "Berkas \"{$terhapus[0]}\" dihapus." : count($terhapus).' berkas dihapus.');
    }

    public function bersihkanCache(Request $request)
    {
        $this->ensureSuperAdmin();
        $this->penyimpanan->bersihkanCache();
        activity()->causedBy($request->user())->log('Bersihkan cache dari Storage');

        return redirect()->route('storage.index', ['segar' => 1])->with('success', 'Cache dibersihkan.');
    }
}
