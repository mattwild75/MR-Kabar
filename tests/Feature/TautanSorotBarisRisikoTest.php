<?php

namespace Tests\Feature;

use App\Models\IrsPd;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tautan "Buka Daftar" / "Lihat Data" harus membawa tahun, bukan hanya id.
 *
 * Halaman index IRS/IRO menyekat daftarnya per Tahun Penilaian. Tautan yang
 * hanya membawa `?highlight_id=` membuat halaman tujuan terbuka pada Tahun
 * Aktif — dan kalau risiko yang diklik tahun lain, barisnya TIDAK IKUT TERMUAT
 * sama sekali. Yang dilihat pengguna: "Tidak ada data". Tanpa galat, tanpa
 * petunjuk bahwa yang salah cuma penyaring tahunnya.
 *
 * Terjadi di produksi 10 September 2026: risiko 2025 diklik dari dasbor saat
 * Tahun Aktif 2026.
 */
class TautanSorotBarisRisikoTest extends TestCase
{
    use RefreshDatabase;

    private function risiko(User $pemilik, string $tahun): IrsPd
    {
        return IrsPd::create([
            'user_id' => $pemilik->id,
            'SASARAN RENSTRA' => 'Meningkatnya derajat kesehatan masyarakat',
            'URAIAN RISIKO' => 'Keterbatasan anggaran kesehatan',
            'TINGKAT RISIKO' => 'Risiko Strategis OPD',
            'TAHUN DINILAI RISIKO' => $tahun,
            'JENIS RISIKO' => '2 - Kesehatan',
            'ENTITAS PD YANG MENILAI' => 'Dinas Kesehatan',
            'SKALA DAMPAK' => 4,
            'SKALA KEMUNGKINAN' => 4,
            'SKALA RISIKO' => 20,
        ]);
    }

    /**
     * Inti temuannya: tiap tautan sorot yang dibangkitkan dasbor harus
     * menyertakan `tahun`, apa pun widget asalnya.
     */
    public function test_setiap_tautan_sorot_membawa_tahun(): void
    {
        $this->actingAs($pengguna = User::factory()->create());
        $this->risiko($pengguna, '2025');

        $isi = $this->get('/dashboard?tahun=2025')->assertOk()->getContent();

        preg_match_all('/highlight_id=\d+(&(?:amp;)?tahun=[^"&\\\s]*)?/', $isi, $cocok);

        $this->assertNotEmpty($cocok[0], 'Dasbor tidak membangkitkan satu pun tautan sorot; tes ini jadi tidak menguji apa pun.');

        foreach ($cocok[0] as $i => $tautan) {
            $this->assertNotSame(
                '',
                (string) ($cocok[1][$i] ?? ''),
                "Tautan sorot tanpa tahun: {$tautan}"
            );
        }
    }

    /** Tahunnya harus tahun BARIS itu, bukan Tahun Aktif. */
    public function test_tahun_yang_dibawa_adalah_tahun_baris(): void
    {
        $this->actingAs($pengguna = User::factory()->create());
        $this->risiko($pengguna, '2025');

        $this->get('/dashboard?tahun=2025')
            ->assertOk()
            ->assertSee('tahun=2025', false);
    }
}
