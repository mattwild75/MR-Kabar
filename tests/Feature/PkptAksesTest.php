<?php

namespace Tests\Feature;

use App\Models\Opd;
use App\Models\Pkpt\PkptAreaPengawasan;
use App\Models\Pkpt\PkptPeriode;
use App\Models\User;
use Database\Seeders\PkptMenuSeeder;
use Database\Seeders\PkptPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Pagar akses modul PKPT.
 *
 * PKPT adalah SATU-SATUNYA kelompok menu data di aplikasi ini yang
 * default-deny. Seluruh menu risiko sengaja fail-open karena setiap PIC OPD
 * memang harus bisa membukanya; PKPT kebalikannya, isinya penilaian
 * Inspektorat atas OPD lain termasuk kolom potensi kecurangan dan kasus
 * hukum.
 *
 * Perbedaan itu tidak terlihat dari kode halaman mana pun, jadi harus ada
 * yang membuktikannya. Tanpa uji ini, satu baris permission yang hilang di
 * seeder membuat seluruh 49 PIC OPD bisa membaca penilaian tentang OPD lain
 * tanpa ada yang menyadarinya.
 */
class PkptAksesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PkptPermissionSeeder::class);
        $this->seed(PkptMenuSeeder::class);
    }

    /** Seluruh halaman PKPT yang dibuka lewat sidebar. */
    public static function halamanPkpt(): array
    {
        return [
            ['/pkpt'],
            ['/pkpt/peta-auditan'],
            ['/pkpt/evaluasi-register'],
            ['/pkpt/kematangan-mr'],
            ['/pkpt/faktor-risiko'],
            ['/pkpt/penugasan-wajib'],
            ['/pkpt/total-nilai'],
            ['/pkpt/peringkat'],
            ['/pkpt/jakwas'],
            ['/pkpt/program-kerja'],
            ['/pkpt/cetak/f1'],
            ['/pkpt/cetak/f9'],
        ];
    }

    #[DataProvider('halamanPkpt')]
    public function test_pic_opd_biasa_ditolak_di_setiap_halaman_pkpt(string $jalur): void
    {
        $this->buatPeriode();

        $opd = Opd::create(['nama' => 'DINAS UJI']);
        $pic = User::factory()->create(['opd_id' => $opd->id]);
        Role::firstOrCreate(['name' => 'user']);
        $pic->assignRole('user');

        $this->actingAs($pic)->get($jalur)->assertForbidden();
    }

    #[DataProvider('halamanPkpt')]
    public function test_akun_apip_boleh_membuka_setiap_halaman_pkpt(string $jalur): void
    {
        $this->buatPeriode();

        $this->actingAs($this->akunApip())->get($jalur)->assertOk();
    }

    /**
     * Menetapkan periode dan mengubah bobot bukan pekerjaan harian APIP:
     * keduanya menyangkut angka yang tercantum dalam Keputusan Inspektur.
     */
    public function test_apip_tidak_boleh_menetapkan_periode_atau_mengubah_pengaturan(): void
    {
        $periode = $this->buatPeriode();
        $apip = $this->akunApip();

        $this->actingAs($apip)
            ->post("/pkpt/periode/{$periode->id}/tetapkan", [
                'nomor_keputusan' => '700/1/2027',
                'tanggal_penetapan' => '2026-12-31',
            ])
            ->assertForbidden();

        $this->actingAs($apip)->get('/pkpt/pengaturan')->assertForbidden();
    }

    /**
     * Periode yang sudah ditetapkan menolak SETIAP penulisan dengan 423.
     *
     * Kode 423 Locked, bukan 403: yang bermasalah bukan siapa yang meminta,
     * melainkan keadaan periodenya.
     */
    public function test_periode_yang_sudah_ditetapkan_menolak_seluruh_penulisan(): void
    {
        $periode = $this->buatPeriode();
        $area = PkptAreaPengawasan::create([
            'periode_id' => $periode->id,
            'kelompok' => 'skpk',
            'nama' => 'Dinas Uji',
        ]);

        $periode->update(['status' => 'ditetapkan']);
        $apip = $this->akunApip();

        $this->actingAs($apip)
            ->post('/pkpt/peta-auditan', [
                'periode' => $periode->id,
                'kelompok' => 'skpk',
                'nama' => 'Dinas Baru',
            ])
            ->assertStatus(423);

        $this->actingAs($apip)
            ->put("/pkpt/peta-auditan/{$area->id}", ['kelompok' => 'skpk', 'nama' => 'Diubah'])
            ->assertStatus(423);

        $this->actingAs($apip)
            ->delete("/pkpt/peta-auditan/{$area->id}")
            ->assertStatus(423);

        $this->actingAs($apip)
            ->post('/pkpt/hitung', ['periode' => $periode->id])
            ->assertStatus(423);

        // Membacanya tetap boleh — yang terkunci penulisannya, bukan halamannya.
        $this->actingAs($apip)->get('/pkpt/peta-auditan')->assertOk();
    }

    /**
     * Perhitungan DITOLAK selama tingkat kematangan MR belum ditetapkan.
     *
     * Tanpa level tidak ada bobot, dan tanpa bobot tidak ada satu Area pun
     * yang bisa dinilai. Menjalankannya toh hanya menghasilkan ratusan baris
     * kosong yang terlihat seperti hasil.
     */
    public function test_hitung_ditolak_selama_kematangan_mr_belum_ditetapkan(): void
    {
        $periode = $this->buatPeriode();
        PkptAreaPengawasan::create([
            'periode_id' => $periode->id,
            'kelompok' => 'skpk',
            'nama' => 'Dinas Uji',
        ]);

        $this->actingAs($this->akunApip())
            ->post('/pkpt/hitung', ['periode' => $periode->id])
            ->assertSessionHasErrors('hitung');
    }

    public function test_super_admin_boleh_membuka_kembali_periode_dengan_alasan(): void
    {
        $periode = $this->buatPeriode();
        $periode->update(['status' => 'ditetapkan']);

        Role::firstOrCreate(['name' => 'super-admin']);
        $super = User::factory()->create();
        $super->assignRole('super-admin');

        // Tanpa alasan ditolak: membuka kembali berarti dokumen yang sudah
        // ditandatangani akan berubah.
        $this->actingAs($super)
            ->post("/pkpt/periode/{$periode->id}/buka", ['alasan' => 'singkat'])
            ->assertSessionHasErrors('alasan');

        $this->actingAs($super)
            ->post("/pkpt/periode/{$periode->id}/buka", [
                'alasan' => 'Terdapat kekeliruan pagu anggaran pada dua Area Pengawasan.',
            ])
            ->assertSessionHasNoErrors();

        $this->assertSame('rancangan', $periode->fresh()->status);
        $this->assertStringContainsString('Dibuka kembali oleh', $periode->fresh()->catatan);
    }

    /**
     * Akun APIP membaca seluruh MR Kabar seperti akun peninjau, tetapi hak
     * tulisnya berhenti di menu PKPT.
     *
     * Dua sisi yang harus benar sekaligus, dan keduanya mudah salah:
     * memberinya hak tulis penuh membuat Inspektorat bisa mengubah register
     * risiko milik SKPK — persis yang dilarang BAB III Lampiran Keputusan;
     * menguncinya rapat membuat APIP menyusun peringkat tanpa pernah melihat
     * register yang diperingkatnya.
     */
    public function test_apip_membaca_seluruh_mr_kabar_tetapi_menulis_hanya_di_pkpt(): void
    {
        $periode = $this->buatPeriode();
        $apip = $this->akunApip();

        // Membaca seluruh data risiko lintas-OPD, sama seperti akun peninjau.
        $this->assertTrue($apip->canViewAllOpd(), 'APIP harus melihat data seluruh Perangkat Daerah');
        $this->assertTrue($apip->isViewerOnly(), 'APIP hanya-baca terhadap data MR Kabar');
        $this->assertTrue($apip->isApip());

        // Menulis di PKPT: diizinkan.
        $this->actingAs($apip)
            ->post('/pkpt/peta-auditan', [
                'periode' => $periode->id,
                'kelompok' => 'skpk',
                'nama' => 'Dinas Uji',
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('pkpt_area_pengawasan', ['nama' => 'Dinas Uji']);

        // Menulis di luar PKPT: ditolak ViewerReadOnly, bukan diam-diam lolos.
        $this->actingAs($apip)
            ->post('/tahun-aktif', ['tahun_penilaian' => 2030])
            ->assertSessionHas('error');
    }

    /**
     * Peran eksekutif TIDAK ikut memperoleh hak tulis PKPT.
     *
     * Keduanya menumpang penjaga ViewerReadOnly yang sama, jadi pengecualian
     * untuk apip harus benar-benar hanya berlaku untuk apip.
     */
    public function test_peninjau_tetap_tidak_dapat_menulis_di_pkpt(): void
    {
        $periode = $this->buatPeriode();

        Role::firstOrCreate(['name' => 'eksekutif']);
        $vip = User::factory()->create();
        $vip->assignRole('eksekutif');

        $this->actingAs($vip)
            ->post('/pkpt/peta-auditan', [
                'periode' => $periode->id,
                'kelompok' => 'skpk',
                'nama' => 'Dinas Peninjau',
            ])
            ->assertSessionHas('error');

        $this->assertDatabaseMissing('pkpt_area_pengawasan', ['nama' => 'Dinas Peninjau']);
    }

    public function test_admin_dan_super_admin_dapat_membuka_pkpt(): void
    {
        $this->buatPeriode();

        foreach (['admin', 'super-admin'] as $peran) {
            Role::firstOrCreate(['name' => $peran]);
            $user = User::factory()->create();
            $user->assignRole($peran);

            $this->actingAs($user)->get('/pkpt')->assertOk();
            $this->actingAs($user)->get('/pkpt/pengaturan')->assertOk();
        }
    }

    private function buatPeriode(): PkptPeriode
    {
        return PkptPeriode::create([
            'tahun_pkpt' => 2027,
            'tahun_dasar_risiko' => 2026,
        ]);
    }

    private function akunApip(): User
    {
        $user = User::factory()->create();
        $user->assignRole('apip');

        return $user;
    }
}
