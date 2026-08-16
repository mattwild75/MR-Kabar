<?php

namespace Tests\Feature;

use App\Models\ArahanPenilaianRisiko;
use App\Models\ArahanTahapan;
use App\Models\Opd;
use App\Models\PengaturanPemda;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Widget jadwal penilaian Risiko pada Dasbor.
 *
 * Isinya dibaca dari Arahan yang DITETAPKAN Bupati, bukan dikarang aplikasi.
 * Yang paling penting diuji: arahan yang masih draf tidak boleh menagih siapa
 * pun, dan jadwal terlihat sama bagi PIC maupun Admin karena arahan berlaku
 * bagi seluruh Pemerintah Kabupaten Aceh Barat.
 */
class JadwalPenilaianDasborTest extends TestCase
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
        $opd = Opd::firstOrCreate(['nama' => 'Dinas Kesehatan']);
        $u = User::factory()->create(['opd_id' => $opd->id]);
        $u->assignRole($peran);

        return $u;
    }

    private function arahanDenganTahapan(string $status = 'berlaku', string $jenis = '1_tahunan'): ArahanPenilaianRisiko
    {
        $arahan = ArahanPenilaianRisiko::create([
            'jenis' => $jenis,
            'tahun_mulai' => self::TAHUN,
            'tahun_selesai' => self::TAHUN,
            'nomor_se' => 'SE-700/123/2026',
            'status' => $status,
        ]);

        ArahanTahapan::create([
            'arahan_penilaian_risiko_id' => $arahan->id,
            'urutan' => 1,
            'tahapan' => 'Penilaian Risiko Operasional OPD',
            'dokumen_pemicu' => 'RKA OPD',
            'tanggal_mulai' => self::TAHUN.'-10-03',
            'tanggal_selesai' => self::TAHUN.'-10-14',
            'pelaksana' => 'Seluruh OPD, difasilitasi Inspektorat',
            'keluaran' => 'Dokumen Penilaian Risiko Operasional OPD',
        ]);

        return $arahan;
    }

    public function test_dasbor_menampilkan_tahapan_dari_arahan_yang_berlaku(): void
    {
        $this->arahanDenganTahapan();

        $this->actingAs($this->pengguna('admin'))
            ->get('/dashboard?tahun='.self::TAHUN)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('jadwalPenilaian', 1)
                ->has('jadwalPenilaian.0.tahapan', 1)
                ->where('jadwalPenilaian.0.tahapan.0.tahapan', 'Penilaian Risiko Operasional OPD')
                ->where('jadwalPenilaian.0.tahapan.0.dokumen_pemicu', 'RKA OPD')
                ->has('jadwalPenilaian.0.tahapan.0.keadaan'));
    }

    /**
     * Penjaga terpenting: arahan yang masih disusun tidak boleh muncul sebagai
     * jadwal dan menagih OPD atas sesuatu yang belum ditetapkan Bupati.
     */
    public function test_arahan_draf_tidak_muncul_di_dasbor(): void
    {
        $this->arahanDenganTahapan('draf');

        $this->actingAs($this->pengguna('admin'))
            ->get('/dashboard?tahun='.self::TAHUN)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->has('jadwalPenilaian', 0));
    }

    public function test_arahan_tahun_lain_tidak_muncul(): void
    {
        ArahanPenilaianRisiko::create([
            'jenis' => '1_tahunan',
            'tahun_mulai' => 2025,
            'tahun_selesai' => 2025,
            'status' => 'berlaku',
        ]);

        $this->actingAs($this->pengguna('admin'))
            ->get('/dashboard?tahun='.self::TAHUN)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->has('jadwalPenilaian', 0));
    }

    /**
     * Arahan berlaku bagi seluruh Pemerintah Kabupaten Aceh Barat, jadi PIC
     * melihat tenggat yang sama persis dengan Admin — tidak di-scope per-OPD.
     */
    public function test_pic_melihat_jadwal_yang_sama_dengan_admin(): void
    {
        $this->arahanDenganTahapan();

        $this->actingAs($this->pengguna('user'))
            ->get('/dashboard?tahun='.self::TAHUN)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('jadwalPenilaian', 1)
                ->has('jadwalPenilaian.0.tahapan', 1));
    }

    /**
     * Arahan 1 tahunan memuat tanggal konkret, sedangkan yang 5 tahunan
     * biasanya hanya kerangka periodenya — jadi yang tahunan didahulukan.
     */
    public function test_arahan_satu_tahunan_didahulukan_atas_yang_lima_tahunan(): void
    {
        ArahanPenilaianRisiko::create([
            'jenis' => '5_tahunan',
            'tahun_mulai' => 2025,
            'tahun_selesai' => 2029,
            'status' => 'berlaku',
        ]);
        $this->arahanDenganTahapan('berlaku', '1_tahunan');

        $this->actingAs($this->pengguna('admin'))
            ->get('/dashboard?tahun='.self::TAHUN)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('jadwalPenilaian', 2)
                ->where('jadwalPenilaian.0.jenis', '1_tahunan')
                ->where('jadwalPenilaian.1.jenis', '5_tahunan'));
    }

    public function test_dasbor_tetap_terbuka_ketika_belum_ada_arahan_sama_sekali(): void
    {
        $this->actingAs($this->pengguna('admin'))
            ->get('/dashboard?tahun='.self::TAHUN)
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->has('jadwalPenilaian', 0));
    }
}
