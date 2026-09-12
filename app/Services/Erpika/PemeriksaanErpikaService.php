<?php

namespace App\Services\Erpika;

use App\Models\Employee;
use App\Models\Rpp;
use App\Models\RppPenugasan;
use App\Models\RppTeamMember;
use Illuminate\Support\Collection;

/**
 * Pemeriksaan keutuhan data ERPIKA — HANYA MENANDAI, tidak pernah mengubah.
 * Setiap temuan menunjuk baris yang bersangkutan supaya pengelola yang
 * memutuskan lewat formulir yang ada. Dipakai halaman ERPIKA → Pemeriksaan
 * dan kartu ringkas di RPP Perencanaan/Aneva.
 *
 * Kelompok temuan:
 *  - ST ganda: nomor ST yang dipakai lebih dari satu penugasan pada tahun sama;
 *  - tanpa uraian: penugasan yang uraiannya kosong atau "-";
 *  - ST tanpa tanggal / masa tugas tanpa ST;
 *  - status tidak selaras: laporan sudah ada tetapi status belum lhp_terbit,
 *    atau status lhp_terbit tanpa satu pun laporan;
 *  - tumpang tindih mustahil: satu pegawai di dua penugasan beririsan yang
 *    jumlah hari lapangannya melebihi hari kalender gabungan;
 *  - pegawai aktif tanpa NIP yang dipakai dalam tim;
 *  - selisih RPP-Aneva: penugasan yang tidak pernah disinkron dari aneva pada
 *    tahun yang seluruh penugasan lainnya sudah disinkron.
 */
class PemeriksaanErpikaService
{
    /** @return array{temuan: array<string, list<array<string,mixed>>>, jumlah: int, tahun: int|string} */
    public function periksa(int|string $tahun): array
    {
        $penugasan = RppPenugasan::query()
            ->with(['rpp:id,nomor_rpp,year,rpp_category_id', 'teamMembers:id,rpp_penugasan_id,employee_id,nama,hari_lapangan', 'laporans:id,rpp_penugasan_id,nomor_laporan'])
            ->whereHas('rpp', fn ($q) => $tahun === 'semua' ? $q : $q->where('year', $tahun))
            ->get();

        $temuan = [
            'st_ganda' => $this->stGanda($penugasan),
            'tanpa_uraian' => $this->tanpaUraian($penugasan),
            'st_tanpa_tanggal' => $this->stTanpaTanggal($penugasan),
            'masa_tanpa_st' => $this->masaTanpaSt($penugasan),
            'status_tidak_selaras' => $this->statusTidakSelaras($penugasan),
            'tumpang_tindih' => $this->tumpangTindih($penugasan),
            'pegawai_tanpa_nip' => $this->pegawaiTanpaNip(),
            'belum_sinkron_aneva' => $this->belumSinkronAneva($penugasan),
        ];

        return ['temuan' => $temuan, 'jumlah' => array_sum(array_map('count', $temuan)), 'tahun' => $tahun];
    }

    private function rujukan(RppPenugasan $p): array
    {
        return [
            'id' => $p->id,
            'rpp_id' => $p->rpp_id,
            'nomor_rpp' => $p->rpp?->nomor_rpp,
            'tahun' => $p->rpp?->year,
            'nomor_st' => $p->nomor_st,
            'uraian' => $p->uraian,
            'status' => $p->status,
        ];
    }

    private function stGanda(Collection $penugasan): array
    {
        return $penugasan->filter(fn ($p) => filled($p->nomor_st))
            ->groupBy(fn ($p) => ($p->rpp?->year ?? '').'|'.mb_strtolower(trim($p->nomor_st)))
            ->filter(fn ($g) => $g->count() > 1)
            ->map(fn ($g) => ['nomor_st' => $g->first()->nomor_st, 'tahun' => $g->first()->rpp?->year, 'penugasan' => $g->map(fn ($p) => $this->rujukan($p))->values()->all()])
            ->values()->all();
    }

    private function tanpaUraian(Collection $penugasan): array
    {
        return $penugasan->filter(fn ($p) => trim((string) $p->uraian) === '' || trim((string) $p->uraian) === '-')
            ->map(fn ($p) => $this->rujukan($p))->values()->all();
    }

    private function stTanpaTanggal(Collection $penugasan): array
    {
        return $penugasan->filter(fn ($p) => filled($p->nomor_st) && ! $p->tanggal_st && $p->status !== 'batal')
            ->map(fn ($p) => $this->rujukan($p))->values()->all();
    }

    private function masaTanpaSt(Collection $penugasan): array
    {
        return $penugasan->filter(fn ($p) => $p->masa_tugas_mulai && blank($p->nomor_st) && ! in_array($p->status, ['draft', 'batal'], true))
            ->map(fn ($p) => $this->rujukan($p))->values()->all();
    }

    private function statusTidakSelaras(Collection $penugasan): array
    {
        return $penugasan->filter(function ($p) {
            $adaLaporan = $p->laporans->filter(fn ($l) => filled($l->nomor_laporan))->isNotEmpty();

            return ($adaLaporan && ! in_array($p->status, ['lhp_terbit', 'selesai'], true)) || (! $adaLaporan && $p->status === 'lhp_terbit');
        })->map(fn ($p) => [...$this->rujukan($p), 'jumlah_laporan' => $p->laporans->count()])->values()->all();
    }

    /**
     * Tumpang tindih yang MUSTAHIL dijalani, bukan sekadar beririsan: dua
     * penugasan orang yang sama saling beririsan DAN jumlah hari lapangannya
     * melebihi hari kalender gabungan kedua masa tugas. Irisan biasa wajar
     * (seseorang memang memegang beberapa penugasan sekaligus), jadi tidak
     * ditandai.
     */
    private function tumpangTindih(Collection $penugasan): array
    {
        $perOrang = [];
        foreach ($penugasan as $p) {
            if (! $p->masa_tugas_mulai || ! $p->masa_tugas_selesai || $p->status === 'batal') {
                continue;
            }
            foreach ($p->teamMembers as $m) {
                if ((int) $m->hari_lapangan <= 0 || ! $m->employee_id) {
                    continue;
                }
                $perOrang[$m->employee_id][] = ['nama' => $m->nama, 'lk' => (int) $m->hari_lapangan, 'p' => $p];
            }
        }
        $hasil = [];
        foreach ($perOrang as $employeeId => $daftar) {
            usort($daftar, fn ($a, $b) => $a['p']->masa_tugas_mulai <=> $b['p']->masa_tugas_mulai);
            for ($i = 0; $i < count($daftar); $i++) {
                for ($j = $i + 1; $j < count($daftar); $j++) {
                    $a = $daftar[$i]['p'];
                    $b = $daftar[$j]['p'];
                    if ($b->masa_tugas_mulai > $a->masa_tugas_selesai) {
                        break;
                    }
                    $mulai = min($a->masa_tugas_mulai, $b->masa_tugas_mulai);
                    $selesai = max($a->masa_tugas_selesai, $b->masa_tugas_selesai);
                    $hariKalender = $mulai->diffInDays($selesai) + 1;
                    $lk = $daftar[$i]['lk'] + $daftar[$j]['lk'];
                    if ($lk <= $hariKalender) {
                        continue;
                    }
                    $hasil[] = [
                        'employee_id' => $employeeId,
                        'nama' => $daftar[$i]['nama'],
                        'lk' => $lk,
                        'hari_kalender' => $hariKalender,
                        'a' => [...$this->rujukan($a), 'mulai' => $a->masa_tugas_mulai?->toDateString(), 'selesai' => $a->masa_tugas_selesai?->toDateString(), 'lk' => $daftar[$i]['lk']],
                        'b' => [...$this->rujukan($b), 'mulai' => $b->masa_tugas_mulai?->toDateString(), 'selesai' => $b->masa_tugas_selesai?->toDateString(), 'lk' => $daftar[$j]['lk']],
                    ];
                }
            }
        }

        return $hasil;
    }

    private function pegawaiTanpaNip(): array
    {
        $dipakai = RppTeamMember::query()->whereNotNull('employee_id')->distinct()->pluck('employee_id');

        return Employee::query()->whereIn('id', $dipakai)->where('aktif', true)->where(fn ($q) => $q->whereNull('nip')->orWhere('nip', ''))
            ->orderBy('nama')->get(['id', 'nama', 'jabatan'])->map(fn ($e) => $e->only(['id', 'nama', 'jabatan']))->all();
    }

    private function belumSinkronAneva(Collection $penugasan): array
    {
        $perTahun = $penugasan->groupBy(fn ($p) => $p->rpp?->year);
        $hasil = [];
        foreach ($perTahun as $tahun => $daftar) {
            $sinkron = $daftar->filter(fn ($p) => $p->sinkron_aneva_pada !== null)->count();
            if ($sinkron === 0 || $sinkron === $daftar->count()) {
                continue; // tahun yang memang belum pernah disinkron, atau sudah lengkap
            }
            foreach ($daftar->filter(fn ($p) => $p->sinkron_aneva_pada === null && $p->status !== 'batal') as $p) {
                $hasil[] = $this->rujukan($p);
            }
        }

        return $hasil;
    }

    /** Daftar tahun yang ada RPP-nya, terbaru dulu. */
    public function tahunTersedia(): array
    {
        return Rpp::query()->select('year')->distinct()->orderByDesc('year')->pluck('year')->all();
    }
}
