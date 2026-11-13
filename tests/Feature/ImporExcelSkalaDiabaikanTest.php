<?php

namespace Tests\Feature;

use App\Models\IrsPd;
use App\Models\User;
use App\Services\Excel\RiskExcelExportService;
use App\Services\Excel\RiskExcelImportService;
use App\Support\RiskExcelRegistry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Sejak 13 November 2026 skala risiko hanya dipilih lewat tabel kriteria di
 * Form Input. Angka skala yang diketik di berkas Excel diabaikan: risiko baru
 * tersimpan tanpa skala (dilengkapi PIC di form), risiko lama tetap memakai
 * skala yang tersimpan.
 */
class ImporExcelSkalaDiabaikanTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, string> */
    private function baris(array $isi = []): array
    {
        $modul = RiskExcelRegistry::modules()['irs_pd'];
        $kosong = array_fill_keys(RiskExcelRegistry::headerFor($modul), '');

        return array_merge($kosong, [
            'SASARAN RENSTRA' => 'Meningkatnya Transparansi Pengelolaan Anggaran',
            'URAIAN RISIKO' => 'Rendahnya kepatuhan tindak lanjut rekomendasi',
            'TAHUN DINILAI RISIKO' => '2026',
        ], $isi);
    }

    public function test_risiko_baru_dari_excel_tersimpan_tanpa_skala(): void
    {
        $u = User::factory()->create();
        $hasil = app(RiskExcelImportService::class)->write(
            ['irs_pd' => [$this->baris(['SKALA DAMPAK' => '5', 'SKALA KEMUNGKINAN' => '5'])]],
            ['irs_pd' => ['errors' => []]],
            $u->id,
        );

        $this->assertTrue($hasil['ok'] ?? true);
        $r = IrsPd::query()->where('URAIAN RISIKO', 'Rendahnya kepatuhan tindak lanjut rekomendasi')->firstOrFail();
        $this->assertNull($r->{'SKALA DAMPAK'});
        $this->assertNull($r->{'SKALA KEMUNGKINAN'});
        $this->assertNull($r->{'SKALA RISIKO'});
    }

    public function test_skala_risiko_lama_tidak_ditimpa_angka_di_excel(): void
    {
        $u = User::factory()->create();
        $lama = IrsPd::create([
            'user_id' => $u->id,
            'SASARAN RENSTRA' => 'Meningkatnya Transparansi Pengelolaan Anggaran',
            'URAIAN RISIKO' => 'Uraian lama',
            'TINGKAT RISIKO' => 'Risiko Strategis OPD',
            'TAHUN DINILAI RISIKO' => '2026',
            'SKALA DAMPAK' => 3,
            'SKALA KEMUNGKINAN' => 4,
            'SKALA DAMPAK INHEREN' => 4,
            'SKALA KEMUNGKINAN INHEREN' => 5,
            'KATEGORI EXISTING CONTROL' => 'KE (Kurang Efektif)',
        ]);

        app(RiskExcelImportService::class)->write(
            ['irs_pd' => [$this->baris([
                '_ROW_ID' => (string) $lama->id,
                'URAIAN RISIKO' => 'Uraian diperbarui lewat Excel',
                'KATEGORI EXISTING CONTROL' => 'KE (Kurang Efektif)',
                'SKALA DAMPAK' => '1',
                'SKALA KEMUNGKINAN' => '1',
            ])]],
            ['irs_pd' => ['errors' => []]],
            $u->id,
        );

        $lama->refresh();
        $this->assertSame('Uraian diperbarui lewat Excel', $lama->{'URAIAN RISIKO'});
        $this->assertSame(3, (int) $lama->{'SKALA DAMPAK'});
        $this->assertSame(4, (int) $lama->{'SKALA KEMUNGKINAN'});
        $this->assertSame(4, (int) $lama->{'SKALA DAMPAK INHEREN'});
    }

    public function test_kolom_skala_di_berkas_ekspor_dikunci_dan_diberi_catatan(): void
    {
        $buku = app(RiskExcelExportService::class)->build(false, ['irs_pd']);
        $lembar = $buku->getSheetByName(RiskExcelRegistry::modules()['irs_pd']['sheet_name']);
        $header = RiskExcelRegistry::headerFor(RiskExcelRegistry::modules()['irs_pd']);
        $kolom = array_search('SKALA DAMPAK', $header, true) + 1;

        $this->assertStringContainsString('DIABAIKAN saat impor', $lembar->getComment([$kolom, 1])->getText()->getPlainText());
        $this->assertSame('protected', $lembar->getStyle([$kolom, 2])->getProtection()->getLocked());
    }
}
