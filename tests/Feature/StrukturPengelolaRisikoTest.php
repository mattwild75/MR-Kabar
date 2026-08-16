<?php

namespace Tests\Feature;

use App\Models\Opd;
use App\Models\PengaturanPemda;
use App\Models\StrukturPengelolaRisiko;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Struktur pengelolaan Risiko sebagai data sekaligus halaman cetak.
 *
 * Perdep PPKD 4/2019 Lampiran 2 memuat contoh Keputusan Kepala Daerah tentang
 * struktur ini. Yang diuji: seluruh Pengguna boleh MELIHAT susunannya — justru
 * itu gunanya, supaya tahu kepada siapa melapor — tetapi hanya Admin yang boleh
 * mengubahnya.
 */
class StrukturPengelolaRisikoTest extends TestCase
{
    use RefreshDatabase;

    private const TAHUN = 2026;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['admin', 'super-admin', 'user'] as $nama) {
            Role::findOrCreate($nama, 'web');
        }
        PengaturanPemda::create(['tahun_penilaian' => self::TAHUN]);
    }

    private function pengguna(string $peran): User
    {
        $opd = Opd::firstOrCreate(['nama' => 'Sekretariat Daerah']);
        $u = User::factory()->create(['opd_id' => $opd->id]);
        $u->assignRole($peran);

        return $u;
    }

    private function muatan(array $tambahan = []): array
    {
        return array_merge([
            'tahun' => self::TAHUN,
            'peran' => 'koordinator_penyelenggaraan',
            'jabatan' => 'Sekretaris Daerah',
            'nama' => 'Nama Sekda',
            'tugas' => 'Mengoordinasikan penyelenggaraan pengelolaan Risiko di lingkungan pemerintah daerah.',
        ], $tambahan);
    }

    private function baris(array $tambahan = []): StrukturPengelolaRisiko
    {
        return StrukturPengelolaRisiko::create($this->muatan($tambahan));
    }

    // --- hak akses -------------------------------------------------------

    /**
     * Halaman ini justru berguna kalau semua orang bisa membukanya — supaya
     * tahu siapa Unit Kepatuhan dan kepada siapa mereka melapor.
     */
    public function test_pic_biasa_boleh_melihat_susunannya(): void
    {
        $this->baris();

        $this->actingAs($this->pengguna('user'))
            ->get('/cetak/struktur-pengelolaan-risiko?tahun='.self::TAHUN)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('rows', 1)
                ->where('canEdit', false));
    }

    public function test_pic_biasa_tidak_dapat_mengubah_susunan(): void
    {
        $this->actingAs($this->pengguna('user'))
            ->post('/cetak/struktur-pengelolaan-risiko', $this->muatan())
            ->assertForbidden();

        $this->assertSame(0, StrukturPengelolaRisiko::count());
    }

    public function test_pic_biasa_tidak_dapat_menghapus_susunan(): void
    {
        $baris = $this->baris();

        $this->actingAs($this->pengguna('user'))
            ->delete("/cetak/struktur-pengelolaan-risiko/{$baris->id}")
            ->assertForbidden();

        $this->assertSame(1, StrukturPengelolaRisiko::count());
    }

    // --- perekaman -------------------------------------------------------

    public function test_admin_dapat_merekam_susunan(): void
    {
        $this->actingAs($this->pengguna('admin'))
            ->post('/cetak/struktur-pengelolaan-risiko', $this->muatan())
            ->assertSessionHasNoErrors();

        $baris = StrukturPengelolaRisiko::firstOrFail();
        $this->assertSame('koordinator_penyelenggaraan', $baris->peran);
        $this->assertSame('Sekretaris Daerah', $baris->jabatan);
        $this->assertSame(
            'Unit Pemilik Risiko Tingkat Pemerintah Daerah',
            StrukturPengelolaRisiko::PERAN_LABEL['upr_pemda'],
        );
    }

    /**
     * Baris baru harus jatuh di urutan paling belakang; kalau di urutan nol,
     * ia melompat ke puncak struktur dan mengacak susunan jenjangnya.
     */
    public function test_baris_baru_ditaruh_di_urutan_paling_belakang(): void
    {
        $admin = $this->pengguna('admin');

        foreach (['upr_pemda', 'koordinator_penyelenggaraan', 'unit_kepatuhan'] as $peran) {
            $this->actingAs($admin)->post('/cetak/struktur-pengelolaan-risiko', $this->muatan(['peran' => $peran]));
        }

        $this->assertSame(
            ['upr_pemda', 'koordinator_penyelenggaraan', 'unit_kepatuhan'],
            StrukturPengelolaRisiko::orderBy('urutan')->pluck('peran')->all(),
        );
    }

    public function test_opd_yang_tidak_ada_ditolak(): void
    {
        $this->actingAs($this->pengguna('admin'))
            ->post('/cetak/struktur-pengelolaan-risiko', $this->muatan(['opd_id' => 999999]))
            ->assertSessionHasErrors('opd_id');
    }

    public function test_peran_tingkat_pemda_boleh_tanpa_opd(): void
    {
        $this->actingAs($this->pengguna('admin'))
            ->post('/cetak/struktur-pengelolaan-risiko', $this->muatan(['opd_id' => '']))
            ->assertSessionHasNoErrors();

        $this->assertNull(StrukturPengelolaRisiko::firstOrFail()->opd_id);
    }

    public function test_susunan_dipisahkan_per_tahun(): void
    {
        $this->baris(['tahun' => 2025]);
        $this->baris(['tahun' => 2026]);

        $this->actingAs($this->pengguna('admin'))
            ->get('/cetak/struktur-pengelolaan-risiko?tahun=2026')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->has('rows', 1)->where('tahun', 2026));
    }

    // --- salin tahun -----------------------------------------------------

    public function test_susunan_dapat_disalin_ke_tahun_berikutnya(): void
    {
        $this->baris(['tahun' => 2025, 'peran' => 'upr_pemda']);
        $this->baris(['tahun' => 2025, 'peran' => 'unit_kepatuhan']);

        $this->actingAs($this->pengguna('admin'))
            ->post('/cetak/struktur-pengelolaan-risiko/salin', ['tahun_sumber' => 2025, 'tahun_tujuan' => 2026])
            ->assertRedirect();

        $this->assertSame(2, StrukturPengelolaRisiko::where('tahun', 2026)->count());
        $this->assertSame(
            ['upr_pemda', 'unit_kepatuhan'],
            StrukturPengelolaRisiko::where('tahun', 2026)->orderBy('urutan')->pluck('peran')->all(),
        );
    }

    /**
     * Menyalin ke tahun yang sudah terisi akan menggandakan susunannya tanpa
     * ada yang menyadarinya.
     */
    public function test_menyalin_ke_tahun_yang_sudah_terisi_ditolak(): void
    {
        $this->baris(['tahun' => 2025]);
        $this->baris(['tahun' => 2026]);

        $this->actingAs($this->pengguna('admin'))
            ->post('/cetak/struktur-pengelolaan-risiko/salin', ['tahun_sumber' => 2025, 'tahun_tujuan' => 2026])
            ->assertRedirect()
            ->assertSessionHas('error', fn ($p) => str_contains($p, 'sudah punya susunan'));

        $this->assertSame(1, StrukturPengelolaRisiko::where('tahun', 2026)->count());
    }

    public function test_menyalin_dari_tahun_kosong_ditolak(): void
    {
        $this->actingAs($this->pengguna('admin'))
            ->post('/cetak/struktur-pengelolaan-risiko/salin', ['tahun_sumber' => 2024, 'tahun_tujuan' => 2026])
            ->assertRedirect()
            ->assertSessionHas('error', fn ($p) => str_contains($p, 'belum punya susunan'));
    }

    public function test_pic_biasa_tidak_dapat_menyalin_susunan(): void
    {
        $this->baris(['tahun' => 2025]);

        $this->actingAs($this->pengguna('user'))
            ->post('/cetak/struktur-pengelolaan-risiko/salin', ['tahun_sumber' => 2025, 'tahun_tujuan' => 2026])
            ->assertForbidden();

        $this->assertSame(0, StrukturPengelolaRisiko::where('tahun', 2026)->count());
    }

    // --- halaman ---------------------------------------------------------

    public function test_halaman_tetap_terbuka_ketika_belum_ada_susunan(): void
    {
        $this->actingAs($this->pengguna('admin'))
            ->get('/cetak/struktur-pengelolaan-risiko?tahun='.self::TAHUN)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('rows', 0)
                ->has('peranOptions')
                ->where('canEdit', true));
    }
}
