<?php

namespace Tests\Feature;

use App\Models\IrsPd;
use App\Models\Menu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/** Pencarian global mengembalikan hasil yang disekat sama seperti halamannya. */
class PencarianGlobalTest extends TestCase
{
    use RefreshDatabase;

    public function test_pic_hanya_menemukan_risiko_miliknya_dan_tidak_melihat_pengguna(): void
    {
        foreach (['admin', 'super-admin', 'user'] as $nama) {
            Role::findOrCreate($nama, 'web');
        }
        $pic = User::factory()->create(['name' => 'PIC Dinas']);
        $lain = User::factory()->create(['name' => 'PIC Lain']);
        IrsPd::create(['user_id' => $pic->id, 'URAIAN RISIKO' => 'Keterlambatan penyaluran DAK fisik', 'NOMOR URUT RISIKO' => 'R-01', 'TAHUN DINILAI RISIKO' => '2026']);
        IrsPd::create(['user_id' => $lain->id, 'URAIAN RISIKO' => 'Keterlambatan pembayaran gaji', 'NOMOR URUT RISIKO' => 'R-02', 'TAHUN DINILAI RISIKO' => '2026']);
        Menu::create(['title' => 'Dashboard', 'route' => '/dashboard', 'icon' => 'LayoutGrid', 'order' => 1]);

        $hasil = $this->actingAs($pic)->getJson('/pencarian?q=keterlambatan')->assertOk()->json('kelompok');
        $risiko = collect($hasil)->firstWhere('judul', 'Risiko');
        $this->assertCount(1, $risiko['butir']);
        $this->assertStringContainsString('DAK fisik', $risiko['butir'][0]['judul']);
        $this->assertStringContainsString('highlight_id=', $risiko['butir'][0]['url']);
        $this->assertNull(collect($hasil)->firstWhere('judul', 'Pengguna'));

        $admin = User::factory()->create();
        $admin->assignRole('super-admin');
        $hasilAdmin = $this->actingAs($admin)->getJson('/pencarian?q=keterlambatan')->assertOk()->json('kelompok');
        $this->assertCount(2, collect($hasilAdmin)->firstWhere('judul', 'Risiko')['butir']);
        $this->assertNotNull(collect($this->actingAs($admin)->getJson('/pencarian?q=PIC')->json('kelompok'))->firstWhere('judul', 'Pengguna'));

        $this->assertSame([], $this->actingAs($pic)->getJson('/pencarian?q=k')->json('kelompok'));
    }
}
