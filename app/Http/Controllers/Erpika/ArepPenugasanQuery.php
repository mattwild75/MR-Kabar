<?php

namespace App\Http\Controllers\Erpika;

use App\Models\Rpp;
use App\Models\RppCategory;
use App\Models\RppPenugasan;
use Illuminate\Http\Request;

/**
 * Daftar penugasan RPP untuk menu AREP (Surat Tugas & Kendali Mutu): hanya
 * penugasan yang SUDAH punya Surat Tugas (nomor_st terisi), disaring per
 * tahun/jenis dan dicari bebas. Dipakai kedua controller AREP.
 */
trait ArepPenugasanQuery
{
    /** @return array<string, mixed> */
    protected function daftarPenugasan(Request $request): array
    {
        $tahun = $request->input('tahun');
        $jenis = $request->input('jenis');
        $cari = trim((string) $request->input('cari', ''));

        $q = RppPenugasan::query()
            ->whereNotNull('nomor_st')
            ->where('nomor_st', '!=', '')
            ->with(['rpp:id,nomor_rpp,year,rpp_category_id', 'rpp.category:id,name,kode_nomor', 'teamMembers:id,rpp_penugasan_id,nama,role,order', 'obriks:id,rpp_penugasan_id,nama,order'])
            ->when($tahun, fn ($qq) => $qq->whereHas('rpp', fn ($r) => $r->where('year', $tahun)))
            ->when($jenis, fn ($qq) => $qq->whereHas('rpp', fn ($r) => $r->where('rpp_category_id', $jenis)))
            ->when($cari !== '', function ($qq) use ($cari) {
                $qq->where(function ($w) use ($cari) {
                    $w->where('nomor_st', 'like', "%{$cari}%")
                        ->orWhere('uraian', 'like', "%{$cari}%")
                        ->orWhereHas('obriks', fn ($o) => $o->where('nama', 'like', "%{$cari}%"))
                        ->orWhereHas('teamMembers', fn ($t) => $t->where('nama', 'like', "%{$cari}%"));
                });
            });

        $penugasan = $q->get()
            ->sortByDesc(fn (RppPenugasan $p) => [$p->tanggal_st?->timestamp ?? 0, RppPenugasan::uraiNomorSt($p->nomor_st)['n'] ?? 0])
            ->values()
            ->map(function (RppPenugasan $p) {
                $obrik = $p->obriks->pluck('nama')->filter();

                return [
                    'id' => $p->id,
                    'nomor_st' => $p->nomor_st,
                    'tanggal_st' => $p->tanggal_st?->translatedFormat('d M Y'),
                    'jenis' => $p->rpp?->category?->name,
                    'nomor_rpp' => $p->rpp?->nomor_rpp,
                    'tahun' => $p->rpp?->year,
                    'objek' => $obrik->isNotEmpty() ? $obrik->join(', ') : $p->uraian,
                    'ketua_tim' => $p->teamMembers->firstWhere('role', 'kt')?->nama ?? $p->teamMembers->first()?->nama,
                    'jumlah_tim' => $p->teamMembers->count(),
                    'status' => $p->status,
                ];
            })->all();

        return [
            'penugasan' => $penugasan,
            'filter' => ['tahun' => $tahun, 'jenis' => $jenis ? (int) $jenis : null, 'cari' => $cari],
            'tahunTersedia' => Rpp::query()->select('year')->distinct()->orderByDesc('year')->pluck('year')->all(),
            'jenisTersedia' => RppCategory::orderBy('order')->get(['id', 'name'])->all(),
        ];
    }
}
