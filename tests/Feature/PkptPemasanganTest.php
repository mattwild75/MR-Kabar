<?php

namespace Tests\Feature;

use App\Models\Menu;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Celah pemasangan: modul PKPT memakai seeder TERPISAH.
 *
 * Pemisahan itu disengaja — supaya modul PKPT tidak mengubah MenuSeeder dan
 * RolePermissionSeeder milik MR Kabar. Tetapi pemisahan yang sama membuat satu
 * langkah tidak terjadi dengan sendirinya, dan akibatnya menyesatkan:
 * migrasinya membuat empat belas tabel dengan sukses, tanpa satu pun pesan
 * galat, tetapi menu PKPT tidak pernah muncul dan seluruh alamat /pkpt/*
 * menjawab 403 — termasuk untuk Super Admin, karena menunya memang tidak ada.
 *
 * Kekeliruan semacam itu baru ketahuan setelah aplikasinya dipasang di server
 * dan seseorang bertanya kenapa menunya hilang. Uji ini yang menjaganya:
 * selama DatabaseSeeder tetap memanggil keduanya, pemasangan baru pasti
 * lengkap.
 *
 * Untuk pemasangan yang SUDAH BERJALAN, `db:seed` memang tidak dijalankan;
 * langkah manualnya ada di docs/CHECKLIST_GO_LIVE.md bagian A5.
 */
class PkptPemasanganTest extends TestCase
{
    use RefreshDatabase;

    /** Izin yang harus ada sesudah pemasangan baru. */
    private const IZIN = [
        'pkpt-view', 'pkpt-input', 'pkpt-hitung',
        'pkpt-rencana', 'pkpt-tetapkan', 'pkpt-pengaturan',
    ];

    public function test_pemasangan_baru_memasang_menu_dan_izin_pkpt(): void
    {
        $this->seed(DatabaseSeeder::class);

        foreach (self::IZIN as $nama) {
            $this->assertNotNull(
                Permission::where('name', $nama)->first(),
                "Izin {$nama} tidak terpasang oleh DatabaseSeeder"
            );
        }

        $this->assertNotNull(Role::where('name', 'apip')->first(), 'Peran apip harus ikut terpasang');

        $akar = Menu::where('title', 'PKPT Berbasis Risiko')->first();
        $this->assertNotNull($akar, 'Menu induk PKPT tidak terpasang');

        $misc = Menu::where('title', 'Miscellaneous')->whereNull('parent_id')->first();
        $this->assertNotNull($misc);
        $this->assertSame($misc->id, $akar->parent_id, 'PKPT harus berada di bawah Miscellaneous');

        // Empat belas formulir cetak berikut sembilan halaman kerja.
        $this->assertSame(25, Menu::where('route', 'like', '/pkpt%')->count(),
            'Jumlah halaman PKPT yang terpasang berubah — sengaja atau tidak?');
    }

    /**
     * Admin dan Super Admin harus dapat membuka PKPT tanpa penyetelan apa pun
     * sesudah pemasangan.
     */
    public function test_admin_dapat_membuka_pkpt_sesudah_pemasangan_baru(): void
    {
        $this->seed(DatabaseSeeder::class);

        $admin = Role::where('name', 'admin')->first();
        $this->assertNotNull($admin);

        foreach (self::IZIN as $nama) {
            $this->assertTrue($admin->hasPermissionTo($nama), "Peran admin belum memperoleh {$nama}");
        }
    }

    /** Peran apip memperoleh hak isi, tetapi bukan hak menetapkan. */
    public function test_peran_apip_terpasang_dengan_batas_yang_benar(): void
    {
        $this->seed(DatabaseSeeder::class);

        $apip = Role::where('name', 'apip')->firstOrFail();

        foreach (['pkpt-view', 'pkpt-input', 'pkpt-hitung', 'pkpt-rencana'] as $boleh) {
            $this->assertTrue($apip->hasPermissionTo($boleh), "apip seharusnya boleh {$boleh}");
        }

        foreach (['pkpt-tetapkan', 'pkpt-pengaturan'] as $tidakBoleh) {
            $this->assertFalse($apip->hasPermissionTo($tidakBoleh),
                "apip TIDAK boleh {$tidakBoleh} — keduanya menyangkut angka dalam Keputusan Inspektur");
        }
    }

    /**
     * Menjalankan seluruh seeder dua kali tidak menggandakan apa pun.
     *
     * `db:seed` termasuk perintah yang gampang terlanjur dijalankan ulang.
     */
    public function test_pemasangan_diulang_tidak_menggandakan_menu_atau_izin(): void
    {
        $this->seed(DatabaseSeeder::class);
        $menuPertama = Menu::where('route', 'like', '/pkpt%')->count();
        $izinPertama = Permission::where('name', 'like', 'pkpt-%')->count();

        $this->seed(DatabaseSeeder::class);

        $this->assertSame($menuPertama, Menu::where('route', 'like', '/pkpt%')->count());
        $this->assertSame($izinPertama, Permission::where('name', 'like', 'pkpt-%')->count());
        $this->assertSame(1, Menu::where('title', 'PKPT Berbasis Risiko')->count());
    }
}
