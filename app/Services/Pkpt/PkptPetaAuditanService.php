<?php

namespace App\Services\Pkpt;

use App\Models\Opd;
use App\Models\Pkpt\PkptAreaPengawasan;
use App\Models\Pkpt\PkptPeriode;
use App\Models\ProgramPembangunanBupati;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Menarik Peta Auditan (Formulir 1) dari data yang sudah ada di MR Kabar.
 *
 * HANYA MEMBACA. Sumbernya tabel opd, tbl_krs_pemda, dan
 * program_pembangunan_bupati; tidak satu pun disentuh.
 *
 * Penarikan bersifat MENAMBAH, bukan menimpa. Baris yang sudah ada dikenali
 * dari sumbernya (opd_id, krs_pemda_id, program_bupati_id) dan dibiarkan apa
 * adanya — suntingan tangan seperti pembagian Irban, pagu anggaran, dan tahun
 * terakhir diawasi tidak boleh hilang hanya karena tombol Tarik ditekan dua
 * kali.
 */
class PkptPetaAuditanService
{
    public function __construct(private readonly PkptPerhitunganService $hitung) {}

    /**
     * Perangkat Daerah berkunci nama ternormalkan.
     *
     * Dipakai menautkan Area kelompok Program Prioritas ke SKPK pengampunya.
     * Tanpa tautan itu, Area program tidak punya baris kematangan sendiri
     * sehingga tidak pernah memperoleh bobot — terukur 98 Area menggantung
     * pada penarikan pertama.
     */
    private function petaOpd(): Collection
    {
        return Opd::all()->keyBy(fn ($o) => $this->hitung->kunciCocok($o->nama));
    }

    /** Id Perangkat Daerah yang namanya cocok, tidak peka kapitalisasi. */
    private function opdDariNama(Collection $peta, ?string $nama): ?int
    {
        $kunci = $this->hitung->kunciCocok($nama);

        return $kunci === '' ? null : $peta->get($kunci)?->id;
    }

    /**
     * @return array{skpk: int, program_prioritas: int, dilewati: int}
     */
    public function tarik(PkptPeriode $periode): array
    {
        $ada = PkptAreaPengawasan::withTrashed()
            ->where('periode_id', $periode->id)
            ->get();

        $ringkas = ['skpk' => 0, 'program_prioritas' => 0, 'dilewati' => 0];

        $ringkas['skpk'] = $this->tarikSkpk($periode, $ada, $ringkas);
        $ringkas['program_prioritas'] = $this->tarikProgramPrioritas($periode, $ada, $ringkas);

        return $ringkas;
    }

    /** Satu Area per Perangkat Daerah. */
    private function tarikSkpk(PkptPeriode $periode, $ada, array &$ringkas): int
    {
        // HANYA Area berkelompok skpk yang dihitung sudah ada. Area Program
        // Prioritas kini juga membawa opd_id (pengampunya), dan menyaring
        // tanpa memperhatikan kelompok akan membuat Perangkat Daerah yang
        // kebetulan menjadi pengampu sebuah program tidak pernah memperoleh
        // Area SKPK-nya sendiri.
        $sudah = $ada->where('kelompok', 'skpk')->whereNotNull('opd_id')->pluck('opd_id')->all();
        $baru = 0;

        foreach (Opd::orderBy('nama')->get() as $opd) {
            if (in_array($opd->id, $sudah, true)) {
                $ringkas['dilewati']++;

                continue;
            }

            PkptAreaPengawasan::create([
                'periode_id' => $periode->id,
                'kelompok' => 'skpk',
                'nama' => $opd->nama,
                'opd_id' => $opd->id,
            ]);
            $baru++;
        }

        return $baru;
    }

    /**
     * Satu Area per Program Prioritas RPJMD, dan per Program Pembangunan
     * Bupati yang belum terwakili.
     *
     * Keduanya sengaja ditarik: Program Prioritas berasal dari kaskade RPJMD
     * pada tbl_krs_pemda, sedangkan Program Pembangunan Bupati adalah 100
     * program penjabaran visi misi yang sudah punya pemetaan risiko sendiri
     * lewat pivot program_bupati_risiko. Yang namanya sama tidak digandakan.
     */
    private function tarikProgramPrioritas(PkptPeriode $periode, $ada, array &$ringkas): int
    {
        $peta = $this->petaOpd();
        $sudahKrs = $ada->whereNotNull('krs_pemda_id')->pluck('krs_pemda_id')->all();
        $sudahProgram = $ada->whereNotNull('program_bupati_id')->pluck('program_bupati_id')->all();
        $namaTerpakai = $ada->map(fn ($a) => $this->hitung->kunciCocok($a->nama))->filter()->all();
        $baru = 0;

        // Program Pembangunan Bupati lebih dahulu: ia punya pivot risiko
        // langsung, jadi penjodohannya pasti, sedangkan Program Prioritas
        // RPJMD dijodohkan lewat teks Sasaran.
        foreach (ProgramPembangunanBupati::orderBy('nomor')->get() as $p) {
            if (in_array($p->id, $sudahProgram, true)) {
                $ringkas['dilewati']++;

                continue;
            }

            $kunci = $this->hitung->kunciCocok($p->program_pembangunan);
            if ($kunci !== '' && in_array($kunci, $namaTerpakai, true)) {
                $ringkas['dilewati']++;

                continue;
            }

            PkptAreaPengawasan::create([
                'periode_id' => $periode->id,
                'kelompok' => 'program_prioritas',
                'nama' => $p->program_pembangunan,
                'opd_id' => $this->opdDariNama($peta, $p->perangkat_daerah),
                'opd_pendukung' => $p->perangkat_daerah,
                'program_bupati_id' => $p->id,
            ]);
            $namaTerpakai[] = $kunci;
            $baru++;
        }

        // Program Prioritas dari kaskade RPJMD. Satu baris per program;
        // tbl_krs_pemda memuat satu baris per indikator sehingga programnya
        // berulang, jadi diambil baris pertama tiap program.
        $krs = DB::table('tbl_krs_pemda')
            ->whereNull('deleted_at')
            ->whereNotNull('PROGRAM PRIORITAS')
            ->where('PROGRAM PRIORITAS', '<>', '')
            ->get(['id', 'PROGRAM PRIORITAS', 'SASARAN RPJMD', 'OPD PENANGGUNGJAWAB PROGRAM']);

        $terlihat = [];
        foreach ($krs as $baris) {
            $kunci = $this->hitung->kunciCocok($baris->{'PROGRAM PRIORITAS'});
            if ($kunci === '' || isset($terlihat[$kunci])) {
                continue;
            }
            $terlihat[$kunci] = true;

            if (in_array($baris->id, $sudahKrs, true) || in_array($kunci, $namaTerpakai, true)) {
                $ringkas['dilewati']++;

                continue;
            }

            PkptAreaPengawasan::create([
                'periode_id' => $periode->id,
                'kelompok' => 'program_prioritas',
                'nama' => trim($baris->{'PROGRAM PRIORITAS'}),
                'tujuan_sasaran' => trim((string) $baris->{'SASARAN RPJMD'}),
                'opd_id' => $this->opdDariNama($peta, $baris->{'OPD PENANGGUNGJAWAB PROGRAM'}),
                'opd_pendukung' => trim((string) $baris->{'OPD PENANGGUNGJAWAB PROGRAM'}),
                'krs_pemda_id' => $baris->id,
            ]);
            $namaTerpakai[] = $kunci;
            $baru++;
        }

        return $baru;
    }
}
