<?php

namespace Tests\Feature;

use App\Models\Pkpt\PkptTingkatRisiko;
use App\Models\Pkpt\PkptZonaFrekuensi;
use App\Services\Pkpt\PkptPerhitunganService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Mesin hitung PKPT diadu dengan CONTOH PERDEP-nya sendiri.
 *
 * Tabel 4.1 Perdep PPKD BPKP Nomor 08 Tahun 2020 memuat empat baris contoh
 * lengkap dengan hasil akhirnya. Empat baris itu dipakai di sini sebagai
 * kebenaran acuan: kalau rumus di aplikasi menyimpang, salah satu dari empat
 * ini akan gagal, dan penyimpangannya ketahuan sebelum dipakai menyusun PKPT
 * yang ditandatangani Inspektur.
 *
 * Ini satu-satunya cara memastikan hasilnya benar tanpa menunggu ada yang
 * mengecek ulang dengan kalkulator.
 */
class PkptPerhitunganTest extends TestCase
{
    use RefreshDatabase;

    private PkptPerhitunganService $hitung;

    protected function setUp(): void
    {
        parent::setUp();
        $this->hitung = app(PkptPerhitunganService::class);
    }

    /**
     * Empat baris Tabel 4.1 Perdep, apa adanya.
     *
     * Kolom: skala inheren, bobot register, lima skala faktor, skala FPM yang
     * dicetak Perdep, dan Total Risiko yang dicetak Perdep.
     */
    public static function contohPerdep(): array
    {
        return [
            'Area Pengawasan 1' => [11, 3, 40, [4, 2, 1, 4, 4], 2.9, 2.94, 'Sedang', 'Kuning'],
            'Area Pengawasan 2' => [10, 2, 70, [2, 2, 1, 3, 3], 2.1, 2.03, 'Sedang', 'Kuning'],
            'Area Pengawasan 3' => [16, 4, 40, [5, 3, 3, 4, 4], 3.8, 3.88, 'Tinggi', 'Merah'],
            'Area Pengawasan 4' => [18, 4, 70, [4, 4, 4, 5, 4], 4.15, 4.05, 'Sangat Tinggi', 'Merah'],
        ];
    }

    #[\PHPUnit\Framework\Attributes\DataProvider('contohPerdep')]
    public function test_perhitungan_cocok_dengan_contoh_tabel_41_perdep(
        int $nilaiInheren,
        int $skalaInherenHarap,
        int $bobotRegister,
        array $skalaFaktor,
        float $skalaFpmHarap,
        float $totalHarap,
        string $tingkatHarap,
        string $zonaHarap
    ): void {
        // Konversi nilai risiko komposit ke skala 1..5 (Tabel 7).
        $this->assertSame(
            $skalaInherenHarap,
            $this->hitung->skalaInheren($nilaiInheren),
            "Nilai inheren {$nilaiInheren} seharusnya berskala {$skalaInherenHarap}"
        );

        // Gabungan lima faktor menurut bobot 25/25/20/15/15 (Tabel 8).
        $gabung = $this->hitung->gabungkanFaktor(array_combine(
            ['FR1', 'FR2', 'FR3', 'FR4', 'FR5'],
            $skalaFaktor
        ));

        $this->assertSame(100, $gabung['bobot_terpakai'], 'Lima faktor terisi berarti bobot terpakai penuh');
        $this->assertSame($skalaFpmHarap, $gabung['skala']);

        // Total = (inheren x bobot register) + (FPM x bobot faktor).
        $total = round(
            ($skalaInherenHarap * $bobotRegister + $gabung['skala'] * (100 - $bobotRegister)) / 100,
            2
        );
        $this->assertSame($totalHarap, $total);

        $this->assertSame($tingkatHarap, PkptTingkatRisiko::untukNilai($total)?->nama);
        $this->assertSame($zonaHarap, PkptZonaFrekuensi::untukNilai($total)?->zona);
    }

    /**
     * Faktor yang datanya belum ada DIKELUARKAN dari pembagi, bukan dinilai 1.
     *
     * Kalau null diperlakukan sebagai skala terendah, Area yang datanya paling
     * tipis akan tampak paling aman — persis kebalikan dari yang benar, dan
     * justru Area itu yang paling perlu diawasi.
     */
    public function test_faktor_kosong_dikeluarkan_dari_pembagi_bukan_dinilai_terendah(): void
    {
        // Hanya FR3 (bobot 20%) yang terisi, berskala 5.
        $gabung = $this->hitung->gabungkanFaktor([
            'FR1' => null, 'FR2' => null, 'FR3' => 5, 'FR4' => null, 'FR5' => null,
        ]);

        $this->assertSame(20, $gabung['bobot_terpakai']);
        $this->assertSame(5.0, $gabung['skala'], 'Satu-satunya faktor terisi berskala 5, gabungannya harus 5');

        // Kalau null dianggap 1, hasilnya akan (1*80 + 5*20)/100 = 1,8.
        $this->assertNotSame(1.8, $gabung['skala']);
    }

    public function test_tanpa_satu_pun_faktor_terisi_skalanya_null(): void
    {
        $gabung = $this->hitung->gabungkanFaktor([
            'FR1' => null, 'FR2' => null, 'FR3' => null, 'FR4' => null, 'FR5' => null,
        ]);

        $this->assertNull($gabung['skala']);
        $this->assertSame(0, $gabung['bobot_terpakai']);
    }

    /**
     * Tingkat risiko dan zona frekuensi adalah DUA SUMBU BERBEDA.
     *
     * Keduanya sempat disatukan dalam satu tabel dan itu keliru. Contoh
     * Tabel 4.4 Perdep sendiri membuktikannya: 3,9 dan 4,0 sama-sama berzona
     * merah dan diawasi setiap tahun, tetapi tingkat risikonya "Tinggi" dan
     * "Sangat Tinggi".
     */
    public function test_tingkat_risiko_lima_pita_zona_frekuensi_tiga_pita(): void
    {
        $this->assertSame(5, PkptTingkatRisiko::count());
        $this->assertSame(3, PkptZonaFrekuensi::count());

        $this->assertSame('Tinggi', PkptTingkatRisiko::untukNilai(3.9)?->nama);
        $this->assertSame('Sangat Tinggi', PkptTingkatRisiko::untukNilai(4.0)?->nama);

        $this->assertSame('Merah', PkptZonaFrekuensi::untukNilai(3.9)?->zona);
        $this->assertSame('Merah', PkptZonaFrekuensi::untukNilai(4.0)?->zona);
        $this->assertSame('Setiap tahun', PkptZonaFrekuensi::untukNilai(4.0)?->frekuensi);
    }

    /**
     * Batas antar pita bersifat inklusif di bawah — nilai tepat di batas
     * jatuh ke pita yang LEBIH TINGGI.
     *
     * Perdep menulis rentangnya bertumpang tindih ("2-3 kuning, 3-5 merah"),
     * jadi 3,00 harus merah. Tanpa aturan ini, nilai tepat di batas akan
     * jatuh ke pita yang lebih ringan dan Area itu diawasi lebih jarang
     * daripada seharusnya.
     */
    public function test_nilai_tepat_di_batas_jatuh_ke_pita_lebih_tinggi(): void
    {
        $this->assertSame('Merah', PkptZonaFrekuensi::untukNilai(3.00)?->zona);
        $this->assertSame('Kuning', PkptZonaFrekuensi::untukNilai(2.00)?->zona);
        $this->assertSame('Hijau', PkptZonaFrekuensi::untukNilai(1.99)?->zona);
    }

    /**
     * FR2 dinilai dari KOMBINASI, bukan dari cacah centang.
     *
     * Tabel 4.3 Perdep memberi skala 4 untuk "terkait RPJMD + sektor
     * unggulan" dan skala 3 untuk "terkait RPJMD + mendukung RPJMN".
     * Dua-duanya dua centang, tetapi skalanya berbeda — menjumlahkan centang
     * lalu memetakan cacahnya menghilangkan perbedaan itu.
     */
    public function test_fr2_membedakan_kombinasi_yang_cacah_centangnya_sama(): void
    {
        $skala = fn (bool $rpjmd, bool $rpjmn, bool $unggulan) => $this->hitung->skalaFaktor(
            new \App\Models\Pkpt\PkptFaktorRisiko([
                'terkait_rpjmd' => $rpjmd,
                'mendukung_rpjmn' => $rpjmn,
                'sektor_unggulan' => $unggulan,
            ]),
            'program_prioritas',
            2027
        );

        $rpjmnSaja = $skala(true, true, false);
        $unggulanSaja = $skala(true, false, true);

        $this->assertSame(2, $rpjmnSaja['nilai_fr2'], 'Dua-duanya dua centang');
        $this->assertSame(2, $unggulanSaja['nilai_fr2']);

        $this->assertSame(3, $rpjmnSaja['skala_fr2'], 'Terkait RPJMD + mendukung RPJMN berskala 3');
        $this->assertSame(4, $unggulanSaja['skala_fr2'], 'Terkait RPJMD + sektor unggulan berskala 4');

        $this->assertSame(5, $skala(true, true, true)['skala_fr2']);
        $this->assertSame(2, $skala(true, false, false)['skala_fr2']);
        $this->assertSame(1, $skala(false, false, false)['skala_fr2']);
    }

    /**
     * Nilai risiko komposit BERDESIMAL tidak boleh jatuh di celah antar pita.
     *
     * Tabel 7 menetapkan pitanya pada nilai bulat (1-5, 6-10, 11-15, 16-20,
     * 21-25), sedangkan komposit hasil RLD x RLK berdesimal. Versi pertama
     * mengembalikan 5 untuk nilai seperti 10,38 dan 15,05 karena tidak cocok
     * dengan satu pita pun — dan itu baru ketahuan setelah dijalankan pada
     * data sungguhan: sembilan dari sepuluh Area teratas berskala 5 padahal
     * kompositnya 10,38 sampai 22,32.
     *
     * Uji ini yang menjaga supaya tidak terulang, karena keliru di sini
     * membuat Area menengah tampak segenting Area paling genting.
     */
    public function test_komposit_berdesimal_tidak_melompat_ke_skala_tertinggi(): void
    {
        // Nilai-nilai yang jatuh persis di celah antar pita.
        $this->assertSame(2, $this->hitung->skalaInheren(10.38), '10,38 masih pita 6-10');
        $this->assertSame(3, $this->hitung->skalaInheren(15.05), '15,05 masih pita 11-15');
        $this->assertSame(4, $this->hitung->skalaInheren(20.62), '20,62 masih pita 16-20');
        $this->assertSame(1, $this->hitung->skalaInheren(5.99), '5,99 masih pita 1-5');

        // Cocok dengan contoh Perdep sendiri: Tabel 4.2 menghasilkan komposit
        // 11,69 dan 10,09, lalu Tabel 4.1 mencatatnya 11 dan 10.
        $this->assertSame(3, $this->hitung->skalaInheren(11.69));
        $this->assertSame(2, $this->hitung->skalaInheren(10.09));

        // Ujung rentang tetap terjepit, bukan null.
        $this->assertSame(5, $this->hitung->skalaInheren(25.00));
        $this->assertSame(5, $this->hitung->skalaInheren(30.00));
        $this->assertSame(1, $this->hitung->skalaInheren(0.50));
        $this->assertNull($this->hitung->skalaInheren(null));
    }

    /** FR1: batas atasnya eksklusif, 15% ke atas berskala 5. */
    public function test_skala_anggaran_memakai_batas_atas_eksklusif(): void
    {
        $skala = function (?float $persen) {
            $f = new \App\Models\Pkpt\PkptFaktorRisiko(['persen_belanja_langsung' => $persen]);

            return $this->hitung->skalaFaktor($f, 'program_prioritas', 2027)['skala_fr1'];
        };

        $this->assertNull($skala(null), 'Pagu belum tersedia berarti skalanya null, bukan 1');
        $this->assertSame(1, $skala(1.99));
        $this->assertSame(2, $skala(2.00));
        $this->assertSame(3, $skala(5.00));
        $this->assertSame(4, $skala(10.00));
        $this->assertSame(5, $skala(15.00));
        $this->assertSame(5, $skala(17.04));
    }

    /**
     * FR5 menggabungkan dua bagiannya menurut bobot 10% dan 5%, dan tetap
     * memberi hasil kalau salah satunya belum ada.
     */
    public function test_fr5_menggabungkan_tahun_terakhir_dan_pengalaman(): void
    {
        $f = new \App\Models\Pkpt\PkptFaktorRisiko([
            'tahun_terakhir_diawasi' => 2024,
            'jumlah_penugasan_sejenis' => 2,
        ]);
        $hasil = $this->hitung->skalaFaktor($f, 'skpk', 2027);

        $this->assertSame(3, $hasil['skala_tahun_terakhir'], '2027 dikurangi 2024 sama dengan 3');
        $this->assertSame(3, $hasil['skala_pengalaman'], '2 kali penugasan sejenis berskala 3');
        $this->assertSame(3.0, $hasil['skala_fr5']);

        // Hanya pengalaman yang terisi: bobot 5% dipakai penuh.
        $sebagian = $this->hitung->skalaFaktor(
            new \App\Models\Pkpt\PkptFaktorRisiko(['jumlah_penugasan_sejenis' => 4]),
            'skpk',
            2027
        );
        $this->assertNull($sebagian['skala_tahun_terakhir']);
        $this->assertSame(5.0, $sebagian['skala_fr5']);
    }
}
