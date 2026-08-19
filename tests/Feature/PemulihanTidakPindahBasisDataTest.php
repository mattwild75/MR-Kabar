<?php

namespace Tests\Feature;

use App\Http\Controllers\BackupController;
use Tests\TestCase;

/**
 * Penjaga R-02, sisi kode.
 *
 * `mysqldump --databases` menyisipkan `USE \`mrkabar\`;` ke dalam dumpnya, dan
 * PDO menjalankannya apa adanya — koneksi berpindah ke basis data yang
 * namanya tertulis DI DALAM BERKAS, bukan yang sedang dipakai aplikasi.
 *
 * Pada 17 Agustus 2026 hal ini menghapus 914 baris data sungguhan: sebuah
 * cadangan dipulihkan "ke basis data uji", dan barisnya justru menimpa basis
 * data asli. Waktu itu perbaikannya cuma prosedural — skrip pemulihan diberi
 * penyaring. Jalur tombol Impor di dalam aplikasi masih terbuka sesudahnya,
 * dan itulah jalur yang akan dipakai orang saat panik.
 *
 * Uji ini menahan pernyataannya, bukan prosedurnya.
 */
class PemulihanTidakPindahBasisDataTest extends TestCase
{
    /** @return array<int, string> */
    private function saring(array $statements): array
    {
        $metode = new \ReflectionMethod(BackupController::class, 'tanpaPerpindahanBasisData');
        $metode->setAccessible(true);

        return $metode->invoke(app(BackupController::class), $statements);
    }

    public function test_pernyataan_use_dan_create_database_dibuang(): void
    {
        $hasil = $this->saring([
            'CREATE DATABASE /*!32312 IF NOT EXISTS*/ `mrkabar`',
            'USE `mrkabar`',
            'CREATE SCHEMA `lain`',
            'DROP TABLE IF EXISTS `users`',
            'INSERT INTO `users` VALUES (1)',
        ]);

        $this->assertSame([
            'DROP TABLE IF EXISTS `users`',
            'INSERT INTO `users` VALUES (1)',
        ], $hasil);
    }

    /** Dump sungguhan menaruh komentar tepat di depan pernyataannya. */
    public function test_use_yang_didahului_komentar_tetap_terbuang(): void
    {
        $hasil = $this->saring([
            "--\n-- Current Database: `mrkabar`\n--\n\nUSE `mrkabar`",
            '/* komentar blok */ use `mrkabar`',
            'SELECT 1',
        ]);

        $this->assertSame(['SELECT 1'], $hasil);
    }

    /**
     * Dan tidak boleh kebablasan.
     *
     * Kata "USE" muncul di dalam nilai data yang sah — kalau penyaringnya
     * mencocokkan di mana saja alih-alih di awal pernyataan, baris data
     * sungguhan ikut hilang saat pemulihan, diam-diam.
     */
    public function test_pernyataan_yang_kebetulan_memuat_kata_use_tidak_ikut_terbuang(): void
    {
        $tetap = [
            "INSERT INTO `risiko` VALUES ('USE OF FORCE', 'CREATE DATABASE ACCESS')",
            'CREATE TABLE `usettings` (id int)',
            "UPDATE `menus` SET nama = 'Use Case'",
        ];

        $this->assertSame($tetap, $this->saring($tetap));
    }
}
