<?php

namespace App\Http\Controllers\Pkpt;

use App\Http\Controllers\Concerns\MenjagaPeriodePkpt;
use App\Http\Controllers\Controller;
use App\Models\Pkpt\PkptEvaluasiRisiko;
use App\Models\Pkpt\PkptPeriode;
use App\Services\Pkpt\PkptPerhitunganService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Formulir 2 — evaluasi keandalan Register Risiko oleh Inspektorat.
 *
 * YANG TIDAK DILAKUKAN HALAMAN INI: menulis ke tbl_irs_pemda, tbl_irs_pd,
 * atau tbl_iro_pd. Sesuai BAB III Lampiran Keputusan Inspektur, pemutakhiran
 * Register Risiko tetap dilakukan SKPK selaku pemilik risiko; Inspektorat
 * mencatat penilaiannya di kertas kerja sendiri. Perbedaan skala yang
 * tersimpan di sini dipakai perhitungan, tanpa mengubah data milik SKPK.
 */
class PkptEvaluasiRisikoController extends Controller
{
    use MenjagaPeriodePkpt;

    public function __construct(private readonly PkptPerhitunganService $hitung) {}

    public function index(Request $request)
    {
        $periode = $this->periodeWajib($request);

        return Inertia::render('pkpt/EvaluasiRegister', [
            ...$this->konteksPkpt($request, $periode),
            'risiko' => $this->daftarRisiko($periode),
        ]);
    }

    /**
     * Seluruh risiko tahun dasar, disandingkan dengan evaluasinya.
     *
     * @return array<int, array<string, mixed>>
     */
    private function daftarRisiko(PkptPeriode $periode): array
    {
        $tahun = $periode->tahun_dasar_risiko;
        $hasil = [];

        foreach (PkptPerhitunganService::MODEL_RISIKO as $tipe => $model) {
            $kolom = PkptEvaluasiRisiko::KOLOM[$tipe];

            $evaluasi = PkptEvaluasiRisiko::where('periode_id', $periode->id)
                ->whereNotNull($kolom)->with('penilai:id,name')->get()->keyBy($kolom);

            $baris = $model::with('user:id,name,opd_id')
                ->where('TAHUN DINILAI RISIKO', $tahun)
                ->get();

            foreach ($baris as $r) {
                $ev = $evaluasi->get($r->id);

                $hasil[] = [
                    'tipe' => $tipe,
                    'id' => $r->id,
                    'kode_risiko' => $this->kodeRisiko($r),
                    'opd' => $r->user?->opd?->nama ?? $r->{'ENTITAS PD YANG MENILAI'} ?? '-',
                    'sasaran' => $r->{'SASARAN RPJMD'} ?? $r->{'SASARAN OPD'} ?? '',
                    'uraian_risiko' => $r->{'URAIAN RISIKO'},
                    'pemilik' => $r->{'PEMILIK RISIKO'},
                    'penyebab' => $r->{'URAIAN PENYEBAB RISIKO'},
                    'sumber_sebab' => $r->{'SUMBER SEBAB RISIKO'},
                    'c_uc' => $r->{'C / UC'},
                    'dampak' => $r->{'URAIAN DAMPAK RISIKO'},
                    'skala_dampak_register' => $this->angka($r->{'SKALA DAMPAK INHEREN'}),
                    'skala_kemungkinan_register' => $this->angka($r->{'SKALA KEMUNGKINAN INHEREN'}),
                    'nilai_risiko_register' => $this->angka($r->{'SKALA RISIKO INHEREN'}),
                    'evaluasi' => $ev ? [
                        'id' => $ev->id,
                        'skala_dampak_evaluasi' => $ev->skala_dampak_evaluasi,
                        'skala_kemungkinan_evaluasi' => $ev->skala_kemungkinan_evaluasi,
                        'nilai_risiko_evaluasi' => $ev->nilai_risiko_evaluasi,
                        'simpulan' => $ev->simpulan,
                        'catatan' => $ev->catatan,
                        'penilai' => $ev->penilai?->name,
                        'dinilai_pada' => $ev->updated_at,
                    ] : null,
                ];
            }
        }

        return $hasil;
    }

    /** Kode risiko tersusun dari kolom penyusunnya, seperti di modul risiko. */
    private function kodeRisiko($r): string
    {
        $bagian = array_filter([
            $r->{'TINGKAT RISIKO'} ?? null,
            $r->{'TAHUN DINILAI RISIKO'} ?? null,
            $r->{'NOMOR URUT RISIKO'} ?? null,
        ]);

        return $bagian === [] ? '-' : implode('.', $bagian);
    }

    private function angka(mixed $v): ?int
    {
        return ($v === null || $v === '') ? null : (int) $v;
    }

    public function update(Request $request, string $tipe, int $id)
    {
        $periode = $this->periodeWajib($request);
        $this->pastikanBolehMengisi($request, $periode);

        $kolom = PkptEvaluasiRisiko::KOLOM[$tipe] ?? null;
        abort_if($kolom === null, 404, 'Tipe risiko tidak dikenal.');

        $model = PkptPerhitunganService::MODEL_RISIKO[$tipe];
        abort_unless($model::where('id', $id)->exists(), 404, 'Risiko tidak ditemukan.');

        $data = $request->validate([
            'skala_dampak_evaluasi' => ['nullable', 'integer', 'min:1', 'max:5'],
            'skala_kemungkinan_evaluasi' => ['nullable', 'integer', 'min:1', 'max:5'],
            'simpulan' => ['required', 'in:andal,perlu_perbaikan'],
            'catatan' => ['nullable', 'string', 'max:2000'],
        ], [], [
            'skala_dampak_evaluasi' => 'Skala dampak hasil evaluasi',
            'skala_kemungkinan_evaluasi' => 'Skala kemungkinan hasil evaluasi',
        ]);

        // Simpulan "perlu perbaikan" tanpa alasan tidak ada gunanya bagi
        // pemilik risiko yang harus memperbaikinya.
        if ($data['simpulan'] === 'perlu_perbaikan' && blank($data['catatan'] ?? null)) {
            return back()->withErrors([
                'catatan' => 'Simpulan "perlu perbaikan" harus disertai catatan '
                    .'yang menjelaskan apa yang perlu diperbaiki.',
            ]);
        }

        $nilai = ($data['skala_dampak_evaluasi'] && $data['skala_kemungkinan_evaluasi'])
            ? $data['skala_dampak_evaluasi'] * $data['skala_kemungkinan_evaluasi']
            : null;

        PkptEvaluasiRisiko::updateOrCreate(
            ['periode_id' => $periode->id, $kolom => $id],
            [...$data, 'nilai_risiko_evaluasi' => $nilai, 'dinilai_oleh' => $request->user()->id]
        );

        return back()->with('success', 'Hasil evaluasi register risiko disimpan.');
    }

    /**
     * Menandai seluruh risiko yang belum dievaluasi sebagai andal.
     *
     * Dipakai ketika register memang disusun dengan pendampingan Inspektorat
     * dan jeda waktunya dekat — keadaan yang secara tegas disebut Perdep
     * sebagai alasan evaluasi cukup dilakukan sebagai penelaahan terbatas.
     * Yang sudah dinilai TIDAK ditimpa.
     */
    public function terimaSemua(Request $request)
    {
        $periode = $this->periodeWajib($request);
        $this->pastikanBolehMengisi($request, $periode);

        $catatan = $request->validate([
            'catatan' => ['required', 'string', 'min:10', 'max:1000'],
        ], [
            'catatan.required' => 'Tuliskan dasar penerimaan massal ini; ia akan tercatat pada setiap baris.',
        ])['catatan'];

        $tahun = $periode->tahun_dasar_risiko;
        $diisi = 0;

        foreach (PkptPerhitunganService::MODEL_RISIKO as $tipe => $model) {
            $kolom = PkptEvaluasiRisiko::KOLOM[$tipe];
            $sudah = PkptEvaluasiRisiko::where('periode_id', $periode->id)
                ->whereNotNull($kolom)->pluck($kolom);

            $model::where('TAHUN DINILAI RISIKO', $tahun)
                ->whereNotIn('id', $sudah)
                ->get()
                ->each(function ($r) use ($periode, $kolom, $catatan, $request, &$diisi) {
                    PkptEvaluasiRisiko::create([
                        'periode_id' => $periode->id,
                        $kolom => $r->id,
                        'skala_dampak_evaluasi' => $this->angka($r->{'SKALA DAMPAK INHEREN'}),
                        'skala_kemungkinan_evaluasi' => $this->angka($r->{'SKALA KEMUNGKINAN INHEREN'}),
                        'nilai_risiko_evaluasi' => $this->angka($r->{'SKALA RISIKO INHEREN'}),
                        'simpulan' => 'andal',
                        'catatan' => $catatan,
                        'dinilai_oleh' => $request->user()->id,
                    ]);
                    $diisi++;
                });
        }

        return back()->with('success', $diisi.' risiko ditandai andal tanpa perubahan skala.');
    }
}
