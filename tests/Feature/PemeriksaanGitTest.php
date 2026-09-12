<?php

namespace Tests\Feature;

use App\Models\SettingApp;
use App\Models\User;
use App\Services\PemeriksaanGitService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Process;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Pengaman Deploy/Pull/Push: kode di server harus persis sama dengan
 * GitHub. Semua perintah git dipalsukan supaya pengujian tidak menyentuh
 * repo sungguhan.
 */
class PemeriksaanGitTest extends TestCase
{
    use RefreshDatabase;

    private function superAdmin(): User
    {
        foreach (['admin', 'super-admin', 'user'] as $nama) {
            Role::findOrCreate($nama, 'web');
        }
        $u = User::factory()->create();
        $u->assignRole('super-admin');
        SettingApp::create(['nama_app' => 'MR Kabar', 'git_sync_enabled' => true]);
        SettingApp::clearCached();

        return $u;
    }

    private function perintah(object $p): string
    {
        return is_array($p->command) ? implode(' ', $p->command) : (string) $p->command;
    }

    /** Palsukan git: status bersih, remote sama persis kecuali $ubah. Pola memakai * di antara argumen karena Symfony mengutip argumen berbeda di Windows (") dan Linux ('). */
    private function palsukanGit(array $ubah = []): void
    {
        $jawab = array_merge([
            '*remote*get-url*origin*' => 'https://github.com/mattwild75/MR-Kabar.git',
            '*rev-parse*--abbrev-ref*HEAD*' => 'main',
            '*rev-parse*--short*HEAD*' => 'abc1234',
            '*status*--porcelain*' => '',
            '*fetch*--quiet*origin*main*' => '',
            '*rev-parse*--short*origin/main*' => 'abc1234',
            '*rev-list*--left-right*--count*HEAD...origin/main*' => "0\t0",
            '*merge-base*--is-ancestor*HEAD*origin/main*' => '',
            '*diff*--name-only*HEAD*origin/main*' => '',
        ], $ubah);

        $peta = [];
        foreach ($jawab as $pola => $isi) {
            $peta[$pola] = is_string($isi) ? Process::result($isi) : $isi;
        }
        $peta['*'] = Process::result('');
        Process::fake($peta);
        // CI GitHub dipalsukan lulus, kecuali pengujian menimpanya sendiri.
        Http::fake(['api.github.com/*' => Http::response(['check_runs' => [['status' => 'completed', 'conclusion' => 'success', 'html_url' => 'https://github.com/x']]])]);
    }

    public function test_ci_gagal_pada_commit_github_menjadi_halangan(): void
    {
        // Stub Http yang terdaftar lebih dulu yang menang, jadi dipasang sebelum palsukanGit().
        Http::fake(['api.github.com/*' => Http::response(['check_runs' => [['status' => 'completed', 'conclusion' => 'failure', 'html_url' => 'https://github.com/x']]])]);
        $this->palsukanGit(['*rev-parse*origin/main*' => 'abc1234abc1234abc1234abc1234abc1234abc12']);
        Cache::flush();
        $hasil = app(PemeriksaanGitService::class)->periksa();

        $this->assertSame('failure', $hasil['ci']['kesimpulan']);
        $this->assertStringContainsString('CI', $hasil['halangan'][0]);
    }

    public function test_repo_bersih_dan_sama_tidak_ada_halangan(): void
    {
        $this->palsukanGit();
        $hasil = app(PemeriksaanGitService::class)->periksa();

        $this->assertSame([], $hasil['halangan']);
        $this->assertSame('abc1234', $hasil['lokal']);
        $this->assertSame(0, $hasil['di_belakang']);
    }

    public function test_berkas_berubah_di_server_menjadi_halangan(): void
    {
        $this->palsukanGit(['*status*--porcelain*' => " M app/Http/Kernel.php\n?? catatan.txt"]);
        $hasil = app(PemeriksaanGitService::class)->periksa();

        $this->assertCount(1, $hasil['halangan']);
        $this->assertStringContainsString('2 berkas', $hasil['halangan'][0]);
        $this->assertCount(2, $hasil['berubah']);
        $this->assertStringContainsString('catatan.txt', $hasil['berubah'][1]);
    }

    public function test_commit_lokal_yang_tidak_ada_di_github_menjadi_halangan(): void
    {
        $this->palsukanGit([
            '*rev-list*--left-right*--count*HEAD...origin/main*' => "3\t5",
            '*merge-base*--is-ancestor*HEAD*origin/main*' => Process::result('', '', 1),
        ]);
        $hasil = app(PemeriksaanGitService::class)->periksa();

        $this->assertSame(3, $hasil['di_depan']);
        $this->assertSame(5, $hasil['di_belakang']);
        $this->assertStringContainsString('3 commit di server ini tidak ada di GitHub', $hasil['halangan'][0]);
    }

    public function test_github_tidak_terjangkau_menjadi_halangan(): void
    {
        $this->palsukanGit(['*fetch*--quiet*origin*main*' => Process::result('', 'Could not resolve host: github.com', 128)]);
        $hasil = app(PemeriksaanGitService::class)->periksa();

        $this->assertStringContainsString('tidak terjangkau', $hasil['halangan'][0]);
    }

    public function test_pembaruan_masuk_dihitung_migrasi_dan_lock(): void
    {
        $this->palsukanGit([
            '*rev-parse*--short*origin/main*' => 'def5678',
            '*rev-list*--left-right*--count*HEAD...origin/main*' => "0\t2",
            '*diff*--name-only*HEAD*origin/main*' => "database/migrations/2026_10_01_000000_x.php\ncomposer.lock\napp/A.php",
        ]);
        $hasil = app(PemeriksaanGitService::class)->periksa();

        $this->assertSame([], $hasil['halangan']);
        $this->assertSame(1, $hasil['migrasi_masuk']);
        $this->assertSame(['composer.lock'], $hasil['lock_berubah']);
    }

    public function test_deploy_ditolak_bila_ada_halangan_dan_tidak_menjalankan_apa_pun(): void
    {
        $this->palsukanGit(['*status*--porcelain*' => ' M app/A.php']);

        $this->actingAs($this->superAdmin())
            ->from('/backup')
            ->post('/backup/git-pull')
            ->assertRedirect('/backup')
            ->assertSessionHas('error');

        Process::assertNotRan(fn ($p) => str_contains($this->perintah($p), ' pull ') || str_contains($this->perintah($p), 'deploy-mrkabar'));
        $this->assertFalse(Cache::get('deploy_terakhir')['sukses']);
        $this->assertStringContainsString('DEPLOY DITOLAK', Cache::get('deploy_terakhir')['log']);
    }

    public function test_push_ditolak_bila_github_lebih_maju(): void
    {
        $this->palsukanGit(['*rev-list*--left-right*--count*HEAD...origin/main*' => "0\t4"]);

        $this->actingAs($this->superAdmin())
            ->from('/backup')
            ->post('/backup/git-push', ['message' => 'x'])
            ->assertRedirect('/backup')
            ->assertSessionHas('error');

        Process::assertNotRan(fn ($p) => str_contains($this->perintah($p), ' push '));
    }

    public function test_endpoint_periksa_hanya_super_admin(): void
    {
        $this->palsukanGit();
        foreach (['admin', 'super-admin', 'user'] as $nama) {
            Role::findOrCreate($nama, 'web');
        }
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        SettingApp::create(['nama_app' => 'MR Kabar', 'git_sync_enabled' => true]);
        SettingApp::clearCached();

        $this->actingAs($admin)->get('/backup/git-periksa')->assertForbidden();
    }
}
