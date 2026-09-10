<?php

namespace App\Http\Controllers\Pkpt;

use App\Http\Controllers\Concerns\MenjagaPeriodePkpt;
use App\Http\Controllers\Controller;
use App\Models\DataUmum;
use App\Models\Opd;
use App\Models\PengaturanPemda;
use App\Models\Pkpt\PkptAreaPengawasan;
use App\Models\Pkpt\PkptEvaluasiRisiko;
use App\Models\Pkpt\PkptFaktorRisiko;
use App\Models\Pkpt\PkptKematanganMr;
use App\Models\Pkpt\PkptPenilaian;
use App\Models\Pkpt\PkptPenugasanWajib;
use App\Models\Pkpt\PkptPeriode;
use App\Models\Pkpt\PkptRencana;
use App\Services\PdfPrintService;
use App\Services\Pkpt\PkptPerhitunganService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Form Cetak PKPT — Formulir 1 sampai dengan 14 Lampiran Keputusan Inspektur.
 *
 * SATU controller, SATU komponen React, EMPAT BELAS bentuk tabel. Susunan
 * kolomnya didefinisikan di sini sebagai data, bukan disebar ke empat belas
 * berkas React yang isinya nyaris sama. Alasannya bukan sekadar hemat: yang
 * menetapkan kolom adalah Lampiran Keputusan, jadi menaruhnya di satu tempat
 * membuat naskah dan aplikasi bisa dibandingkan baris demi baris.
 *
 * PDF-nya memakai preset Browsershot yang sudah berlaku di aplikasi ini —
 * memotret halaman React yang sama persis, bukan merender ulang lewat Blade.
 * Jangan membuat berkas pdf-*.blade.php baru untuk fitur ini.
 */
class CetakPkptController extends Controller
{
    use MenjagaPeriodePkpt;

    public function __construct(private readonly PkptPerhitunganService $hitung) {}

    /** Judul tiap formulir, sesuai Daftar Formulir Lampiran Keputusan. */
    public const JUDUL = [
        'f1' => 'Peta Auditan',
        'f2' => 'Kertas Kerja Hasil Evaluasi Register Risiko',
        'f3' => 'Tingkat Kematangan Manajemen Risiko dan Pembobotan Register Risiko',
        'f4' => 'Kertas Kerja Faktor Risiko Anggaran',
        'f5' => 'Kertas Kerja Faktor Risiko Keterkaitan dengan RPJMD, RPJMN, dan Sektor Unggulan Daerah',
        'f6' => 'Kertas Kerja Faktor Risiko Temuan dan Tindak Lanjut, Potensi Kecurangan, dan Kasus Hukum',
        'f7' => 'Kertas Kerja Faktor Risiko Isu Terkini',
        'f8' => 'Kertas Kerja Faktor Risiko Pertimbangan Lain',
        'f9' => 'Kertas Kerja Perhitungan Total Nilai Risiko Area Pengawasan',
        'f10' => 'Kertas Kerja Pemeringkatan Prioritas Area Pengawasan 1 sampai dengan 5 Tahun',
        'f11' => 'Daftar Area Pengawasan yang Wajib Dimuat dalam PKPT',
        'f12' => 'Daftar Area Pengawasan yang Tidak Dimuat dalam PKPT',
        'f13' => 'Usulan Kebijakan Pengawasan',
        'f14' => 'Format Program Kerja Pengawasan Tahunan',
    ];

    public function cetak(Request $request, string $formulir)
    {
        abort_unless(isset(self::JUDUL[$formulir]), 404, 'Formulir tidak dikenal.');

        $periode = $this->periodeWajib($request);
        [$kolom, $baris] = $this->susun($formulir, $periode);

        return Inertia::render('pkpt/cetak/Formulir', [
            ...$this->konteksPkpt($request, $periode),
            'formulir' => $formulir,
            'judul' => self::JUDUL[$formulir],
            'kolom' => $kolom,
            'baris' => $baris,
            'kop' => $this->kop($periode),
        ]);
    }

    public function pdf(Request $request, string $formulir)
    {
        abort_unless(isset(self::JUDUL[$formulir]), 404, 'Formulir tidak dikenal.');

        $periode = $this->periodeWajib($request);

        return PdfPrintService::downloadFromUrl(
            $request,
            url('/pkpt/cetak/'.$formulir.'?periode='.$periode->id),
            strtoupper($formulir).'_'.str($this->judulBerkas($formulir))->slug('_').'_'.$periode->tahun_pkpt
        );
    }

    private function judulBerkas(string $formulir): string
    {
        return mb_substr(self::JUDUL[$formulir], 0, 60);
    }

    /** Kepala kertas kerja: identitas Pemda dan periode PKPT. */
    private function kop(PkptPeriode $periode): array
    {
        $pengaturan = PengaturanPemda::current();
        $inspektorat = Opd::where('nama', 'like', '%NSPEKTORAT%')->first();
        $dataUmum = $inspektorat
            ? DataUmum::whereHas('user', fn ($q) => $q->where('opd_id', $inspektorat->id))->first()
            : null;

        return [
            'pemerintah' => $dataUmum->pemerintah_kabkota ?? $pengaturan->pemerintah_kabkota ?? 'PEMERINTAH KABUPATEN ACEH BARAT',
            'satuan_kerja' => $dataUmum->nama_dinas_opd ?? 'INSPEKTORAT KABUPATEN ACEH BARAT',
            'tahun_pkpt' => $periode->tahun_pkpt,
            'tahun_dasar_risiko' => $periode->tahun_dasar_risiko,
            'status' => $periode->status,
            'nomor_keputusan' => $periode->nomor_keputusan,
            'penyusun' => $dataUmum->nama_pic ?? null,
            'penyusun_jabatan' => $dataUmum->jabatan_pic ?? null,
            'penelaah' => $dataUmum->nama_kepala_dinas ?? null,
            'penelaah_jabatan' => $dataUmum->jabatan_kepala_dinas ?? null,
            'tempat' => $dataUmum->tempat_pembuatan ?? 'MEULABOH',
        ];
    }

    /**
     * Susunan kolom dan isinya per formulir.
     *
     * @return array{0: array<int, array{judul: string, lebar: int, tengah?: bool}>, 1: array<int, array<int, mixed>>}
     */
    private function susun(string $formulir, PkptPeriode $periode): array
    {
        return match ($formulir) {
            'f1' => $this->f1($periode),
            'f2' => $this->f2($periode),
            'f3' => $this->f3($periode),
            'f4' => $this->f4($periode),
            'f5' => $this->f5($periode),
            'f6' => $this->f6($periode),
            'f7' => $this->f7($periode),
            'f8' => $this->f8($periode),
            'f9' => $this->f9($periode),
            'f10' => $this->f10($periode),
            'f11' => $this->fPenugasan($periode, 'wajib'),
            'f12' => $this->fPenugasan($periode, 'tidak_dimuat'),
            'f13' => $this->f13($periode),
            'f14' => $this->f14($periode),
        };
    }

    private function area(PkptPeriode $periode)
    {
        return PkptAreaPengawasan::where('periode_id', $periode->id)
            ->with(['opd:id,nama', 'faktorRisiko'])
            ->orderBy('kelompok')->orderBy('nama')->get();
    }

    private function f1(PkptPeriode $periode): array
    {
        $kolom = [
            ['judul' => 'No.', 'lebar' => 4, 'tengah' => true],
            ['judul' => 'Kelompok Area Pengawasan', 'lebar' => 10],
            ['judul' => 'Nama Area Pengawasan', 'lebar' => 16],
            ['judul' => 'Tujuan/Sasaran', 'lebar' => 16],
            ['judul' => 'SKPK Pengampu Utama', 'lebar' => 12],
            ['judul' => 'SKPK Pendukung', 'lebar' => 10],
            ['judul' => 'Urusan Pemerintahan', 'lebar' => 8],
            ['judul' => 'Pagu Anggaran (Rp)', 'lebar' => 8, 'tengah' => true],
            ['judul' => 'Level Kematangan MR', 'lebar' => 5, 'tengah' => true],
            ['judul' => 'Tahun Terakhir Diawasi', 'lebar' => 5, 'tengah' => true],
            ['judul' => 'Jenis Penugasan Terakhir', 'lebar' => 8],
            ['judul' => 'Keterangan', 'lebar' => 8],
        ];

        $kematangan = PkptKematanganMr::where('periode_id', $periode->id)->get()->keyBy('opd_id');

        $baris = $this->area($periode)->values()->map(fn ($a, $i) => [
            $i + 1,
            $this->namaKelompok($a->kelompok),
            $a->nama,
            $a->tujuan_sasaran,
            $a->opd?->nama,
            $a->opd_pendukung,
            $a->urusan,
            $this->rupiah($a->pagu_anggaran),
            $a->opd_id ? ($kematangan->get($a->opd_id)?->level_mr ?? '-') : '-',
            $a->tahun_terakhir_diawasi ?? '-',
            $a->jenis_penugasan_terakhir,
            $a->keterangan,
        ])->all();

        return [$kolom, $baris];
    }

    private function f2(PkptPeriode $periode): array
    {
        $kolom = [
            ['judul' => 'No.', 'lebar' => 3, 'tengah' => true],
            ['judul' => 'Kode Risiko', 'lebar' => 7],
            ['judul' => 'Perangkat Daerah', 'lebar' => 12],
            ['judul' => 'Uraian Risiko menurut Register', 'lebar' => 18],
            ['judul' => 'Pemilik Risiko', 'lebar' => 10],
            ['judul' => 'Skala Dampak Register', 'lebar' => 5, 'tengah' => true],
            ['judul' => 'Skala Kemungkinan Register', 'lebar' => 5, 'tengah' => true],
            ['judul' => 'Nilai Risiko Register', 'lebar' => 5, 'tengah' => true],
            ['judul' => 'Simpulan Evaluasi', 'lebar' => 8],
            ['judul' => 'Skala Dampak Hasil Evaluasi', 'lebar' => 5, 'tengah' => true],
            ['judul' => 'Skala Kemungkinan Hasil Evaluasi', 'lebar' => 5, 'tengah' => true],
            ['judul' => 'Nilai Risiko Hasil Evaluasi', 'lebar' => 5, 'tengah' => true],
            ['judul' => 'Catatan dan Rekomendasi Perbaikan Register', 'lebar' => 16],
        ];

        $baris = [];
        $no = 0;

        foreach (PkptPerhitunganService::MODEL_RISIKO as $tipe => $model) {
            $kolomFk = PkptEvaluasiRisiko::KOLOM[$tipe];
            $evaluasi = PkptEvaluasiRisiko::where('periode_id', $periode->id)
                ->whereNotNull($kolomFk)->get()->keyBy($kolomFk);

            foreach ($model::with('user.opd')->where('TAHUN DINILAI RISIKO', $periode->tahun_dasar_risiko)->get() as $r) {
                $ev = $evaluasi->get($r->id);
                $baris[] = [
                    ++$no,
                    trim(($r->{'TINGKAT RISIKO'} ?? '').'.'.($r->{'NOMOR URUT RISIKO'} ?? ''), '.'),
                    $r->user?->opd?->nama ?? $r->{'ENTITAS PD YANG MENILAI'},
                    $r->{'URAIAN RISIKO'},
                    $r->{'PEMILIK RISIKO'},
                    $r->{'SKALA DAMPAK INHEREN'},
                    $r->{'SKALA KEMUNGKINAN INHEREN'},
                    $r->{'SKALA RISIKO INHEREN'},
                    $ev ? ($ev->simpulan === 'andal' ? 'Andal' : 'Perlu perbaikan') : 'Belum dievaluasi',
                    $ev?->skala_dampak_evaluasi ?? '-',
                    $ev?->skala_kemungkinan_evaluasi ?? '-',
                    $ev?->nilai_risiko_evaluasi ?? '-',
                    $ev?->catatan,
                ];
            }
        }

        return [$kolom, $baris];
    }

    private function f3(PkptPeriode $periode): array
    {
        $kolom = [
            ['judul' => 'No.', 'lebar' => 4, 'tengah' => true],
            ['judul' => 'Nama Satuan Kerja', 'lebar' => 24],
            ['judul' => 'Level Kematangan MR', 'lebar' => 7, 'tengah' => true],
            ['judul' => 'Dasar Penetapan', 'lebar' => 20],
            ['judul' => 'Strategi Pengawasan', 'lebar' => 26],
            ['judul' => 'Bobot Register Risiko', 'lebar' => 7, 'tengah' => true],
            ['judul' => 'Bobot Faktor Pertimbangan Manajemen', 'lebar' => 8, 'tengah' => true],
            ['judul' => 'Keterangan', 'lebar' => 14],
        ];

        $tersimpan = PkptKematanganMr::where('periode_id', $periode->id)->get()->keyBy('opd_id');

        $baris = Opd::orderBy('nama')->get()->values()->map(function ($opd, $i) use ($tersimpan) {
            $k = $tersimpan->get($opd->id);

            return [
                $i + 1,
                $opd->nama,
                $k?->level_mr ?? 'belum ditetapkan',
                $this->namaSumber($k?->sumber_penetapan),
                $k?->strategi_pengawasan,
                $k?->bobot_register !== null ? $k->bobot_register.'%' : '-',
                $k?->bobot_faktor !== null ? $k->bobot_faktor.'%' : '-',
                $k?->keterangan,
            ];
        })->all();

        return [$kolom, $baris];
    }

    private function f4(PkptPeriode $periode): array
    {
        $kolom = [
            ['judul' => 'No.', 'lebar' => 5, 'tengah' => true],
            ['judul' => 'Nama Area Pengawasan', 'lebar' => 35],
            ['judul' => 'SKPK Pengampu', 'lebar' => 22],
            ['judul' => 'Pagu Anggaran (Rp)', 'lebar' => 14, 'tengah' => true],
            ['judul' => 'Persentase terhadap Belanja Langsung', 'lebar' => 14, 'tengah' => true],
            ['judul' => 'Skala', 'lebar' => 10, 'tengah' => true],
        ];

        $baris = $this->area($periode)->values()->map(fn ($a, $i) => [
            $i + 1,
            $a->nama,
            $a->opd?->nama ?? $a->opd_pendukung,
            $this->rupiah($a->faktorRisiko?->pagu_anggaran ?? $a->pagu_anggaran),
            $a->faktorRisiko?->persen_belanja_langsung !== null
                ? number_format($a->faktorRisiko->persen_belanja_langsung, 3, ',', '.').'%'
                : 'belum tersedia',
            $a->faktorRisiko?->skala_fr1 ?? 'belum dapat dihitung',
        ])->all();

        return [$kolom, $baris];
    }

    private function f5(PkptPeriode $periode): array
    {
        $kolom = [
            ['judul' => 'No.', 'lebar' => 4, 'tengah' => true],
            ['judul' => 'Nama Area Pengawasan', 'lebar' => 30],
            ['judul' => 'SKPK Pengampu', 'lebar' => 18],
            ['judul' => 'Terkait Langsung Tujuan/Sasaran RPJMD', 'lebar' => 12, 'tengah' => true],
            ['judul' => 'Mendukung RPJMN', 'lebar' => 10, 'tengah' => true],
            ['judul' => 'Termasuk Sektor Unggulan Daerah', 'lebar' => 11, 'tengah' => true],
            ['judul' => 'Nilai', 'lebar' => 7, 'tengah' => true],
            ['judul' => 'Skala', 'lebar' => 8, 'tengah' => true],
        ];

        $baris = $this->area($periode)->values()->map(fn ($a, $i) => [
            $i + 1,
            $a->nama,
            $a->opd?->nama ?? $a->opd_pendukung,
            $this->biner($a->faktorRisiko?->terkait_rpjmd),
            $this->biner($a->faktorRisiko?->mendukung_rpjmn),
            $this->biner($a->faktorRisiko?->sektor_unggulan),
            $a->faktorRisiko?->nilai_fr2 ?? '-',
            $a->faktorRisiko?->skala_fr2 ?? '-',
        ])->all();

        return [$kolom, $baris];
    }

    private function f6(PkptPeriode $periode): array
    {
        $kolom = [
            ['judul' => 'No.', 'lebar' => 4, 'tengah' => true],
            ['judul' => 'Nama Area Pengawasan', 'lebar' => 26],
            ['judul' => 'SKPK Pengampu', 'lebar' => 16],
            ['judul' => 'Penyelesaian Temuan Auditor Internal 95% atau Kurang', 'lebar' => 13, 'tengah' => true],
            ['judul' => 'Penyelesaian Temuan Auditor Eksternal 90% atau Kurang', 'lebar' => 13, 'tengah' => true],
            ['judul' => 'Potensi Kecurangan', 'lebar' => 9, 'tengah' => true],
            ['judul' => 'Kasus Hukum', 'lebar' => 8, 'tengah' => true],
            ['judul' => 'Nilai', 'lebar' => 6, 'tengah' => true],
            ['judul' => 'Skala', 'lebar' => 5, 'tengah' => true],
        ];

        $baris = $this->area($periode)->values()->map(fn ($a, $i) => [
            $i + 1,
            $a->nama,
            $a->opd?->nama ?? $a->opd_pendukung,
            $this->biner($a->faktorRisiko?->temuan_internal_kurang),
            $this->biner($a->faktorRisiko?->temuan_eksternal_kurang),
            $this->biner($a->faktorRisiko?->potensi_fraud),
            $this->biner($a->faktorRisiko?->kasus_hukum),
            $a->faktorRisiko?->nilai_fr3 ?? '-',
            $a->faktorRisiko?->skala_fr3 ?? '-',
        ])->all();

        return [$kolom, $baris];
    }

    private function f7(PkptPeriode $periode): array
    {
        $kolom = [
            ['judul' => 'No.', 'lebar' => 4, 'tengah' => true],
            ['judul' => 'Nama Area Pengawasan', 'lebar' => 24],
            ['judul' => 'SKPK Pengampu', 'lebar' => 14],
            ['judul' => 'Sorotan Masyarakat', 'lebar' => 9, 'tengah' => true],
            ['judul' => 'Isu Nasional', 'lebar' => 8, 'tengah' => true],
            ['judul' => 'Terkait Layanan Publik', 'lebar' => 9, 'tengah' => true],
            ['judul' => 'Berpengaruh pada Hajat Hidup Orang Banyak', 'lebar' => 10, 'tengah' => true],
            ['judul' => 'Nilai', 'lebar' => 5, 'tengah' => true],
            ['judul' => 'Skala', 'lebar' => 5, 'tengah' => true],
            ['judul' => 'Sumber Informasi', 'lebar' => 12],
        ];

        $baris = $this->area($periode)->values()->map(fn ($a, $i) => [
            $i + 1,
            $a->nama,
            $a->opd?->nama ?? $a->opd_pendukung,
            $this->biner($a->faktorRisiko?->sorotan_masyarakat),
            $this->biner($a->faktorRisiko?->isu_nasional),
            $this->biner($a->faktorRisiko?->layanan_publik),
            $this->biner($a->faktorRisiko?->hajat_hidup),
            $a->faktorRisiko?->nilai_fr4 ?? '-',
            $a->faktorRisiko?->skala_fr4 ?? '-',
            $a->faktorRisiko?->sumber_isu,
        ])->all();

        return [$kolom, $baris];
    }

    private function f8(PkptPeriode $periode): array
    {
        $kolom = [
            ['judul' => 'No.', 'lebar' => 4, 'tengah' => true],
            ['judul' => 'Nama Area Pengawasan', 'lebar' => 28],
            ['judul' => 'SKPK Pengampu', 'lebar' => 18],
            ['judul' => 'Tahun Terakhir Diawasi', 'lebar' => 10, 'tengah' => true],
            ['judul' => 'Skala Tahun Terakhir Diawasi (bobot 10%)', 'lebar' => 12, 'tengah' => true],
            ['judul' => 'Jumlah Penugasan Sejenis oleh SDM Inspektorat', 'lebar' => 12, 'tengah' => true],
            ['judul' => 'Skala Pengalaman SDM (bobot 5%)', 'lebar' => 10, 'tengah' => true],
            ['judul' => 'Skala Gabungan FR 5', 'lebar' => 8, 'tengah' => true],
        ];

        $baris = $this->area($periode)->values()->map(fn ($a, $i) => [
            $i + 1,
            $a->nama,
            $a->opd?->nama ?? $a->opd_pendukung,
            $a->faktorRisiko?->tahun_terakhir_diawasi ?? '-',
            $a->faktorRisiko?->skala_tahun_terakhir ?? '-',
            $a->faktorRisiko?->jumlah_penugasan_sejenis ?? '-',
            $a->faktorRisiko?->skala_pengalaman ?? '-',
            $this->desimal($a->faktorRisiko?->skala_fr5),
        ])->all();

        return [$kolom, $baris];
    }

    private function f9(PkptPeriode $periode): array
    {
        $kolom = [
            ['judul' => 'No.', 'lebar' => 3, 'tengah' => true],
            ['judul' => 'Nama Area Pengawasan', 'lebar' => 22],
            ['judul' => 'Level Kematangan MR', 'lebar' => 5, 'tengah' => true],
            ['judul' => 'Rata-rata Level Dampak', 'lebar' => 6, 'tengah' => true],
            ['judul' => 'Rata-rata Level Kemungkinan', 'lebar' => 6, 'tengah' => true],
            ['judul' => 'Nilai Risiko Komposit', 'lebar' => 6, 'tengah' => true],
            ['judul' => 'Skala Risiko Inheren', 'lebar' => 5, 'tengah' => true],
            ['judul' => 'Bobot Register Risiko', 'lebar' => 5, 'tengah' => true],
            ['judul' => 'Skala FR 1', 'lebar' => 4, 'tengah' => true],
            ['judul' => 'Skala FR 2', 'lebar' => 4, 'tengah' => true],
            ['judul' => 'Skala FR 3', 'lebar' => 4, 'tengah' => true],
            ['judul' => 'Skala FR 4', 'lebar' => 4, 'tengah' => true],
            ['judul' => 'Skala FR 5', 'lebar' => 4, 'tengah' => true],
            ['judul' => 'Skala Gabungan FPM', 'lebar' => 6, 'tengah' => true],
            ['judul' => 'Bobot FPM', 'lebar' => 5, 'tengah' => true],
            ['judul' => 'Total Nilai Risiko', 'lebar' => 6, 'tengah' => true],
            ['judul' => 'Tingkat Risiko', 'lebar' => 7, 'tengah' => true],
            ['judul' => 'Keterangan', 'lebar' => 14],
        ];

        $faktor = PkptFaktorRisiko::where('periode_id', $periode->id)->get()->keyBy('area_id');

        $baris = $this->penilaianTerurut($periode)->values()->map(function ($p, $i) use ($faktor) {
            $f = $faktor->get($p->area_id);

            return [
                $i + 1,
                $p->area?->nama,
                $p->level_mr ?? '-',
                $this->desimal($p->rld),
                $this->desimal($p->rlk),
                $this->desimal($p->nilai_komposit),
                $p->skala_inheren ?? '-',
                $p->bobot_register !== null ? $p->bobot_register.'%' : '-',
                $f?->skala_fr1 ?? '-',
                $f?->skala_fr2 ?? '-',
                $f?->skala_fr3 ?? '-',
                $f?->skala_fr4 ?? '-',
                $this->desimal($f?->skala_fr5),
                $this->desimal($p->skala_fpm),
                $p->bobot_faktor !== null ? $p->bobot_faktor.'%' : '-',
                $this->desimal($p->total_nilai_risiko),
                $p->tingkat_risiko ?? '-',
                $p->keterangan,
            ];
        })->all();

        return [$kolom, $baris];
    }

    private function f10(PkptPeriode $periode): array
    {
        $tahun = range($periode->tahun_pkpt, $periode->tahun_pkpt + 4);

        $kolom = [
            ['judul' => 'No.', 'lebar' => 4, 'tengah' => true],
            ['judul' => 'Nama Area Pengawasan', 'lebar' => 28],
            ['judul' => 'Total Nilai Risiko', 'lebar' => 8, 'tengah' => true],
            ['judul' => 'Tingkat Risiko', 'lebar' => 9, 'tengah' => true],
            ['judul' => 'Zona', 'lebar' => 7, 'tengah' => true],
            ['judul' => 'Frekuensi Pengawasan', 'lebar' => 14],
        ];
        foreach ($tahun as $t) {
            $kolom[] = ['judul' => (string) $t, 'lebar' => 5, 'tengah' => true];
        }
        $kolom[] = ['judul' => 'Keterangan', 'lebar' => 14];

        $baris = $this->penilaianTerurut($periode)->values()->map(function ($p, $i) use ($tahun) {
            $rencana = $p->rencana_tahun ?? [];
            $row = [
                $i + 1,
                $p->area?->nama,
                $this->desimal($p->total_nilai_risiko),
                $p->tingkat_risiko ?? '-',
                $p->zona ?? '-',
                $p->frekuensi ?? '-',
            ];
            foreach ($tahun as $t) {
                $row[] = in_array($t, $rencana) ? 'X' : '';
            }
            $row[] = $p->keterangan;

            return $row;
        })->all();

        return [$kolom, $baris];
    }

    private function penilaianTerurut(PkptPeriode $periode)
    {
        return PkptPenilaian::where('periode_id', $periode->id)
            ->with('area:id,nama')
            ->orderByRaw('total_nilai_risiko IS NULL, total_nilai_risiko DESC')
            ->get();
    }

    private function fPenugasan(PkptPeriode $periode, string $jenis): array
    {
        $kolom = [
            ['judul' => 'No.', 'lebar' => 6, 'tengah' => true],
            ['judul' => 'Nama Area Pengawasan', 'lebar' => 32],
            ['judul' => $jenis === 'wajib' ? 'Alasan Wajib' : 'Alasan Tidak Dimuat', 'lebar' => 26],
            ['judul' => $jenis === 'wajib' ? 'Dasar Hukum atau Nomor Surat' : 'Keterangan', 'lebar' => 36],
        ];

        $baris = PkptPenugasanWajib::where('periode_id', $periode->id)
            ->where('jenis', $jenis)->orderBy('nama_area')->get()
            ->values()->map(fn ($b, $i) => [
                $i + 1,
                $b->nama_area,
                $b->alasan,
                $jenis === 'wajib' ? $b->dasar_hukum : $b->keterangan,
            ])->all();

        return [$kolom, $baris];
    }

    private function f13(PkptPeriode $periode): array
    {
        $kolom = [
            ['judul' => 'No.', 'lebar' => 5, 'tengah' => true],
            ['judul' => 'Nama Area Pengawasan Prioritas', 'lebar' => 34],
            ['judul' => 'Total Nilai Risiko', 'lebar' => 11, 'tengah' => true],
            ['judul' => 'Jenis Pengawasan', 'lebar' => 24],
            ['judul' => 'Kebutuhan SDM (HP)', 'lebar' => 12, 'tengah' => true],
        ];

        $baris = $this->rencana($periode)->values()->map(fn ($r, $i) => [
            $i + 1,
            $r->nama_area,
            $this->desimal($r->total_nilai_risiko),
            $r->jenis_pengawasan,
            $r->hp_jumlah ? $r->hp_jumlah.' HP' : '-',
        ])->all();

        return [$kolom, $baris];
    }

    private function f14(PkptPeriode $periode): array
    {
        $kolom = [
            ['judul' => 'No.', 'lebar' => 3, 'tengah' => true],
            ['judul' => 'Area Pengawasan', 'lebar' => 16],
            ['judul' => 'Jenis Pengawasan', 'lebar' => 10],
            ['judul' => 'Tujuan/Sasaran', 'lebar' => 16],
            ['judul' => 'Ruang Lingkup', 'lebar' => 10],
            ['judul' => 'Rencana Mulai Penugasan', 'lebar' => 7, 'tengah' => true],
            ['judul' => 'Rencana Penerbitan Laporan', 'lebar' => 7, 'tengah' => true],
            ['judul' => 'PJ', 'lebar' => 3, 'tengah' => true],
            ['judul' => 'WPJ', 'lebar' => 3, 'tengah' => true],
            ['judul' => 'KT', 'lebar' => 3, 'tengah' => true],
            ['judul' => 'AT', 'lebar' => 3, 'tengah' => true],
            ['judul' => 'Jumlah HP', 'lebar' => 4, 'tengah' => true],
            ['judul' => 'Anggaran (Rp)', 'lebar' => 8, 'tengah' => true],
            ['judul' => 'Jumlah Laporan', 'lebar' => 5, 'tengah' => true],
            ['judul' => 'Sarana dan Prasarana', 'lebar' => 8],
            ['judul' => 'Tingkat Risiko', 'lebar' => 6, 'tengah' => true],
            ['judul' => 'Keterangan', 'lebar' => 8],
        ];

        $baris = $this->rencana($periode)->values()->map(fn ($r, $i) => [
            $i + 1,
            $r->nama_area,
            $r->jenis_pengawasan,
            $r->tujuan_sasaran,
            $r->ruang_lingkup,
            $r->rmp,
            $r->rpl,
            $r->hp_pj ?? '-',
            $r->hp_wpj ?? '-',
            $r->hp_kt ?? '-',
            $r->hp_at ?? '-',
            $r->hp_jumlah ?? '-',
            $this->rupiah($r->anggaran),
            $r->jumlah_laporan,
            $r->sarana_prasarana,
            $r->tingkat_risiko,
            $r->keterangan,
        ])->all();

        return [$kolom, $baris];
    }

    private function rencana(PkptPeriode $periode)
    {
        return PkptRencana::where('periode_id', $periode->id)
            ->orderBy('urutan')->orderByDesc('total_nilai_risiko')->get();
    }

    // ------------------------------------------------------------------
    // Penyeragaman tampilan nilai
    // ------------------------------------------------------------------

    private function namaKelompok(?string $kelompok): string
    {
        return match ($kelompok) {
            'program_prioritas' => 'Program Prioritas',
            'skpk' => 'SKPK',
            'unit_lain' => 'Unit Kerja Lain',
            default => '-',
        };
    }

    private function namaSumber(?string $sumber): string
    {
        return match ($sumber) {
            'maturitas_spip_skpk' => 'Adopsi skor maturitas SPIP satuan kerja',
            'maturitas_spip_pemda' => 'Adopsi skor maturitas SPIP Pemerintah Kabupaten',
            'penilaian_inspektorat' => 'Penilaian tersendiri oleh Inspektorat',
            default => '-',
        };
    }

    /**
     * Nilai centang dicetak 1 atau 0 sesuai petunjuk pengisian Lampiran
     * Keputusan, bukan "Ya"/"Tidak" — supaya kolom Nilai yang menjumlahkannya
     * terbaca sebagai penjumlahan yang benar-benar terjadi di kertas kerja.
     */
    private function biner(?bool $nilai): string
    {
        return $nilai ? '1' : '0';
    }

    private function rupiah(?int $nilai): string
    {
        return $nilai === null ? 'belum tersedia' : number_format($nilai, 0, ',', '.');
    }

    private function desimal(int|float|null $nilai): string
    {
        return $nilai === null ? '-' : number_format((float) $nilai, 2, ',', '.');
    }
}
