<?php

namespace App\Http\Controllers\Pkpt;

use App\Http\Controllers\Concerns\MenjagaPeriodePkpt;
use App\Http\Controllers\Controller;
use App\Models\Pkpt\PkptFaktor;
use App\Models\Pkpt\PkptPenilaian;
use App\Models\Pkpt\PkptPeriode;
use App\Models\Pkpt\PkptTingkatRisiko;
use App\Models\Pkpt\PkptZonaFrekuensi;
use App\Services\Pkpt\PkptKesiapanService;
use App\Services\Pkpt\PkptPerhitunganService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** Formulir 9 dan 10 — Total Nilai Risiko dan pemeringkatan. */
class PkptPenilaianController extends Controller
{
    use MenjagaPeriodePkpt;

    public function __construct(
        private readonly PkptPerhitunganService $hitung,
        private readonly PkptKesiapanService $kesiapan,
    ) {}

    /**
     * Menghitung ulang seluruh periode.
     *
     * Ditolak selama tingkat kematangan MR belum ditetapkan untuk satu SKPK
     * pun: tanpa level tidak ada bobot, dan tanpa bobot tidak ada satu Area
     * pun yang bisa dinilai. Menjalankannya toh hanya akan menghasilkan
     * ratusan baris kosong yang terlihat seperti hasil.
     */
    public function hitung(Request $request)
    {
        $periode = $this->periodeWajib($request);
        $this->pastikanIzin($request, 'pkpt-hitung');
        $this->pastikanPeriodeTerbuka($periode);

        $siap = $this->kesiapan->untukPeriode($periode)['boleh_hitung'];
        if (! $siap['boleh']) {
            return back()->withErrors(['hitung' => implode(' ', $siap['halangan'])]);
        }

        $r = $this->hitung->hitungPeriode($periode);

        $pesan = $r['dinilai'].' dari '.$r['area'].' Area Pengawasan berhasil dinilai.';
        if ($r['tanpa_risiko'] > 0) {
            $pesan .= ' '.$r['tanpa_risiko'].' Area tanpa Register Risiko terjodoh.';
        }
        if ($r['tanpa_faktor'] > 0) {
            $pesan .= ' '.$r['tanpa_faktor'].' Area belum punya satu pun Faktor Pertimbangan Manajemen terisi.';
        }

        return back()->with('success', $pesan);
    }

    public function totalNilai(Request $request)
    {
        $periode = $this->periodeWajib($request);

        return Inertia::render('pkpt/TotalNilaiRisiko', [
            ...$this->konteksPkpt($request, $periode),
            'penilaian' => $this->baris($periode),
            'faktor' => PkptFaktor::terurut()->values(),
            'kesiapan' => $this->kesiapan->untukPeriode($periode),
        ]);
    }

    public function peringkat(Request $request)
    {
        $periode = $this->periodeWajib($request);

        return Inertia::render('pkpt/Peringkat', [
            ...$this->konteksPkpt($request, $periode),
            'penilaian' => $this->baris($periode, true),
            'zona' => PkptZonaFrekuensi::terurut()->values(),
            'tingkat' => PkptTingkatRisiko::terurut()->values(),
            'tahunRencana' => $this->tahunRencana($periode),
        ]);
    }

    /** Lima kolom tahun pada Formulir 10: tahun PKPT sampai tahun PKPT + 4. */
    private function tahunRencana(PkptPeriode $periode): array
    {
        return range($periode->tahun_pkpt, $periode->tahun_pkpt + 4);
    }

    /**
     * @param  bool  $urutPeringkat  urut menurun menurut Total Nilai Risiko,
     *                               bukan menurut nama Area
     */
    private function baris(PkptPeriode $periode, bool $urutPeringkat = false): array
    {
        $q = PkptPenilaian::where('periode_id', $periode->id)->with('area:id,nama,kelompok,opd_id');

        // Area yang belum bisa dinilai tetap ikut, di urutan paling bawah.
        // Menyembunyikannya akan membuat daftar tampak lengkap padahal
        // separuh Peta Auditan belum terhitung.
        $q = $urutPeringkat
            ? $q->orderByRaw('total_nilai_risiko IS NULL, total_nilai_risiko DESC')
            : $q->orderByRaw('total_nilai_risiko IS NULL, total_nilai_risiko DESC');

        return $q->get()->values()->map(fn ($p, $i) => [
            ...$p->toArray(),
            'peringkat' => $p->total_nilai_risiko !== null ? $i + 1 : null,
            'nama_area' => $p->area?->nama ?? '(Area terhapus)',
            'kelompok' => $p->area?->kelompok,
        ])->all();
    }

    /** Centang rencana tahun pelaksanaan pada Formulir 10. */
    public function simpanRencanaTahun(Request $request, PkptPenilaian $penilaian)
    {
        $this->pastikanIzin($request, 'pkpt-rencana');
        $this->pastikanPeriodeTerbuka($penilaian->periode);

        $data = $request->validate([
            'rencana_tahun' => ['array'],
            'rencana_tahun.*' => ['integer', 'min:2000', 'max:2100'],
        ]);

        $penilaian->update(['rencana_tahun' => array_values($data['rencana_tahun'] ?? [])]);

        return back()->with('success', 'Rencana tahun pengawasan disimpan.');
    }
}
