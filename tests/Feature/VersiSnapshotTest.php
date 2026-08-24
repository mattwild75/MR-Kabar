<?php

namespace Tests\Feature;

use App\Http\Controllers\BackupController;
use App\Models\User;
use App\Services\VersiSnapshotService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
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

    /**
     * Satu-satunya nama versi yang dipakai pengujian ini. Dipusatkan supaya
     * pembersihan di tearDown() tidak mungkin meleset dari yang dibuat, dan
     * angkanya sengaja jauh di atas versi sungguhan agar tidak pernah bentrok.
     */
    private const TAG_UJI = 'v9.9.9';

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

        // Nilai balik open() WAJIB diperiksa. Kalau tidak, kegagalannya baru
        // muncul satu baris kemudian sebagai "ValueError: Invalid or
        // uninitialized Zip object" dari addFromString — pesan yang sama
        // sekali tidak menunjuk ke sebabnya, dan membuat empat uji ini tampak
        // rusak acak.
        //
        // Kenapa bisa gagal: berkasnya nyata di disk, dan di Windows sebuah
        // berkas bisa terkunci sesaat oleh pemindai virus atau proses lain
        // yang sedang menyibukkan disk. Terpantau dua kali dari sepuluh
        // putaran, keduanya persis ketika mesin sedang penuh oleh render
        // video. Percobaan ulangnya dipertahankan sekalipun foldernya kini
        // sementara — penyebabnya bukan folder mana yang dipakai.
        $zip = new ZipArchive;
        $dibuka = false;
        for ($percobaan = 1; $percobaan <= 5; $percobaan++) {
            $dibuka = $zip->open($berkas, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true;
            if ($dibuka) {
                break;
            }
            usleep(200_000);
        }
        $this->assertTrue($dibuka, "Gagal membuka arsip uji setelah 5 percobaan: {$berkas}");

        $zip->addFromString('db-dumps/mysql-mrkabar.sql', $isiSql);
        $this->assertTrue($zip->close(), "Gagal menutup arsip uji: {$berkas}");

        File::put($layanan->folder().'/manifest.json', json_encode([[
            'tag' => $tag,
            'commit' => str_repeat('a', 40),
            'dibuat' => '2026-07-31 08:00:00',
            'berkas' => $tag.'.zip',
            'ukuran' => File::size($berkas),
            'sidik_jari' => hash_file('sha256', $berkas),
            'migrasi_terakhir' => '2026_07_29_160000_create_program_bupati_risiko_usulan_table',
            'jumlah_migrasi' => 95,
            'cacah_tabel' => ['users' => 3],
            'catatan' => 'snapshot uji',
        ]]));

        return $berkas;
    }

    /** Folder versi khusus pengujian, dibuang utuh sesudahnya. */
    private string $folderUji = '';

    /**
     * Pengujian ini TIDAK BOLEH menyentuh folder versi yang sesungguhnya.
     *
     * Sebelumnya ia memang menyentuhnya, dan dijinakkan dengan cara menyimpan
     * manifes asli lalu mengembalikannya di tearDown. Itu bekerja selama
     * segalanya berjalan mulus, tetapi menyisakan dua persoalan yang keduanya
     * benar-benar muncul:
     *
     * 1. Rangkaian uji sesekali gagal tanpa sebab yang jelas — terpantau dua
     *    kali, keduanya pada berkas ini. Sebabnya berkas yang sama diperebutkan
     *    ketika ada dua jalan uji beririsan.
     * 2. Kalau satu jalan uji terhenti di tengah, manifes sungguhan tertinggal
     *    dalam keadaan tertulis separuh — dan isinya catatan snapshot database
     *    milik pengguna, bukan data uji.
     *
     * Layanannya sendiri tidak diubah. Yang diganti hanya jawaban folder()
     * lewat subkelas yang diikat ke container, sehingga BackupController yang
     * menerimanya lewat injeksi konstruktor ikut memakai folder sementara ini.
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->sapuSisaLama();

        $this->folderUji = storage_path('framework/testing/versi-'.bin2hex(random_bytes(6)));
        File::ensureDirectoryExists($this->folderUji);

        $folder = $this->folderUji;
        $this->app->bind(VersiSnapshotService::class, fn () => new class($folder) extends VersiSnapshotService
        {
            public function __construct(private readonly string $folderUji) {}

            public function folder(): string
            {
                return $this->folderUji;
            }
        });
    }

    protected function tearDown(): void
    {
        // Aman menghapus seluruhnya: folder ini milik pengujian sendiri.
        // Versi awal berkas ini menghapus folder versi SUNGGUHAN, dan itu
        // benar-benar memusnahkan snapshot v1.0.3 milik pengguna.
        //
        // Dicoba ulang karena penghapusannya bisa gagal di Windows: berkas zip
        // yang baru ditutup masih terkunci sesaat, sama seperti yang membuat
        // pembukaan arsip sesekali gagal di berkas ini.
        //
        // Catatan jujur: penelusuran dengan jejak sementara TIDAK pernah
        // menangkap kegagalan yang sungguhan — lima belas hapus, lima belas
        // berhasil pada percobaan pertama. Pengulangan ini dipertahankan
        // sebagai jaminan yang murah, bukan sebagai perbaikan atas kegagalan
        // yang terbukti terjadi di sini.
        if ($this->folderUji !== '' && File::isDirectory($this->folderUji)) {
            for ($percobaan = 1; $percobaan <= 5; $percobaan++) {
                if (File::deleteDirectory($this->folderUji)) {
                    break;
                }
                usleep(200_000);
            }
        }

        parent::tearDown();
    }

    /**
     * Penyapu terakhir, dijalankan sekali sesudah SELURUH kelas selesai.
     *
     * Penghapusan per-uji saja ternyata belum cukup: dari empat putaran penuh,
     * satu folder tertinggal tiap putaran, selalu dalam keadaan kosong. Diuji
     * satu per satu tidak ada yang bocor, jadi kebocorannya hanya muncul pada
     * uji terakhir kelas ini — yang sesudahnya memang tidak ada setUp lagi
     * untuk menyapunya.
     *
     * SEBABNYA SUDAH DITELUSURI dan bukan pada kode ini. Dengan jejak
     * sementara yang mencatat tiap pembuatan dan penghapusan, satu putaran
     * penuh menghasilkan 15 buat dan 15 hapus yang seluruhnya berhasil, dengan
     * is_dir() langsung sesudahnya bernilai false, dan nol folder tersisa.
     * Folder yang sempat tertinggal muncul justru ketika DUA putaran rangkaian
     * uji berjalan bertumpang tindih — keadaan yang memang terjadi saat
     * pengembangan, bukan saat dipakai biasa.
     *
     * Penyapu ini tetap dipertahankan: ia murah, dan ia tetap membereskan
     * putaran yang terhenti di tengah.
     *
     * BATASNYA, dan ini konsekuensi langsung dari temuan di atas: penyapu ini
     * menghapus SELURUH folder versi-*, termasuk milik proses lain. Selama
     * rangkaian uji dijalankan satu per satu — sebagaimana biasanya — tidak
     * ada proses lain yang memakai folder bernama sama, dan penyapuan ini
     * aman. Menjalankan dua putaran sekaligus bukan hanya meninggalkan sisa,
     * melainkan bisa membuat satu putaran menghapus folder kerja putaran yang
     * lain. Jangan jalankan rangkaian uji ini bertumpang tindih.
     */
    public static function tearDownAfterClass(): void
    {
        $induk = storage_path('framework/testing');

        if (is_dir($induk)) {
            foreach (glob($induk.'/versi-*', GLOB_ONLYDIR) ?: [] as $folder) {
                File::deleteDirectory($folder);
            }
        }

        parent::tearDownAfterClass();
    }

    /** Buang folder uji milik putaran yang pernah terhenti di tengah. */
    private function sapuSisaLama(): void
    {
        $induk = storage_path('framework/testing');
        if (! File::isDirectory($induk)) {
            return;
        }

        foreach (File::directories($induk) as $folder) {
            if (! str_starts_with(basename($folder), 'versi-')) {
                continue;
            }
            if (File::lastModified($folder) < now()->subHour()->getTimestamp()) {
                File::deleteDirectory($folder);
            }
        }
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
        $this->palsukanSnapshot(self::TAG_UJI);

        $this->actingAs($this->admin())
            ->get('/backup/versi/v9.9.9/unduh')
            ->assertForbidden();
    }

    public function test_admin_biasa_tidak_dapat_memulihkan_database_dari_snapshot_versi(): void
    {
        $this->palsukanSnapshot(self::TAG_UJI);

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
        $tagAda = app(BackupController::class);
        $adaTag = (new \ReflectionClass($tagAda))->getMethod('listGitTags');
        $adaTag->setAccessible(true);
        $daftar = $adaTag->invoke($tagAda);

        if (empty($daftar)) {
            $this->markTestSkipped('Repository ini belum punya tag, tidak ada yang bisa ditabrakkan.');
        }

        $this->actingAs($this->superAdmin())
            ->post('/backup/versi', ['tag' => $daftar[0]])
            ->assertRedirect()
            ->assertSessionHas('error', fn ($pesan) => str_contains($pesan, 'sudah ada'));
    }

    // --- penjaga pemulihan ----------------------------------------------

    public function test_pemulihan_ditolak_bila_konfirmasi_tidak_sama_dengan_nama_versi(): void
    {
        $this->palsukanSnapshot(self::TAG_UJI);

        $this->actingAs($this->superAdmin())
            ->post('/backup/versi/v9.9.9/pulihkan', ['konfirmasi' => 'v9.9.8'])
            ->assertRedirect()
            ->assertSessionHas('error', fn ($pesan) => str_contains($pesan, 'Konfirmasi tidak cocok'));

        // Database harus utuh: snapshot palsu di atas hanya berisi "SELECT 1",
        // jadi kalau sempat dijalankan, tabel users akan hilang.
        $this->assertTrue(Schema::hasTable('users'));
    }

    public function test_pemulihan_ditolak_bila_berkas_snapshot_berubah_sejak_direkam(): void
    {
        $berkas = $this->palsukanSnapshot(self::TAG_UJI);

        // Rusak berkasnya tanpa memperbarui manifes — persis yang terjadi kalau
        // seseorang menimpanya lewat Explorer.
        File::put($berkas, 'bukan zip sama sekali');

        $this->assertFalse($this->layanan()->snapshotUtuh(self::TAG_UJI));

        $this->actingAs($this->superAdmin())
            ->post('/backup/versi/v9.9.9/pulihkan', ['konfirmasi' => 'v9.9.9'])
            ->assertRedirect()
            ->assertSessionHas('error', fn ($pesan) => str_contains($pesan, 'rusak'));

        $this->assertTrue(Schema::hasTable('users'));
    }

    public function test_pemulihan_versi_tanpa_snapshot_ditolak(): void
    {
        $this->actingAs($this->superAdmin())
            ->post('/backup/versi/v9.9.9/pulihkan', ['konfirmasi' => 'v9.9.9'])
            ->assertRedirect()
            ->assertSessionHas('error', fn ($pesan) => str_contains($pesan, 'tidak ditemukan'));
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
        File::put($layanan->folder().'/manifest.json', '{ ini bukan json }');

        $this->assertSame([], $layanan->manifes());

        $this->actingAs($this->superAdmin())
            ->get('/backup')
            ->assertOk();
    }

    public function test_versi_yang_berkas_snapshotnya_terhapus_tidak_lagi_diakui_ada(): void
    {
        $berkas = $this->palsukanSnapshot(self::TAG_UJI);
        $layanan = $this->layanan();

        $this->assertTrue($layanan->snapshotAda(self::TAG_UJI));

        File::delete($berkas);

        // Manifes masih menyebutnya, tapi berkasnya sudah tidak ada — keadaan
        // ini harus terbaca sebagai "tidak ada", bukan "ada".
        $this->assertNotNull($layanan->catatan(self::TAG_UJI));
        $this->assertFalse($layanan->snapshotAda(self::TAG_UJI));
        $this->assertFalse($layanan->snapshotUtuh(self::TAG_UJI));
    }

    public function test_selisih_migrasi_terbaca_ketika_skema_lebih_maju_daripada_versi(): void
    {
        $this->palsukanSnapshot(self::TAG_UJI);

        $selisih = $this->layanan()->selisihMigrasi(self::TAG_UJI);

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
                Schema::hasTable($tabel),
                "tabel $tabel dicacah padahal tidak ada"
            );
            $this->assertIsInt($jumlah);
        }
    }
}
