<?php

namespace App\Support;

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

/**
 * Pembungkus penulisan yang memakai updateOrCreate()/firstOrNew() pada tabel
 * berindeks unik.
 *
 * Pola itu menjalankan SELECT dulu, baru INSERT. Kalau dua orang menyimpan
 * baris berkunci sama pada saat yang hampir bersamaan, keduanya bisa
 * mendapati barisnya "belum ada" lalu keduanya menyisipkan — yang kalah kena
 * galat kunci ganda (1062) dan berakhir jadi layar 500 di hadapan pengisi.
 * Terukur pada Form 1c sebelum ini dipakai: delapan simpan serentak untuk
 * OPD & tahun yang sama, tiga di antaranya gagal 500.
 *
 * Di sini tabrakan itu diperlakukan sebagaimana adanya — penanda bahwa
 * barisnya keburu dibuat orang lain, bukan kesalahan si pengisi. Closure-nya
 * diulang, dan pada percobaan berikutnya updateOrCreate() menemukan baris tsb
 * lalu memperbaruinya; hasil akhirnya sama saja dengan kalau kedua orang
 * menyimpan bergantian. Karena itu closure yang dikirim ke sini WAJIB
 * idempoten: dijalankan dua kali harus memberi keadaan akhir yang sama.
 *
 * Deadlock InnoDB (SQLSTATE 40001) tidak ditangani di sini karena
 * DB::transaction() sudah mengulangnya sendiri lewat argumen kedua.
 */
class SafeUpsert
{
    /** Kode galat MySQL utk pelanggaran kunci UNIK — bukan kunci asing. */
    private const DUPLICATE_ENTRY = 1062;

    public static function run(callable $write, int $attempts = 5): mixed
    {
        for ($attempt = 1; ; $attempt++) {
            try {
                return DB::transaction($write, $attempts);
            } catch (QueryException $e) {
                if ($attempt >= $attempts || !self::isDuplicateEntry($e)) {
                    throw $e;
                }

                // Jeda acak singkat, supaya dua permintaan yang barusan
                // bertabrakan tidak mencoba lagi pada saat yang sama persis.
                usleep(random_int(5_000, 40_000));
            }
        }
    }

    /**
     * Sengaja memeriksa kode driver, bukan cuma SQLSTATE 23000: SQLSTATE yang
     * sama juga dipakai pelanggaran kunci asing (1452), dan mengulang
     * penulisan tidak akan pernah memperbaiki yang itu — hanya menunda galat
     * yang seharusnya muncul.
     */
    private static function isDuplicateEntry(QueryException $e): bool
    {
        return (int) ($e->errorInfo[1] ?? 0) === self::DUPLICATE_ENTRY;
    }
}
