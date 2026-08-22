<?php

namespace Tests\Feature;

use App\Models\RiskLevel;
use App\Services\RiskReferenceDataService;
use Database\Seeders\RiskReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Penjaga temuan R-16 — aturan Risiko Prioritas kini tinggal di satu tempat.
 *
 * Aturannya sederhana: skala risiko mencapai atau melewati ambang Selera
 * Risiko. Sebelumnya ditulis ulang di ELEVEN tempat pada lima controller,
 * dalam bentuk yang tidak seragam:
 *
 *     (int) ($r->{'SKALA RISIKO'} ?? 0) >= $ambangTinggi
 *     ($r['skala_risiko'] ?? 0)        >= $ambangTinggi
 *     $ambangTinggi !== null && (int) $r->{'SKALA RISIKO'} >= $ambangTinggi
 *
 * Selama nilainya selalu angka, ketiganya sepakat. Begitu ada yang mengirim
 * null atau teks kosong, mereka mulai berbeda pendapat tentang risiko mana
 * yang prioritas — dan yang berbeda pendapat itu ANGKA YANG TERCETAK di
 * dokumen resmi dan yang tampil di Dasbor.
 *
 * Uji ini mengunci jawabannya untuk bentuk-bentuk yang dulu memecah pendapat.
 */
class AturanRisikoPrioritasTest extends TestCase
{
    use RefreshDatabase;

    private RiskReferenceDataService $riskRef;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RiskReferenceDataSeeder::class);
        $this->riskRef = app(RiskReferenceDataService::class);
    }

    public function test_ambang_selera_terbaca_dari_level_risiko(): void
    {
        // Bawaan: Tinggi mulai skala 16, dan Tinggi melampaui Selera Risiko.
        $this->assertSame(16, $this->riskRef->ambangSeleraRisiko());
    }

    public function test_di_atas_ambang_adalah_prioritas(): void
    {
        $this->assertTrue($this->riskRef->adalahRisikoPrioritas(16));
        $this->assertTrue($this->riskRef->adalahRisikoPrioritas(20));
        $this->assertTrue($this->riskRef->adalahRisikoPrioritas(25));
    }

    public function test_di_bawah_ambang_bukan_prioritas(): void
    {
        $this->assertFalse($this->riskRef->adalahRisikoPrioritas(15));
        $this->assertFalse($this->riskRef->adalahRisikoPrioritas(1));
        $this->assertFalse($this->riskRef->adalahRisikoPrioritas(0));
    }

    /**
     * Bentuk-bentuk inilah yang dulu membuat kelima controller berbeda
     * pendapat. Sekarang jawabannya satu, dan tertulis di sini.
     */
    public function test_nilai_kosong_bukan_prioritas(): void
    {
        $this->assertFalse($this->riskRef->adalahRisikoPrioritas(null));
        $this->assertFalse($this->riskRef->adalahRisikoPrioritas(''));
    }

    /** Angka yang datang sebagai teks tetap dinilai sebagai angka. */
    public function test_angka_berbentuk_teks_dinilai_sama_dengan_angka(): void
    {
        $this->assertTrue($this->riskRef->adalahRisikoPrioritas('20'));
        $this->assertFalse($this->riskRef->adalahRisikoPrioritas('9'));
    }

    /**
     * Ambangnya ikut berubah kalau Admin mengubah Selera Risiko.
     *
     * Inilah alasan ambangnya diambil di dalam aturan, bukan diserahkan ke
     * pemanggil: pemanggil yang menyimpan ambang di variabel lokal akan
     * memakai angka basi begitu Admin menyuntingnya.
     */
    public function test_aturan_ikut_berubah_saat_selera_risiko_diubah(): void
    {
        $this->assertFalse($this->riskRef->adalahRisikoPrioritas(12));

        // Disimpan lewat INSTANS model, sama dengan jalur sungguhan di
        // KeteranganPendukungController. Mass update (RiskLevel::where(...)
        // ->update(...)) tidak memicu peristiwa model, jadi cache ambangnya
        // tidak ikut dibersihkan dan uji ini akan merah karena alasan yang
        // salah — sempat terjadi.
        RiskLevel::where('skala_min', 11)->first()->update(['melampaui_selera' => true]);
        $this->riskRef = app(RiskReferenceDataService::class);

        $this->assertSame(11, $this->riskRef->ambangSeleraRisiko());
        $this->assertTrue($this->riskRef->adalahRisikoPrioritas(12));
    }
}
