<?php

namespace App\Http\Controllers\Pkpt;

use App\Http\Controllers\Concerns\MenjagaPeriodePkpt;
use App\Http\Controllers\Controller;
use App\Models\Pkpt\PkptAreaPengawasan;
use App\Models\Pkpt\PkptFaktor;
use App\Models\Pkpt\PkptFaktorRisiko;
use App\Models\Pkpt\PkptSektorUnggulan;
use App\Services\Pkpt\PkptPerhitunganService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Formulir 4 sampai dengan 8 — lima Faktor Pertimbangan Manajemen.
 *
 * Satu halaman lima tab, bukan lima halaman: kelimanya mengisi baris yang
 * sama untuk Area Pengawasan yang sama, dan memecahnya berarti lima kali
 * memuat daftar Area yang identik.
 *
 * Skala tidak diketik pemakai. Yang diketik masukan mentahnya — persentase
 * anggaran, centang kondisi, tahun terakhir diawasi — lalu skalanya dihitung
 * PkptPerhitunganService menurut Tabel 9. Membiarkan skala diketik langsung
 * akan membuat kriteria yang sudah ditetapkan Keputusan bisa dilangkahi tanpa
 * jejak.
 */
class PkptFaktorRisikoController extends Controller
{
    use MenjagaPeriodePkpt;

    public function __construct(private readonly PkptPerhitunganService $hitung) {}

    public function index(Request $request)
    {
        $periode = $this->periodeWajib($request);

        $area = PkptAreaPengawasan::where('periode_id', $periode->id)
            ->with('faktorRisiko')
            ->orderBy('kelompok')->orderBy('nama')
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'nama' => $a->nama,
                'kelompok' => $a->kelompok,
                'pagu_anggaran' => $a->pagu_anggaran,
                'tahun_terakhir_diawasi' => $a->tahun_terakhir_diawasi,
                'faktor' => $a->faktorRisiko,
            ]);

        return Inertia::render('pkpt/FaktorRisiko', [
            ...$this->konteksPkpt($request, $periode),
            'area' => $area,
            'faktor' => PkptFaktor::terurut()->values(),
            'sektorUnggulan' => PkptSektorUnggulan::where('periode_id', $periode->id)
                ->orderBy('nama')->pluck('nama'),
            'totalBelanjaLangsung' => $periode->total_belanja_langsung,
        ]);
    }

    public function update(Request $request, PkptAreaPengawasan $area)
    {
        $periode = $area->periode;
        $this->pastikanBolehMengisi($request, $periode);

        $data = $request->validate([
            'pagu_anggaran' => ['nullable', 'integer', 'min:0'],

            'terkait_rpjmd' => ['boolean'],
            'mendukung_rpjmn' => ['boolean'],
            'sektor_unggulan' => ['boolean'],
            'indikator_kinerja_skpk' => ['nullable', 'integer', 'min:0'],
            'indikator_kinerja_pemda' => ['nullable', 'integer', 'min:0'],

            'temuan_internal_kurang' => ['boolean'],
            'temuan_eksternal_kurang' => ['boolean'],
            'potensi_fraud' => ['boolean'],
            'kasus_hukum' => ['boolean'],

            'sorotan_masyarakat' => ['boolean'],
            'isu_nasional' => ['boolean'],
            'layanan_publik' => ['boolean'],
            'hajat_hidup' => ['boolean'],
            'sumber_isu' => ['nullable', 'string', 'max:1000'],

            'tahun_terakhir_diawasi' => ['nullable', 'integer', 'min:2000', 'max:2100'],
            'jumlah_penugasan_sejenis' => ['nullable', 'integer', 'min:0', 'max:99'],

            'catatan_profesional' => ['nullable', 'string', 'max:2000'],
        ]);

        // Persentase anggaran dihitung, bukan diketik: pembaginya satu angka
        // milik periode, dan membiarkannya diketik membuka peluang persentase
        // yang tidak cocok dengan pagunya sendiri.
        $data['persen_belanja_langsung'] = ($data['pagu_anggaran'] ?? null) !== null
            && $periode->total_belanja_langsung
                ? round($data['pagu_anggaran'] / $periode->total_belanja_langsung * 100, 3)
                : null;

        $faktor = PkptFaktorRisiko::firstOrNew([
            'periode_id' => $periode->id,
            'area_id' => $area->id,
        ]);
        $faktor->fill($data);
        $faktor->fill($this->hitung->skalaFaktor($faktor, $area->kelompok, $periode->tahun_pkpt));

        // BAB V huruf A Lampiran Keputusan: faktor yang datanya tidak tersedia
        // boleh diberi skala berdasarkan pertimbangan profesional, TETAPI
        // alasannya wajib didokumentasikan pada kertas kerja.
        //
        // Satu-satunya keadaan itu di aplikasi ini adalah FR2 Area kelompok
        // SKPK yang rasio indikator kinerjanya belum ada, sehingga dinilai
        // dari kombinasi centang. Faktor lain tidak menuntut catatan karena
        // cara penilaiannya memang itu yang diminta Tabel 9, bukan pengganti.
        //
        // Ditegakkan di sini, bukan sekadar diingatkan di layar: kertas kerja
        // yang skalanya tidak bisa dipertanggungjawabkan adalah persoalan yang
        // baru ketahuan ketika Inspektur sudah menandatangani lampirannya.
        if ($faktor->skala_fr2 !== null
            && $this->hitung->fr2LewatCadangan($faktor, $area->kelompok)
            && blank($faktor->catatan_profesional)) {
            return back()->withErrors([
                'catatan_profesional' => 'Rasio indikator kinerja '.$area->nama.' belum diisi, '
                    .'sehingga Faktor Risiko 2 dinilai dari kombinasi centang. '
                    .'Tuliskan dasar pertimbangannya pada kolom Catatan Profesional.',
            ]);
        }

        $faktor->save();

        // Pagu dan tahun terakhir diawasi juga hidup di Peta Auditan supaya
        // Formulir 1 tetap utuh sebagai daftar induk; disinkronkan di sini
        // supaya pemakai tidak perlu mengetik dua kali di dua layar.
        $area->update([
            'pagu_anggaran' => $data['pagu_anggaran'] ?? $area->pagu_anggaran,
            'tahun_terakhir_diawasi' => $data['tahun_terakhir_diawasi'] ?? $area->tahun_terakhir_diawasi,
        ]);

        return back()->with('success', 'Faktor risiko '.$area->nama.' disimpan.');
    }

    /** Menyalin pagu dari Peta Auditan ke seluruh baris faktor sekaligus. */
    public function tarikPagu(Request $request)
    {
        $periode = $this->periodeWajib($request);
        $this->pastikanBolehMengisi($request, $periode);

        abort_unless(
            (bool) $periode->total_belanja_langsung,
            422,
            'Total belanja langsung APBK belum diisi pada periode ini, sehingga persentase anggaran tidak dapat dihitung.'
        );

        $diisi = 0;
        foreach (PkptAreaPengawasan::where('periode_id', $periode->id)->whereNotNull('pagu_anggaran')->get() as $a) {
            $f = PkptFaktorRisiko::firstOrNew(['periode_id' => $periode->id, 'area_id' => $a->id]);
            $f->pagu_anggaran = $a->pagu_anggaran;
            $f->persen_belanja_langsung = round($a->pagu_anggaran / $periode->total_belanja_langsung * 100, 3);
            $f->fill($this->hitung->skalaFaktor($f, $a->kelompok, $periode->tahun_pkpt));
            $f->save();
            $diisi++;
        }

        return back()->with('success', 'Pagu anggaran '.$diisi.' Area Pengawasan disalin dari Peta Auditan.');
    }
}
