<?php

namespace Tests\Feature;

use App\Models\LaporanKejadianRisiko;
use App\Models\Opd;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/** Bukti opsional pada laporan kejadian risiko: melekat pada laporan, hanya penindaklanjut yang bisa mengunduh. */
class LaporKejadianBuktiTest extends TestCase
{
    use RefreshDatabase;

    private function muatan(array $ubah = []): array
    {
        return array_merge([
            'nama_lengkap' => 'Warga Meulaboh',
            'kejadian' => 'Genset puskesmas mati saat pelayanan',
            'waktu_kejadian' => '2026-09-10 09:00',
            'tempat' => 'Puskesmas Johan Pahlawan',
        ], $ubah);
    }

    public function test_bukti_opsional_melekat_pada_laporan_dan_hanya_penindaklanjut_yang_bisa_mengunduh(): void
    {
        Storage::fake(config('media-library.disk_name'));
        foreach (['admin', 'super-admin', 'user'] as $nama) {
            Role::findOrCreate($nama, 'web');
        }
        $opd = Opd::create(['nama' => 'Dinas Kesehatan']);
        $pelapor = User::factory()->create();

        // tanpa bukti tetap boleh
        $this->actingAs($pelapor)->post('/lapor-kejadian', $this->muatan())->assertSessionHasNoErrors();
        $this->assertCount(0, LaporanKejadianRisiko::latest('id')->first()->daftarBukti());

        // dengan dua bukti
        $this->actingAs($pelapor)->post('/lapor-kejadian', $this->muatan([
            'kejadian' => 'Atap ruang arsip bocor, dokumen basah',
            'opd_id' => $opd->id,
            'bukti' => [UploadedFile::fake()->image('atap.jpg'), UploadedFile::fake()->create('berita-acara.pdf', 20, 'application/pdf')],
        ]))->assertSessionHasNoErrors();
        $laporan = LaporanKejadianRisiko::latest('id')->first();
        $bukti = $laporan->daftarBukti();
        $this->assertCount(2, $bukti);
        $this->assertSame('atap.jpg', $bukti[0]['nama']);

        // berkas terlarang ditolak
        $this->actingAs($pelapor)->post('/lapor-kejadian', $this->muatan([
            'kejadian' => 'Berkas aneh', 'bukti' => [UploadedFile::fake()->create('skrip.exe', 10)],
        ]))->assertSessionHasErrors('bukti.0');

        // unduh: pelapor biasa tidak boleh, PIC OPD lain tidak boleh, PIC OPD terkait dan admin boleh
        $url = "/lapor-kejadian/rekap/{$laporan->id}/bukti/{$bukti[0]['id']}";
        $this->actingAs($pelapor)->get($url)->assertForbidden();
        $picLain = User::factory()->create(['opd_id' => Opd::create(['nama' => 'Dinas Lain'])->id]);
        $this->actingAs($picLain)->get($url)->assertForbidden();
        $pic = User::factory()->create(['opd_id' => $opd->id]);
        $this->actingAs($pic)->get($url)->assertOk();
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $this->actingAs($admin)->get($url)->assertOk();
        $this->actingAs($admin)->get("/lapor-kejadian/rekap/{$laporan->id}/bukti/999999")->assertNotFound();
    }
}
