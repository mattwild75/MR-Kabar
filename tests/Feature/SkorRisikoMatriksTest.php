<?php

namespace Tests\Feature;

use App\Models\RiskMatrixCell;
use Database\Seeders\RiskReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Mengunci sifat khas Matriks Analisis Risiko Perdep PPKD No.4/2019.
 *
 * Kekeliruan paling umum pada aplikasi manajemen risiko adalah menghitung
 * skala risiko sebagai dampak x kemungkinan. Perdep TIDAK begitu: matriksnya
 * adalah tabel peringkat 1-25 yang sengaja memberi bobot lebih besar pada
 * DAMPAK. Kejadian langka berdampak besar diperlakukan lebih serius daripada
 * kejadian sering berdampak kecil — dan itu keputusan yang disengaja.
 *
 * Aplikasi ini sudah benar: seluruh pembacaan skala mengambil dari
 * risk_matrix_cells, tidak ada satu pun perkalian. Uji ini menjaganya tetap
 * begitu. Ia akan GAGAL seketika kalau ada yang mengganti isi matriks dengan
 * hasil perkalian, karena matriks perkalian melanggar dua sifat di bawah
 * sekaligus.
 *
 * Nilai jangkar diambil dari verifikasi terhadap PDF Perdep asli, bukan dari
 * ingatan. Ini penting: pada audit PASS 2B, matriks pembanding yang disusun
 * dari ingatan keliru dan sempat menuduh 16 sel menyimpang padahal
 * aplikasinya benar.
 */
class SkorRisikoMatriksTest extends TestCase
{
    use RefreshDatabase;

    private function skala(int $dampak, int $kemungkinan): int
    {
        return (int) RiskMatrixCell::where('dampak', $dampak)
            ->where('kemungkinan', $kemungkinan)
            ->value('skala_risiko');
    }

    public function test_tiga_nilai_jangkar_dari_perdep(): void
    {
        $this->seed(RiskReferenceDataSeeder::class);

        // Kalau matriksnya perkalian, ketiganya akan bernilai 5, 5, dan 12.
        $this->assertSame(20, $this->skala(5, 1), 'Dampak 5 x Kemungkinan 1 harus 20');
        $this->assertSame(9, $this->skala(1, 5), 'Dampak 1 x Kemungkinan 5 harus 9');
        $this->assertSame(17, $this->skala(4, 3), 'Dampak 4 x Kemungkinan 3 harus 17');
    }

    public function test_matriks_berisi_peringkat_1_sampai_25_tanpa_duplikat(): void
    {
        $this->seed(RiskReferenceDataSeeder::class);

        $nilai = RiskMatrixCell::pluck('skala_risiko')
            ->map(fn ($v) => (int) $v)->sort()->values()->all();

        $this->assertCount(25, $nilai);
        $this->assertSame(range(1, 25), $nilai, 'Matriks harus memuat peringkat 1-25, masing-masing sekali.');
    }

    /**
     * Sifat yang paling menentukan: dampak dibobot lebih berat.
     *
     * Untuk setiap pasangan (a,b) dengan a<b, sel dampak-tinggi harus lebih
     * besar daripada sel kemungkinan-tinggi. Matriks perkalian akan GAGAL
     * seluruhnya di sini, karena d*k = k*d.
     */
    public function test_dampak_selalu_dibobot_lebih_berat_daripada_kemungkinan(): void
    {
        $this->seed(RiskReferenceDataSeeder::class);

        for ($a = 1; $a <= 5; $a++) {
            for ($b = $a + 1; $b <= 5; $b++) {
                $this->assertGreaterThan(
                    $this->skala($a, $b),
                    $this->skala($b, $a),
                    "Dampak {$b} x Kemungkinan {$a} harus lebih besar daripada Dampak {$a} x Kemungkinan {$b}",
                );
            }
        }
    }

    public function test_skala_naik_seiring_dampak_dan_kemungkinan(): void
    {
        $this->seed(RiskReferenceDataSeeder::class);

        for ($d = 1; $d <= 5; $d++) {
            for ($k = 1; $k <= 5; $k++) {
                if ($d < 5) {
                    $this->assertGreaterThan($this->skala($d, $k), $this->skala($d + 1, $k));
                }
                if ($k < 5) {
                    $this->assertGreaterThan($this->skala($d, $k), $this->skala($d, $k + 1));
                }
            }
        }
    }
}
