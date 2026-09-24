<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Graphify\GraphifyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/** Utilities > Graphify: peta pengetahuan seluruh aplikasi, khusus admin dan super-admin. */
class GraphifyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    private function penggunaDenganPeran(string $peran): User
    {
        Role::findOrCreate($peran, 'web');
        $u = User::factory()->create();
        $u->assignRole($peran);

        return $u;
    }

    public function test_admin_dan_super_admin_dapat_membuka_graphify(): void
    {
        foreach (['admin', 'super-admin'] as $peran) {
            $u = $this->penggunaDenganPeran($peran);
            $this->actingAs($u)->get('/graphify')->assertOk()->assertInertia(fn ($page) => $page
                ->component('graphify/Index')
                ->where('meta.simpul', fn ($n) => $n > 100)
                ->has('jenis'));
        }
    }

    public function test_peran_lain_ditolak(): void
    {
        foreach (['eksekutif', 'user', 'apip', 'admin-inspektorat'] as $peran) {
            $u = $this->penggunaDenganPeran($peran);
            $this->actingAs($u)->get('/graphify')->assertForbidden();
            $this->actingAs($u)->getJson('/graphify/data')->assertForbidden();
            // Peninjau (eksekutif) sudah dihentikan ViewerReadOnly (302) sebelum controller.
            $r = $this->actingAs($u)->post('/graphify/bangun');
            $this->assertContains($r->status(), [302, 403]);
            $r->assertSessionMissing('success');
            $this->actingAs($u)->get('/graphify/unduh/json')->assertForbidden();
        }
        $this->app['auth']->forgetGuards();
        $this->get('/graphify')->assertRedirect();
    }

    public function test_peta_memuat_seluruh_lapisan_aplikasi(): void
    {
        $meta = app(GraphifyService::class)->bangun();
        $g = app(GraphifyService::class)->graf();
        $this->assertSame($meta['simpul'], count($g['nodes']));

        $jenis = array_count_values(array_column($g['nodes'], 'type'));
        foreach (['rute', 'controller', 'model', 'tabel', 'layanan', 'halaman', 'komponen', 'perintah', 'dokumen', 'regulasi', 'konsep'] as $j) {
            $this->assertArrayHasKey($j, $jenis, "jenis {$j} tidak ada di peta");
        }
        $byId = array_column($g['nodes'], null, 'id');
        $rel = fn (string $a, string $b) => array_values(array_filter($g['links'], fn ($l) => $l['source'] === $a && $l['target'] === $b));

        // Rute → controller, controller → halaman, model → tabel, regulasi → konsep.
        $this->assertNotEmpty($rel('rute:GET /graphify', 'kelas:App\Http\Controllers\GraphifyController'));
        $this->assertNotEmpty($rel('kelas:App\Http\Controllers\GraphifyController', 'halaman:graphify/Index'));
        $this->assertNotEmpty($rel('kelas:App\Models\RppPenugasan', 'tabel:rpp_penugasan'));
        $this->assertNotEmpty($rel('reg:permenpan-19-2009', 'konsep:kendali-mutu'));
        $this->assertStringContainsString('Kendali Mutu', $byId['kelas:App\Http\Controllers\Erpika\KendaliMutuController']['desc']);

        // Semua relasi menunjuk simpul yang ada; tidak ada data pengguna.
        foreach ($g['links'] as $l) {
            $this->assertArrayHasKey($l['source'], $byId);
            $this->assertArrayHasKey($l['target'], $byId);
        }
        $this->assertEmpty(array_filter(array_keys($byId), fn ($id) => str_starts_with($id, 'user:')));
        $this->assertNotEmpty($g['communities']);
        $this->assertStringContainsString('# Laporan Graphify', app(GraphifyService::class)->laporan());
    }

    public function test_bangun_ulang_dan_unduh(): void
    {
        $u = $this->penggunaDenganPeran('admin');
        $this->actingAs($u)->post('/graphify/bangun')->assertRedirect()->assertSessionHas('success');
        $this->actingAs($u)->getJson('/graphify/data')->assertOk()->assertJsonStructure(['nodes', 'links', 'communities', 'temuan', 'meta']);
        $this->actingAs($u)->get('/graphify/unduh/json')->assertOk()->assertDownload('graphify-mrkabar-graph.json');
        $this->actingAs($u)->get('/graphify/unduh/laporan')->assertOk()->assertDownload('graphify-mrkabar-laporan.md');
        $this->actingAs($u)->get('/graphify/unduh/lain')->assertNotFound();
    }
}
