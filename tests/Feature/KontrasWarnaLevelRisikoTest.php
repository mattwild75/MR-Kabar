<?php

namespace Tests\Feature;

use App\Models\RiskLevel;
use App\Models\RiskMatrixCell;
use Database\Seeders\RiskReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Penjaga temuan PASS 6: teks putih pada lencana level risiko tidak terbaca.
 *
 * Diukur di peramban dengan rumus kontras WCAG, bukan dikira-kira dari
 * tampilannya:
 *
 *   putih di atas sky-400     2,18      hitam   9,64
 *   putih di atas orange-400  2,38      hitam   8,83
 *   putih di atas red-500     3,81      hitam   5,52
 *
 * WCAG AA menuntut 4,5 untuk teks biasa dan 3,0 untuk teks besar. Ketiganya
 * gagal dengan putih; dua di antaranya gagal untuk teks besar sekalipun.
 *
 * Level risiko adalah inti aplikasi ini, dan yang paling perlu terbaca —
 * "Sangat Tinggi" — termasuk yang gagal. Warnanya tersimpan di basis data dan
 * dapat disunting Admin, jadi yang dijaga di sini adalah nilai bawaannya:
 * seeder untuk pemasangan baru, migrasi untuk yang sudah ada.
 */
class KontrasWarnaLevelRisikoTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Latar terang yang teks putihnya terbukti gagal WCAG AA.
     *
     * @var array<int, string>
     */
    private const LATAR_TERANG = ['bg-sky-400', 'bg-green-400', 'bg-yellow-300', 'bg-orange-400', 'bg-red-500'];

    public function test_tidak_ada_level_risiko_berteks_putih_di_atas_latar_terang(): void
    {
        $this->seed(RiskReferenceDataSeeder::class);

        foreach (RiskLevel::all() as $level) {
            foreach (self::LATAR_TERANG as $latar) {
                if (str_contains($level->warna_class, $latar)) {
                    $this->assertStringNotContainsString(
                        'text-white',
                        $level->warna_class,
                        "Level '{$level->label}' memakai teks putih di atas {$latar} — kontrasnya di bawah 4,5."
                    );
                }
            }
        }
    }

    public function test_tidak_ada_sel_matriks_berteks_putih_di_atas_latar_terang(): void
    {
        $this->seed(RiskReferenceDataSeeder::class);

        $bermasalah = RiskMatrixCell::where('warna_class', 'like', '%text-white%')->get();

        $this->assertCount(
            0,
            $bermasalah,
            'Ada '.$bermasalah->count().' sel matriks berteks putih: '
                .$bermasalah->pluck('warna_class')->unique()->implode(', ')
        );
    }

    /**
     * Kelima level tetap punya warna, bukan dikosongkan demi lolos uji.
     *
     * Tanpa pemeriksaan ini, menghapus seluruh warna akan membuat kedua uji
     * di atas hijau — dan peta risikonya jadi putih polos.
     */
    public function test_kelima_level_tetap_berwarna_dan_berteks_hitam(): void
    {
        $this->seed(RiskReferenceDataSeeder::class);

        $level = RiskLevel::all();
        $this->assertCount(5, $level);

        foreach ($level as $l) {
            $this->assertStringContainsString('bg-', $l->warna_class, "Level '{$l->label}' tidak punya warna latar.");
            $this->assertStringContainsString('text-black', $l->warna_class, "Level '{$l->label}' tidak berteks hitam.");
        }
    }
}
