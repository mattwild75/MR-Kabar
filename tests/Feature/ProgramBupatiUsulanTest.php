<?php

namespace Tests\Feature;

use App\Models\IrsPd;
use App\Models\ProgramBupatiRisiko;
use App\Models\ProgramBupatiRisikoUsulan;
use App\Models\ProgramPembangunanBupati;
use App\Models\User;
use App\Notifications\ProgramBupatiUsulanReviewed;
use App\Notifications\ProgramBupatiUsulanSubmitted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Alur usulan-persetujuan kaitan risiko pada 100 Program Pembangunan Bupati.
 *
 * Halaman ini menghasilkan dokumen tingkat Pemda yang ikut dicetak untuk
 * Bupati, jadi PIC OPD hanya boleh MENGUSULKAN atas risiko dari registernya
 * sendiri; Admin dan Super Admin yang memutuskan. Yang diuji di sini adalah
 * batas-batas itu, bukan tampilannya.
 */
class ProgramBupatiUsulanTest extends TestCase
{
    use RefreshDatabase;

    private function buatPeran(): void
    {
        foreach (['admin', 'super-admin', 'user'] as $nama) {
            Role::findOrCreate($nama, 'web');
        }
    }

    private function pic(): User
    {
        $u = User::factory()->create();
        $u->assignRole('user');

        return $u;
    }

    private function admin(): User
    {
        $u = User::factory()->create();
        $u->assignRole('admin');

        return $u;
    }

    private function program(): ProgramPembangunanBupati
    {
        return ProgramPembangunanBupati::create([
            'nomor' => 1,
            'program_pembangunan' => 'Menyediakan Ambulan Gratis bagi Masyarakat',
            'branding' => 'Aceh Barat Sehat',
            'perangkat_daerah' => 'Dinas Kesehatan',
            'misi_urutan' => 1,
        ]);
    }

    /** Satu baris register risiko strategis SKPK milik $pemilik. */
    private function risiko(User $pemilik, string $uraian = 'Keterbatasan Anggaran Kesehatan'): IrsPd
    {
        return IrsPd::create([
            'user_id' => $pemilik->id,
            'SASARAN RENSTRA' => 'Meningkatnya derajat kesehatan masyarakat',
            'URAIAN RISIKO' => $uraian,
            'TINGKAT RISIKO' => 'Risiko Strategis OPD',
            'TAHUN DINILAI RISIKO' => '2025',
            'JENIS RISIKO' => '2 - Kesehatan',
            'ENTITAS PD YANG MENILAI' => 'Dinas Kesehatan',
        ]);
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->buatPeran();
        Notification::fake();
    }

    public function test_pic_mengusulkan_bukan_langsung_mengaitkan(): void
    {
        $pic = $this->pic();
        $program = $this->program();
        $risiko = $this->risiko($pic);

        $this->actingAs($pic)
            ->post(route('program-bupati-risiko.risiko.store', $program), [
                'risiko_tipe' => 'irs_pd',
                'risiko_id' => $risiko->id,
            ])
            ->assertRedirect();

        // Usulan tercatat, kaitannya BELUM berlaku.
        $this->assertDatabaseHas('program_bupati_risiko_usulan', [
            'program_pembangunan_bupati_id' => $program->id,
            'risiko_tipe' => 'irs_pd',
            'risiko_id' => $risiko->id,
            'aksi' => 'tambah',
            'user_id' => $pic->id,
            'status' => 'pending',
        ]);
        $this->assertDatabaseCount('program_bupati_risiko', 0);
    }

    public function test_pic_tidak_dapat_mengusulkan_risiko_opd_lain(): void
    {
        $pic = $this->pic();
        $picLain = $this->pic();
        $program = $this->program();
        $risikoOrangLain = $this->risiko($picLain);

        $this->actingAs($pic)
            ->post(route('program-bupati-risiko.risiko.store', $program), [
                'risiko_tipe' => 'irs_pd',
                'risiko_id' => $risikoOrangLain->id,
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('program_bupati_risiko_usulan', 0);
    }

    public function test_usulan_kembar_tidak_menggandakan_antrean_tinjauan(): void
    {
        $pic = $this->pic();
        $program = $this->program();
        $risiko = $this->risiko($pic);
        $muatan = ['risiko_tipe' => 'irs_pd', 'risiko_id' => $risiko->id];

        $this->actingAs($pic)->post(route('program-bupati-risiko.risiko.store', $program), $muatan);
        $this->actingAs($pic)->post(route('program-bupati-risiko.risiko.store', $program), $muatan);

        $this->assertDatabaseCount('program_bupati_risiko_usulan', 1);
    }

    public function test_admin_mengaitkan_langsung_tanpa_melewati_usulan(): void
    {
        $admin = $this->admin();
        $program = $this->program();
        $risiko = $this->risiko($admin);

        $this->actingAs($admin)
            ->post(route('program-bupati-risiko.risiko.store', $program), [
                'risiko_tipe' => 'irs_pd',
                'risiko_id' => $risiko->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseCount('program_bupati_risiko_usulan', 0);
        $this->assertDatabaseHas('program_bupati_risiko', [
            'program_pembangunan_bupati_id' => $program->id,
            'risiko_id' => $risiko->id,
        ]);
    }

    public function test_pic_tidak_dapat_melepas_kaitan_secara_langsung(): void
    {
        $pic = $this->pic();
        $program = $this->program();
        $risiko = $this->risiko($pic);
        $pivot = ProgramBupatiRisiko::create([
            'program_pembangunan_bupati_id' => $program->id,
            'risiko_tipe' => 'irs_pd',
            'risiko_id' => $risiko->id,
        ]);

        $this->actingAs($pic)
            ->delete(route('program-bupati-risiko.risiko.destroy', $pivot))
            ->assertRedirect();

        // Kaitannya masih ada; yang tercatat hanyalah usulan pelepasan.
        $this->assertDatabaseHas('program_bupati_risiko', ['id' => $pivot->id, 'deleted_at' => null]);
        $this->assertDatabaseHas('program_bupati_risiko_usulan', [
            'aksi' => 'lepas',
            'status' => 'pending',
            'user_id' => $pic->id,
        ]);
    }

    public function test_admin_menyetujui_usulan_lalu_kaitan_berlaku(): void
    {
        $pic = $this->pic();
        $admin = $this->admin();
        $program = $this->program();
        $risiko = $this->risiko($pic);

        $this->actingAs($pic)->post(route('program-bupati-risiko.risiko.store', $program), [
            'risiko_tipe' => 'irs_pd',
            'risiko_id' => $risiko->id,
        ]);
        $usulan = ProgramBupatiRisikoUsulan::firstOrFail();

        $this->actingAs($admin)
            ->post(route('program-bupati-risiko.usulan.setujui', $usulan))
            ->assertRedirect();

        $this->assertDatabaseHas('program_bupati_risiko', [
            'program_pembangunan_bupati_id' => $program->id,
            'risiko_id' => $risiko->id,
            'deleted_at' => null,
        ]);
        $usulan->refresh();
        $this->assertSame('approved', $usulan->status);
        $this->assertSame($admin->id, $usulan->reviewed_by);
        $this->assertNotNull($usulan->reviewed_at);
    }

    public function test_admin_menyetujui_usulan_pelepasan_lalu_kaitan_hilang(): void
    {
        $pic = $this->pic();
        $admin = $this->admin();
        $program = $this->program();
        $risiko = $this->risiko($pic);
        $pivot = ProgramBupatiRisiko::create([
            'program_pembangunan_bupati_id' => $program->id,
            'risiko_tipe' => 'irs_pd',
            'risiko_id' => $risiko->id,
        ]);

        $this->actingAs($pic)->delete(route('program-bupati-risiko.risiko.destroy', $pivot));
        $usulan = ProgramBupatiRisikoUsulan::firstOrFail();

        $this->actingAs($admin)->post(route('program-bupati-risiko.usulan.setujui', $usulan));

        $this->assertSoftDeleted('program_bupati_risiko', ['id' => $pivot->id]);
    }

    public function test_admin_menolak_usulan_beserta_alasannya(): void
    {
        $pic = $this->pic();
        $admin = $this->admin();
        $program = $this->program();
        $risiko = $this->risiko($pic);

        $this->actingAs($pic)->post(route('program-bupati-risiko.risiko.store', $program), [
            'risiko_tipe' => 'irs_pd',
            'risiko_id' => $risiko->id,
        ]);
        $usulan = ProgramBupatiRisikoUsulan::firstOrFail();

        $this->actingAs($admin)
            ->post(route('program-bupati-risiko.usulan.tolak', $usulan), [
                'rejection_reason' => 'Risiko yang sama sudah dikaitkan pada program nomor 3.',
            ])
            ->assertRedirect();

        $usulan->refresh();
        $this->assertSame('rejected', $usulan->status);
        $this->assertSame('Risiko yang sama sudah dikaitkan pada program nomor 3.', $usulan->rejection_reason);
        $this->assertDatabaseCount('program_bupati_risiko', 0);
    }

    public function test_pic_tidak_dapat_memutuskan_usulan(): void
    {
        $pic = $this->pic();
        $program = $this->program();
        $risiko = $this->risiko($pic);

        $this->actingAs($pic)->post(route('program-bupati-risiko.risiko.store', $program), [
            'risiko_tipe' => 'irs_pd',
            'risiko_id' => $risiko->id,
        ]);
        $usulan = ProgramBupatiRisikoUsulan::firstOrFail();

        $this->actingAs($pic)
            ->post(route('program-bupati-risiko.usulan.setujui', $usulan))
            ->assertForbidden();

        $this->assertSame('pending', $usulan->refresh()->status);
        $this->assertDatabaseCount('program_bupati_risiko', 0);
    }

    public function test_usulan_yang_sudah_diputuskan_tidak_dapat_diputuskan_ulang(): void
    {
        $pic = $this->pic();
        $admin = $this->admin();
        $program = $this->program();
        $risiko = $this->risiko($pic);

        $this->actingAs($pic)->post(route('program-bupati-risiko.risiko.store', $program), [
            'risiko_tipe' => 'irs_pd',
            'risiko_id' => $risiko->id,
        ]);
        $usulan = ProgramBupatiRisikoUsulan::firstOrFail();

        $this->actingAs($admin)->post(route('program-bupati-risiko.usulan.setujui', $usulan));
        $this->actingAs($admin)
            ->post(route('program-bupati-risiko.usulan.tolak', $usulan))
            ->assertStatus(422);

        $this->assertSame('approved', $usulan->refresh()->status);
    }

    public function test_admin_diberi_tahu_saat_diusulkan_dan_pengusul_saat_diputuskan(): void
    {
        $pic = $this->pic();
        $admin = $this->admin();
        $program = $this->program();
        $risiko = $this->risiko($pic);

        $this->actingAs($pic)->post(route('program-bupati-risiko.risiko.store', $program), [
            'risiko_tipe' => 'irs_pd',
            'risiko_id' => $risiko->id,
        ]);
        Notification::assertSentTo($admin, ProgramBupatiUsulanSubmitted::class);
        Notification::assertNotSentTo($pic, ProgramBupatiUsulanSubmitted::class);

        $usulan = ProgramBupatiRisikoUsulan::firstOrFail();
        $this->actingAs($admin)->post(route('program-bupati-risiko.usulan.setujui', $usulan));
        Notification::assertSentTo($pic, ProgramBupatiUsulanReviewed::class);
    }

    public function test_pic_hanya_melihat_usulannya_sendiri_admin_melihat_semua(): void
    {
        $picA = $this->pic();
        $picB = $this->pic();
        $admin = $this->admin();
        $program = $this->program();

        foreach ([$picA, $picB] as $i => $p) {
            $r = $this->risiko($p, "Risiko milik PIC ke-{$i}");
            $this->actingAs($p)->post(route('program-bupati-risiko.risiko.store', $program), [
                'risiko_tipe' => 'irs_pd',
                'risiko_id' => $r->id,
            ]);
        }

        $ambil = fn (User $u) => $this->actingAs($u)
            ->get(route('program-bupati-risiko.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('program-bupati-risiko/Index'))
            ->viewData('page')['props']['usulan'];

        // PIC hanya melihat usulannya sendiri; Admin melihat keduanya.
        $this->assertCount(1, $ambil($picA));
        $this->assertCount(2, $ambil($admin));
    }
}
