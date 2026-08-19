<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

/**
 * Pemeriksaan "apakah tabel ini ada" yang hasilnya diingat.
 *
 * Beberapa halaman risiko menjaga diri terhadap tabel gabungan yang mungkin
 * belum terbentuk pada pemasangan baru — tbl_krs_irs_pemda, tbl_krs_irs_pd,
 * tbl_kro_iro_pd. Penjagaannya benar dan tetap diperlukan, tetapi
 * `Schema::hasTable()` menanyakannya ke `information_schema` SETIAP request,
 * dan pada pengukuran halaman III_b justru itulah kueri paling lambatnya.
 *
 * Jawabannya praktis tidak pernah berubah: tabel dibuat oleh migrasi, dan
 * migrasi tidak berjalan di tengah request. Karena itu hasilnya disimpan.
 * Penyimpanannya ikut terhapus oleh `php artisan cache:clear`, yang memang
 * sudah menjadi bagian dari alur pemasangan dan pembaruan — jadi tidak ada
 * keadaan di mana jawabannya tertinggal basi tanpa cara memulihkannya.
 */
trait MemeriksaTabelTersedia
{
    protected function tabelTersedia(string $tabel): bool
    {
        return Cache::rememberForever(
            'skema.tabel-ada.'.$tabel,
            fn () => Schema::hasTable($tabel),
        );
    }
}
