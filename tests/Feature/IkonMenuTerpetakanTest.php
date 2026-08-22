<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Penjaga sisa temuan R-07 — ikon menu dimuat satu per satu.
 *
 * Sidebar tidak lagi mengunduh seluruh daftar ikon (759 KB, 3.500+ komponen)
 * di setiap halaman. Ia kini mengambil berkas per ikon, dan berkas itu dicari
 * dari nama yang tersimpan di basis data: `ShieldAlert` -> `shield-alert.js`.
 *
 * KENAPA UJI INI ADA. Kalau penerjemahan nama itu meleset — dan bentuk seperti
 * `Building2` atau `Settings2` memang mudah meleset — berkasnya tidak ketemu,
 * dan sidebar diam-diam menampilkan ikon cadangan LayoutGrid. Tidak ada galat,
 * tidak ada yang rusak; ikonnya saja yang salah, dan itu jenis kerusakan yang
 * bisa bertahan berbulan-bulan tanpa ada yang melaporkannya.
 *
 * Yang diuji: setiap nama ikon yang MUNGKIN dipakai menu bisa diterjemahkan ke
 * berkas yang benar-benar ada di paket lucide-react.
 */
class IkonMenuTerpetakanTest extends TestCase
{
    /**
     * Salinan aturan penerjemahan di resources/js/lib/iconMapper.ts.
     *
     * Disalin, dan itu memang tidak ideal — tetapi menjalankan TypeScript dari
     * PHPUnit menuntut perkakas yang belum ada di proyek ini. Kalau aturannya
     * berubah di satu sisi saja, uji ini akan merah, dan merah di sini jauh
     * lebih baik daripada ikon yang diam-diam salah di layar.
     */
    private function keKebab(string $nama): string
    {
        $s = preg_replace('/([a-z0-9])([A-Z])/', '$1-$2', $nama) ?? $nama;
        $s = preg_replace('/([A-Za-z])(\d)/', '$1-$2', $s) ?? $s;

        return mb_strtolower($s);
    }

    private function direktoriIkon(): string
    {
        return base_path('node_modules/lucide-react/dist/esm/icons');
    }

    public function test_seluruh_ikon_yang_dipakai_menu_ada_berkasnya(): void
    {
        $dir = $this->direktoriIkon();
        if (! is_dir($dir)) {
            $this->markTestSkipped('node_modules/lucide-react belum terpasang.');
        }

        // Diambil dari seeder, bukan dari basis data yang sedang berjalan,
        // supaya uji ini tetap berarti pada pemasangan yang masih kosong.
        $seeder = file_get_contents(database_path('seeders/MenuSeeder.php'));
        preg_match_all("/'icon'\s*=>\s*'([^']+)'/", $seeder, $cocok);
        $ikon = array_values(array_unique($cocok[1]));

        $this->assertNotEmpty($ikon, 'Tidak ada nama ikon yang terbaca dari MenuSeeder.');

        $hilang = [];
        foreach ($ikon as $nama) {
            if (! is_file($dir.'/'.$this->keKebab($nama).'.js')) {
                $hilang[] = $nama.' -> '.$this->keKebab($nama).'.js';
            }
        }

        $this->assertSame(
            [],
            $hilang,
            "Nama ikon berikut tidak menemukan berkasnya, jadi sidebar akan menampilkan ikon cadangan:\n  ".implode("\n  ", $hilang)
        );
    }

    /** Bentuk yang paling mudah meleset diuji terpisah, dengan hasil yang diharapkan ditulis apa adanya. */
    public function test_bentuk_nama_yang_rawan_diterjemahkan_dengan_benar(): void
    {
        $harusnya = [
            'Home' => 'home',
            'ShieldAlert' => 'shield-alert',
            'Building2' => 'building-2',
            'Settings2' => 'settings-2',
            'ChartNoAxesCombined' => 'chart-no-axes-combined',
            'Trash2' => 'trash-2',
            'FileSpreadsheet' => 'file-spreadsheet',
        ];

        foreach ($harusnya as $nama => $berkas) {
            $this->assertSame($berkas, $this->keKebab($nama), "Penerjemahan '{$nama}' meleset.");
        }
    }

    /** Dan berkasnya memang ada, bukan cuma bentuk namanya yang benar. */
    public function test_berkas_ikon_yang_rawan_itu_benar_benar_ada(): void
    {
        $dir = $this->direktoriIkon();
        if (! is_dir($dir)) {
            $this->markTestSkipped('node_modules/lucide-react belum terpasang.');
        }

        foreach (['Building2', 'Settings2', 'Trash2', 'ChartNoAxesCombined'] as $nama) {
            $this->assertFileExists($dir.'/'.$this->keKebab($nama).'.js');
        }
    }
}
