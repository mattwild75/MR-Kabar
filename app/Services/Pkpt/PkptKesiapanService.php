<?php

namespace App\Services\Pkpt;

use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\Opd;
use App\Models\Pkpt\PkptAreaPengawasan;
use App\Models\Pkpt\PkptFaktor;
use App\Models\Pkpt\PkptFaktorRisiko;
use App\Models\Pkpt\PkptKematanganMr;
use App\Models\Pkpt\PkptPeriode;
use App\Models\Pkpt\PkptSektorUnggulan;

/**
 * Panel Kesiapan Data — menjawab satu pertanyaan: berapa persen bobot yang
 * benar-benar terpakai?
 *
 * Panel ini bukan hiasan. Data yang dituntut metode PPBR sebagian memang belum
 * ada di basis data Pemerintah Kabupaten, dan tanpa panel ini peringkat yang
 * dihasilkan akan tampak selengkap peringkat yang datanya utuh. Yang dicegah
 * di sini adalah PKPT ditandatangani tanpa ada yang tahu bahwa 45% bobot
 * faktornya kosong.
 *
 * Penetapan kematangan MR juga MEMBLOKIR perhitungan, bukan sekadar
 * diperingatkan: tanpa level, tidak ada bobot sama sekali, dan Total Nilai
 * Risiko tidak bisa dihitung untuk satu Area pun.
 */
class PkptKesiapanService
{
    public function untukPeriode(PkptPeriode $periode): array
    {
        $totalOpd = Opd::count();
        $totalArea = PkptAreaPengawasan::where('periode_id', $periode->id)->count();

        return [
            'total_area' => $totalArea,
            'total_opd' => $totalOpd,
            'register' => $this->register($periode, $totalOpd),
            'kematangan' => $this->kematangan($periode, $totalOpd),
            'faktor' => $this->faktor($periode, $totalArea),
            'sektor_unggulan' => PkptSektorUnggulan::where('periode_id', $periode->id)->count(),
            'belanja_langsung' => $periode->total_belanja_langsung,
            'bobot_terpakai' => $this->bobotTerpakai($periode, $totalArea),
            'boleh_hitung' => $this->bolehHitung($periode, $totalArea),
        ];
    }

    /** Berapa Perangkat Daerah yang sudah punya Register Risiko pada tahun dasar. */
    private function register(PkptPeriode $periode, int $totalOpd): array
    {
        $tahun = $periode->tahun_dasar_risiko;

        $punya = IrsPd::where('TAHUN DINILAI RISIKO', $tahun)
            ->join('users', 'tbl_irs_pd.user_id', '=', 'users.id')
            ->whereNotNull('users.opd_id')->distinct()->pluck('users.opd_id')
            ->merge(
                IroPd::where('TAHUN DINILAI RISIKO', $tahun)
                    ->join('users', 'tbl_iro_pd.user_id', '=', 'users.id')
                    ->whereNotNull('users.opd_id')->distinct()->pluck('users.opd_id')
            )->unique();

        return [
            'terisi' => $punya->count(),
            'dari' => $totalOpd,
            'persen' => $totalOpd > 0 ? (int) round($punya->count() / $totalOpd * 100) : 0,
        ];
    }

    private function kematangan(PkptPeriode $periode, int $totalOpd): array
    {
        $terisi = PkptKematanganMr::where('periode_id', $periode->id)
            ->whereNotNull('bobot_register')->count();

        return [
            'terisi' => $terisi,
            'dari' => $totalOpd,
            'persen' => $totalOpd > 0 ? (int) round($terisi / $totalOpd * 100) : 0,
            'memblokir' => $terisi === 0,
        ];
    }

    /** Kelengkapan tiap faktor, beserta bobotnya. */
    private function faktor(PkptPeriode $periode, int $totalArea): array
    {
        $kolom = [
            'FR1' => 'skala_fr1',
            'FR2' => 'skala_fr2',
            'FR3' => 'skala_fr3',
            'FR4' => 'skala_fr4',
            'FR5' => 'skala_fr5',
        ];

        $hasil = [];
        foreach (PkptFaktor::terurut() as $kode => $f) {
            $terisi = PkptFaktorRisiko::where('periode_id', $periode->id)
                ->whereNotNull($kolom[$kode])->count();

            $hasil[] = [
                'kode' => $kode,
                'nama' => $f->nama,
                'bobot' => $f->bobot_persen,
                'terisi' => $terisi,
                'dari' => $totalArea,
                'persen' => $totalArea > 0 ? (int) round($terisi / $totalArea * 100) : 0,
            ];
        }

        return $hasil;
    }

    /**
     * Rata-rata bobot faktor yang terpakai di seluruh Area.
     *
     * Diambil dari hasil hitung terakhir kalau ada, karena di sanalah angka
     * yang sesungguhnya dipakai tercatat. Sebelum pernah dihitung, dihitung
     * kasar dari kelengkapan kolomnya.
     */
    private function bobotTerpakai(PkptPeriode $periode, int $totalArea): int
    {
        if ($totalArea === 0) {
            return 0;
        }

        $rata = PkptFaktorRisiko::where('periode_id', $periode->id)->get()
            ->map(fn ($f) => collect(PkptFaktor::terurut())
                ->filter(fn ($x, $kode) => ($f->skala()[$kode] ?? null) !== null)
                ->sum('bobot_persen'))
            ->avg();

        return (int) round($rata ?? 0);
    }

    /**
     * Boleh menghitung atau tidak, beserta alasannya kalau tidak.
     *
     * Tombol mati tanpa penjelasan adalah cacat antarmuka tersendiri, jadi
     * alasannya ikut dikirim ke halaman.
     */
    private function bolehHitung(PkptPeriode $periode, int $totalArea): array
    {
        $halangan = [];

        if ($periode->terkunci()) {
            $halangan[] = 'Periode sudah ditetapkan dan tidak dapat dihitung ulang.';
        }
        if ($totalArea === 0) {
            $halangan[] = 'Peta Auditan masih kosong. Isi Formulir 1 lebih dahulu.';
        }
        if (PkptKematanganMr::where('periode_id', $periode->id)->whereNotNull('bobot_register')->count() === 0) {
            $halangan[] = 'Tingkat kematangan manajemen risiko belum ditetapkan untuk satu SKPK pun, '
                .'sehingga bobot Register Risiko dan Faktor Pertimbangan Manajemen belum ada.';
        }

        return ['boleh' => $halangan === [], 'halangan' => $halangan];
    }
}
