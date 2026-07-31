<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\VersiSnapshotService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use ZipArchive;

/**
 * Pemasangan tag versi git dengan snapshot database yang sepadan.
 *
 * Yang diuji di sini adalah PENJAGANYA, bukan jalur suksesnya: menandai versi
 * sungguhan akan membuat commit dan tag di repository ini sendiri, dan sebuah
 * pengujian tidak boleh meninggalkan jejak semacam itu. Justru penjaganya yang
 * penting — tiap satu yang jebol berakibat database ditimpa oleh berkas yang
 * salah, dan itu tidak bisa dibatalkan.
 */
class VersiSnapshotTest extends TestCase
{
    use RefreshDatabase;

    private function buatPeran(): void
    {
        foreach (['admin', 'super-admin', 'user'] as $nama) {
            Role::findOrCreate($nama, 'web');
        }
    }

    private function superAdmin(): User
    {
        $this->buatPeran();
        $u = User::factory()->create();
        $u->assignRole('super-admin');

        return $u;
    }

    private function admin(): User
    {
        $this->buatPeran();
        $u = User::factory()->create();
        $u->assignRole('admin');

        return $u;
    }

    private function layanan(): VersiSnapshotService
    {
        return app(VersiSnapshotService::class);
    }

    /**
     * Tulis satu snapshot palsu berikut catatannya, meniru bentuk yang
     * dihasilkan rekam() tanpa perlu menjalankan backup sungguhan.
     */
    private function palsukanSnapshot(string $tag, string $isiSql = "SELECT 1;\n"): string
    {
        $layanan = $this->layanan();
        File::ensureDirectoryExists($layanan->folder());

        $berkas = $layanan->berkasSnapshot($tag);
        $zip = new ZipArchive();
        $zip->open($berkas, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        $zip->addFromString('db-dumps/mysql-mrkabar.sql', $isiSql);
        $zip->close();

        File::put($layanan->folder() . '/manifest.json', json_encode([[
            'tag' => $tag,
            'commit' => str_repeat('a', 40),
            'dibuat' => '2026-07-31 08:00:00',
            'berkas' => $tag . '.zip',
            'ukuran' => File::size($berkas),
            'sidik_jari' => hash_file('sha256', $berkas),
            'migrasi_terakhir' => '2026_07_29_160000_create_program_bupati_risiko_usulan_table',
            'jumlah_migrasi' => 95,
            'cacah_tabel' => ['users' => 3],
            'catatan' => 'snapshot uji',
        ]]));

        return $berkas;
    }

    protected function tearDown(): void
    {
        // Folder versi ada di storage sungguhan, bukan disk palsu — kalau tidak
        // dibersihkan, sisa pengujian akan muncul di halaman Backup pengguna.
        File::deleteDirectory($this->layanan()->folder());

        parent::tearDown();
    }

    // --- pola nama versi -------------------------------------------------

    public function test_pola_nama_versi_menerima_bentuk_baku_dan_menolak_sisanya(): void
    {
        $layanan = $this->layanan();

        foreach (['v1.0.0', 'v1.0.4', 'v10.20.30', 'v2.0.0-rc.1'] as $sah) {
            $this->assertTrue($layanan->tagSah($sah), "$sah seharusnya diterima");
        }

        foreach (['1.0.4', 'v1.0', 'v1.0.4/../x', '../../.env', 'v1.0.4 ', 'versi-baru', ''] as $tidakSah) {
            $this->assertFalse($layanan->tagSah($tidakSah), "$tidakSah seharusnya ditolak");
        }
    }

    /**
     * Nama tag dipakai langsung sebagai nama berkas. Kalau penjaganya jebol,
     * sebuah nama seperti "../../.env" akan menulis ke luar folder versi.
     */
    public function test_nama_versi_menyimpang_tidak_pernah_menyentuh_berkas_di_luar_folder_versi(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        $this->layanan()->rekam('../../.env', storage_path('app/private'));
    }

    // --- hak akses -------------------------------------------------------

    public function test_admin_biasa_tidak_dapat_menandai_versi(): void
    {
        $this->actingAs($this->admin())
            ->post('/backup/versi', ['tag' => 'v9.9.9'])
            ->assertForbidden();
    }

    public function test_admin_biasa_tidak_dapat_mengunduh_snapshot_versi(): void
    {
        $this->palsukanSnapshot('v9.9.9');

        $this->actingAs($this->admin())
            ->get('/backup/versi/v9.9.9/unduh')
            ->assertForbidden();
    }

    public function test_admin_biasa_tidak_dapat_memulihkan_database_dari_snapshot_versi(): void
    {
        $this->palsukanSnapshot('v9.9.9');

        $this->actingAs($this->admin())
            ->post('/backup/versi/v9.9.9/pulihkan', ['konfirmasi' => 'v9.9.9'])
            ->assertForbidden();
    }

    // --- penjaga pembuatan versi ----------------------------------------

    public function test_nama_versi_tidak_berpola_baku_ditolak_sebelum_apa_pun_dikerjakan(): void
    {
        $this->actingAs($this->superAdmin())
            ->post('/backup/versi', ['tag' => 'versi-baru'])
            ->assertSessionHasErrors('tag');
    }

    public function test_versi_yang_sudah_ada_tidak_dapat_dipakai_ulang(): void
    {
        $tagAda = app(\App\Http\Controllers\BackupController::class);
        $adaTag = (new \ReflectionClass($tagAda))->getMethod('listGitTags');
        $adaTag->setAccessible(true);
        $daftar = $adaTag->invoke($tagAda);

        if (empty($daftar)) {
            $this->markTestSkipped('Repository ini belum punya tag, tidak ada yang bisa ditabrakkan.');
        }

        $this->actingAs($this->superAdmin())
            ->post('/backup/versi', ['tag' => $daftar[0]])
            ->assertRedirect()
            ->assertSessionHas('error', fn($pesan) => str_contains($pesan, 'sudah ada'));
    }

    // --- penjaga pemulihan ----------------------------------------------

    public function test_pemulihan_ditolak_bila_konfirmasi_tidak_sama_dengan_nama_versi(): void
    {
        $this->palsukanSnapshot('v9.9.9');

        $this->actingAs($this->superAdmin())
            ->post('/backup/versi/v9.9.9/pulihkan', ['konfirmasi' => 'v9.9.8'])
            ->assertRedirect()
            ->assertSessionHas('error', fn($pesan) => str_contains($pesan, 'Konfirmasi tidak cocok'));

        // Database harus utuh: snapshot palsu di atas hanya berisi "SELECT 1",
        // jadi kalau sempat dijalankan, tabel users akan hilang.
        $this->assertTrue(\Illuminate\Support\Facades\Schema::hasTable('users'));
    }

    public function test_pemulihan_ditolak_bila_berkas_snapshot_berubah_sejak_direkam(): void
    {
        $berkas = $this->palsukanSnapshot('v9.9.9');

        // Rusak berkasnya tanpa memperbarui manifes — persis yang terjadi kalau
        // seseorang menimpanya lewat Explorer.
        File::put($berkas, 'bukan zip sama sekali');

        $this->assertFalse($this->layanan()->snapshotUtuh('v9.9.9'));

        $this->actingAs($this->superAdmin())
            ->post('/backup/versi/v9.9.9/pulihkan', ['konfirmasi' => 'v9.9.9'])
            ->assertRedirect()
            ->assertSessionHas('error', fn($pesan) => str_contains($pesan, 'rusak'));

        $this->assertTrue(\Illuminate\Support\Facades\Schema::hasTable('users'));
    }

    public function test_pemulihan_versi_tanpa_snapshot_ditolak(): void
    {
        $this->actingAs($this->superAdmin())
            ->post('/backup/versi/v9.9.9/pulihkan', ['konfirmasi' => 'v9.9.9'])
            ->assertRedirect()
            ->assertSessionHas('error', fn($pesan) => str_contains($pesan, 'tidak ditemukan'));
    }

    public function test_unduh_snapshot_versi_yang_tidak_ada_menghasilkan_404(): void
    {
        $this->actingAs($this->superAdmin())
            ->get('/backup/versi/v9.9.9/unduh')
            ->assertNotFound();
    }

    // --- keadaan manifes -------------------------------------------------

    public function test_manifes_rusak_tidak_membuat_halaman_backup_gagal_dibuka(): void
    {
        $layanan = $this->layanan();
        File::ensureDirectoryExists($layanan->folder());
        File::put($layanan->folder() . '/manifest.json', '{ ini bukan json }');

        $this->assertSame([], $layanan->manifes());

        $this->actingAs($this->superAdmin())
            ->get('/backup')
            ->assertOk();
    }

    public function test_versi_yang_berkas_snapshotnya_terhapus_tidak_lagi_diakui_ada(): void
    {
        $berkas = $this->palsukanSnapshot('v9.9.9');
        $layanan = $this->layanan();

        $this->assertTrue($layanan->snapshotAda('v9.9.9'));

        File::delete($berkas);

        // Manifes masih menyebutnya, tapi berkasnya sudah tidak ada — keadaan
        // ini harus terbaca sebagai "tidak ada", bukan "ada".
        $this->assertNotNull($layanan->catatan('v9.9.9'));
        $this->assertFalse($layanan->snapshotAda('v9.9.9'));
        $this->assertFalse($layanan->snapshotUtuh('v9.9.9'));
    }

    public function test_selisih_migrasi_terbaca_ketika_skema_lebih_maju_daripada_versi(): void
    {
        $this->palsukanSnapshot('v9.9.9');

        $selisih = $this->layanan()->selisihMigrasi('v9.9.9');

        $this->assertNotNull($selisih);
        $this->assertSame(95, $selisih['tag']);
        $this->assertSame($selisih['sekarang'] - 95, $selisih['selisih']);
        $this->assertSame($selisih['sekarang'] === 95, $selisih['sepadan']);
    }

    public function test_cacah_tabel_melewati_tabel_yang_belum_ada_alih_alih_menyebutnya_nol(): void
    {
        $cacah = $this->layanan()->cacahTabel();

        $this->assertArrayHasKey('users', $cacah);
        foreach ($cacah as $tabel => $jumlah) {
            $this->assertTrue(
                \Illuminate\Support\Facades\Schema::hasTable($tabel),
                "tabel $tabel dicacah padahal tidak ada"
            );
            $this->assertIsInt($jumlah);
        }
    }
}
