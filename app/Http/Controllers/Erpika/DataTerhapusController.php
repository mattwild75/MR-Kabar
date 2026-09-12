<?php

namespace App\Http\Controllers\Erpika;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Rpp;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * ERPIKA > Data Terhapus — mengikuti pola Data Terhapus MR Kabar
 * (TrashController), tetapi berdiri sendiri karena ERPIKA kelak dicabut
 * menjadi aplikasi terpisah: hanya tabel ERPIKA (dokumen RPP berikut
 * penugasannya, dan pegawai), halaman React yang sama dipakai ulang lewat
 * prop basePath.
 *
 * Dokumen RPP yang dihapus membawa serta penugasan, tim, obrik, dan
 * laporannya (mereka tidak ber-soft-delete sendiri, tetapi ikut hidup lagi
 * saat dokumennya dipulihkan karena hanya induknya yang ditandai terhapus).
 */
class DataTerhapusController extends Controller
{
    private function types(): array
    {
        return [
            'rpp' => [
                'model' => Rpp::class,
                'label' => 'Dokumen RPP',
                'judul' => fn (Rpp $r) => $r->nomor_rpp.' — '.$r->subJudulTampil(),
                'sub' => fn (Rpp $r) => array_filter([
                    $r->category?->name,
                    $r->penugasan()->count().' penugasan',
                    $r->user?->name ? 'dibuat '.$r->user->name : null,
                ]),
                'with' => ['category', 'user'],
                'owned' => true,
            ],
            'pegawai' => [
                'model' => Employee::class,
                'label' => 'Pegawai',
                'judul' => fn (Employee $e) => $e->nama,
                'sub' => fn (Employee $e) => array_filter([$e->nip ? 'NIP '.$e->nip : null, $e->unit_kerja, $e->jabatan]),
                'with' => [],
                'owned' => false,
            ],
        ];
    }

    private function isAdmin(): bool
    {
        return auth()->user()?->canViewAllOpd() ?? false;
    }

    private function trashedQuery(array $type)
    {
        /** @var class-string<Model> $model */
        $model = $type['model'];
        $query = $model::onlyTrashed()->with($type['with'])->orderByDesc('deleted_at');

        if (! $this->isAdmin()) {
            if ($type['owned']) {
                $query->where('user_id', auth()->id());
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        return $query;
    }

    public function index(Request $request)
    {
        $types = $this->types();
        $active = (string) $request->query('type', array_key_first($types));
        if (! isset($types[$active])) {
            $active = array_key_first($types);
        }

        $counts = [];
        foreach ($types as $slug => $type) {
            $counts[$slug] = $this->trashedQuery($type)->count();
        }

        $type = $types[$active];
        $rows = $this->trashedQuery($type)->limit(500)->get()->map(fn (Model $row) => [
            'id' => $row->getKey(),
            'batch' => null,
            'title' => (string) ($type['judul'])($row),
            'subtitles' => array_values(($type['sub'])($row)),
            'deleted_at' => optional($row->deleted_at)->toDateTimeString(),
        ]);

        return Inertia::render('trash/Index', [
            'tabs' => collect($types)->map(fn ($t, $slug) => ['slug' => $slug, 'label' => $t['label'], 'count' => $counts[$slug]])->values(),
            'activeType' => $active,
            'rows' => $rows,
            'isAdmin' => $this->isAdmin(),
            'basePath' => '/erpika/data-terhapus',
            'judul' => 'Data Terhapus ERPIKA',
        ]);
    }

    private function findTrashed(string $slug, int $id): array
    {
        $types = $this->types();
        if (! isset($types[$slug])) {
            abort(404, 'Jenis data tidak dikenal.');
        }
        $row = $this->trashedQuery($types[$slug])->whereKey($id)->first();
        if (! $row) {
            abort(404, 'Data terhapus tidak ditemukan atau bukan milik Anda.');
        }

        return [$types[$slug], $row];
    }

    public function restore(Request $request, string $type, int $id)
    {
        [, $row] = $this->findTrashed($type, $id);

        // Nomor RPP unik per tahun: kalau nomor itu sudah dipakai dokumen lain
        // sesudah penghapusan, pemulihan ditolak, bukan dibiarkan bentrok.
        if ($row instanceof Rpp && Rpp::where('year', $row->year)->where('nomor_rpp', $row->nomor_rpp)->exists()) {
            return back()->with('error', 'Nomor '.$row->nomor_rpp.' tahun '.$row->year.' sudah dipakai dokumen lain; ubah nomor dokumen itu dulu.');
        }

        $row->restore();

        return back()->with('success', 'Data berhasil dipulihkan.');
    }

    public function forceDelete(Request $request, string $type, int $id)
    {
        if (! $this->isAdmin()) {
            abort(403, 'Hanya Admin/Super Admin yang dapat menghapus permanen.');
        }

        [, $row] = $this->findTrashed($type, $id);

        if ($row instanceof Employee && $row->teamMemberships()->exists()) {
            return back()->with('error', 'Pegawai ini masih dipakai di tim RPP; tidak bisa dihapus permanen.');
        }

        $row->forceDelete();

        return back()->with('success', 'Data dihapus permanen.');
    }
}
