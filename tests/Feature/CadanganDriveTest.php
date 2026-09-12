<?php

namespace Tests\Feature;

use App\Models\CadanganDrive;
use App\Models\User;
use App\Services\CadanganDriveService;
use App\Services\CadanganService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use ZipArchive;

/**
 * Cadangan ke Google Drive: penjaga akses, alur OAuth, dan lima panggilan
 * Drive — semuanya dengan Google dipalsukan lewat Http::fake, karena tes
 * tidak boleh menyentuh akun Google sungguhan.
 */
class CadanganDriveTest extends TestCase
{
    use RefreshDatabase;

    private function superAdmin(): User
    {
        foreach (['admin', 'super-admin', 'user'] as $nama) {
            Role::findOrCreate($nama, 'web');
        }
        $u = User::factory()->create();
        $u->assignRole('super-admin');

        return $u;
    }

    private function tertaut(): CadanganDrive
    {
        $p = CadanganDrive::tunggal();
        $p->forceFill([
            'client_id' => 'id-uji.apps.googleusercontent.com',
            'client_secret' => 'rahasia-uji',
            'refresh_token' => 'refresh-uji',
            'akun_email' => 'inspektorat@example.com',
            'folder_id' => 'folder123',
            'tautan_pada' => now(),
        ])->save();

        return $p;
    }

    public function test_bukan_super_admin_ditolak_di_semua_pintu(): void
    {
        Role::findOrCreate('admin', 'web');
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)->post('/backup/drive/kredensial', [])->assertForbidden();
        $this->actingAs($admin)->get('/backup/drive/tautkan')->assertForbidden();
        $this->actingAs($admin)->post('/backup/drive/unggah')->assertForbidden();
        $this->actingAs($admin)->post('/backup/drive/abcdefghijkl/pulihkan', ['konfirmasi' => 'TIMPA'])->assertForbidden();
        $this->actingAs($admin)->delete('/backup/drive/abcdefghijkl')->assertForbidden();
    }

    public function test_client_secret_dan_refresh_token_tersimpan_terenkripsi(): void
    {
        $this->actingAs($this->superAdmin())->post('/backup/drive/kredensial', [
            'client_id' => 'id-uji',
            'client_secret' => 'rahasia-uji',
            'folder_nama' => 'Cadangan MR Kabar',
            'unggah_otomatis' => true,
            'simpan_terakhir' => 30,
        ])->assertRedirect()->assertSessionHas('success');

        $mentah = \DB::table('cadangan_drive')->first();
        $this->assertNotSame('rahasia-uji', $mentah->client_secret);
        $this->assertStringNotContainsString('rahasia-uji', $mentah->client_secret);
        $this->assertSame('rahasia-uji', CadanganDrive::tunggal()->client_secret);
    }

    public function test_mengganti_client_id_melupakan_tautan_lama(): void
    {
        $this->tertaut();

        $this->actingAs($this->superAdmin())->post('/backup/drive/kredensial', [
            'client_id' => 'id-lain',
            'client_secret' => 'rahasia-lain',
            'folder_nama' => 'Cadangan MR Kabar',
            'unggah_otomatis' => true,
            'simpan_terakhir' => 30,
        ])->assertRedirect();

        $this->assertFalse(CadanganDrive::tunggal()->tertaut());
    }

    public function test_tautkan_mengarahkan_ke_google_dengan_cakupan_drive_file_saja(): void
    {
        CadanganDrive::tunggal()->forceFill(['client_id' => 'id-uji', 'client_secret' => 'rahasia'])->save();

        $jawab = $this->actingAs($this->superAdmin())->get('/backup/drive/tautkan');

        $jawab->assertRedirect();
        $tujuan = $jawab->headers->get('Location');
        $this->assertStringStartsWith('https://accounts.google.com/o/oauth2/v2/auth?', $tujuan);
        $this->assertStringContainsString('drive.file', $tujuan);
        $this->assertStringNotContainsString('auth%2Fdrive+', $tujuan, 'cakupan drive penuh tidak boleh diminta');
        $this->assertStringContainsString('access_type=offline', $tujuan);
        $this->assertStringContainsString(urlencode(route('backup.drive.callback')), $tujuan);
    }

    public function test_callback_dengan_state_salah_ditolak(): void
    {
        CadanganDrive::tunggal()->forceFill(['client_id' => 'id-uji', 'client_secret' => 'rahasia'])->save();
        Http::fake();

        $this->actingAs($this->superAdmin())
            ->withSession(['drive_oauth_state' => 'benar'])
            ->get('/backup/drive/callback?state=salah&code=xyz')
            ->assertRedirect(route('backup.index'))
            ->assertSessionHas('error');

        Http::assertNothingSent();
        $this->assertFalse(CadanganDrive::tunggal()->tertaut());
    }

    public function test_callback_menyimpan_refresh_token_email_dan_folder(): void
    {
        CadanganDrive::tunggal()->forceFill(['client_id' => 'id-uji', 'client_secret' => 'rahasia'])->save();

        Http::fake([
            'oauth2.googleapis.com/token' => Http::response(['access_token' => 'akses', 'refresh_token' => 'refresh-baru']),
            'www.googleapis.com/oauth2/v3/userinfo' => Http::response(['email' => 'inspektorat@example.com']),
            'www.googleapis.com/drive/v3/files?*' => Http::response(['files' => []]),
            'www.googleapis.com/drive/v3/files' => Http::response(['id' => 'folderBaru']),
        ]);

        $this->actingAs($this->superAdmin())
            ->withSession(['drive_oauth_state' => 'st'])
            ->get('/backup/drive/callback?state=st&code=kode')
            ->assertRedirect(route('backup.index'))
            ->assertSessionHas('success');

        $p = CadanganDrive::tunggal();
        $this->assertTrue($p->tertaut());
        $this->assertSame('refresh-baru', $p->refresh_token);
        $this->assertSame('inspektorat@example.com', $p->akun_email);
        $this->assertSame('folderBaru', $p->folder_id);
    }

    public function test_halaman_backup_tetap_terbuka_saat_drive_tidak_terjangkau(): void
    {
        $this->tertaut();
        Http::fake(fn () => Http::response(['error' => 'invalid_grant', 'error_description' => 'Token has been revoked'], 400));

        $this->actingAs($this->superAdmin())
            ->get('/backup')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('drive.tertaut', true)
                ->where('drive.berkas', null)
                ->where('drive.galat', fn ($g) => str_contains($g, 'Token has been revoked')));
    }

    public function test_unggah_memakai_unggahan_dapat_dilanjutkan_lalu_memangkas(): void
    {
        $this->tertaut();
        $p = CadanganDrive::tunggal();
        $p->forceFill(['simpan_terakhir' => 2])->save();

        Http::fake([
            'oauth2.googleapis.com/token' => Http::response(['access_token' => 'akses']),
            'www.googleapis.com/drive/v3/files/folder123?*' => Http::response(['id' => 'folder123', 'trashed' => false]),
            'www.googleapis.com/upload/drive/v3/files?uploadType=resumable' => Http::response('', 200, ['Location' => 'https://www.googleapis.com/upload/sesi-1']),
            'www.googleapis.com/upload/sesi-1' => Http::response(['id' => 'berkasBaru']),
            'www.googleapis.com/drive/v3/files?*' => Http::response(['files' => [
                ['id' => 'b1', 'name' => 'baru', 'size' => '10', 'createdTime' => '2026-09-12T01:30:00Z'],
                ['id' => 'b2', 'name' => 'kemarin', 'size' => '10', 'createdTime' => '2026-09-11T01:30:00Z'],
                ['id' => 'b3', 'name' => 'lusa-lalu', 'size' => '10', 'createdTime' => '2026-09-10T01:30:00Z'],
            ]]),
            'www.googleapis.com/drive/v3/files/b3' => Http::response('', 204),
        ]);

        $sementara = storage_path('framework/testing/cadangan-uji.zip');
        File::ensureDirectoryExists(dirname($sementara));
        File::put($sementara, 'isi');

        $drive = app(CadanganDriveService::class);
        $this->assertSame('berkasBaru', $drive->unggah($sementara, 'uji.zip'));
        $this->assertSame(1, $drive->pangkas(2));

        Http::assertSent(fn ($r) => $r->method() === 'PUT' && $r->url() === 'https://www.googleapis.com/upload/sesi-1' && $r->body() === 'isi');
        Http::assertSent(fn ($r) => $r->method() === 'DELETE' && str_ends_with($r->url(), '/files/b3'));
        Http::assertNotSent(fn ($r) => $r->method() === 'DELETE' && (str_ends_with($r->url(), '/files/b1') || str_ends_with($r->url(), '/files/b2')));

        File::delete($sementara);
    }

    public function test_pulihkan_menolak_tanpa_ketikan_timpa(): void
    {
        $this->tertaut();
        Http::fake();

        $this->actingAs($this->superAdmin())
            ->post('/backup/drive/abcdefghijkl/pulihkan', ['konfirmasi' => 'ya'])
            ->assertSessionHasErrors('konfirmasi');

        Http::assertNothingSent();
    }

    public function test_zip_terkunci_hanya_terbaca_dengan_sandi_arsip(): void
    {
        $zipPath = storage_path('framework/testing/terkunci-uji.zip');
        File::ensureDirectoryExists(dirname($zipPath));
        File::delete($zipPath);

        $zip = new ZipArchive;
        $this->assertTrue($zip->open($zipPath, ZipArchive::CREATE));
        $zip->setPassword('sandi-uji');
        $zip->addFromString('db-dumps/mysql-uji.sql', "SELECT 1;\n");
        $zip->setEncryptionName('db-dumps/mysql-uji.sql', ZipArchive::EM_AES_256);
        $zip->close();

        config(['backup.backup.password' => 'sandi-uji']);
        $this->assertSame("SELECT 1;\n", app(CadanganService::class)->sqlDariZip($zipPath));

        config(['backup.backup.password' => 'sandi-salah']);
        $this->expectException(\RuntimeException::class);
        try {
            app(CadanganService::class)->sqlDariZip($zipPath);
        } finally {
            File::delete($zipPath);
        }
    }

    public function test_perintah_terjadwal_diam_bila_belum_tertaut(): void
    {
        Http::fake();

        $this->artisan('cadangan:drive')->assertSuccessful();

        Http::assertNothingSent();
    }
}
