<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Memindahkan seluruh cap waktu dari UTC ke Asia/Jakarta (WIB, UTC+7).
 *
 * MASALAHNYA. Server dan Laravel sama-sama disetel UTC, sedangkan seluruh
 * penggunanya di WIB. Akibatnya setiap cap waktu di layar tertinggal 7 jam
 * dari jam dinding pengguna: entri yang dibuat pukul 08:00 WIB tercatat dan
 * ditampilkan sebagai 01:00. Untuk aplikasi pengawasan, jejak waktu yang
 * meleset tujuh jam bukan soal kerapian — ia membuat urutan kejadian pada log
 * aktivitas dan laporan kejadian risiko tidak bisa dipakai sebagai bukti.
 *
 * KENAPA HARUS DIGESER, BUKAN CUKUP MENGGANTI APP_TIMEZONE. Laravel menulis
 * dan membaca kolom datetime sebagai waktu dinding pada zona aplikasi, tanpa
 * menyimpan penandanya. Baris lama berisi angka UTC. Begitu zonanya diganti
 * tanpa menggeser isinya, angka yang sama itu dibaca sebagai WIB — dan seluruh
 * riwayat mendadak bergeser 7 jam ke arah yang salah. Migrasi ini yang
 * menyelaraskan isinya dengan zona barunya.
 *
 * YANG SENGAJA TIDAK DISENTUH. Tabel kerangka kerja yang isinya berumur pendek
 * atau tidak pernah dibaca manusia: sesi, cache, antrean, token pemulihan
 * sandi, dan tabel `migrations` itu sendiri. Menggesernya tidak menolong siapa
 * pun, dan menggeser `sessions` justru bisa memutus sesi yang sedang berjalan.
 */
return new class extends Migration
{
    private const JAM = 7;

    /**
     * Tabel yang cap waktunya tidak perlu — dan sebagiannya tidak boleh —
     * digeser.
     */
    private const DILEWATI = [
        'migrations',
        'sessions',
        'cache',
        'cache_locks',
        'jobs',
        'job_batches',
        'failed_jobs',
        'password_reset_tokens',
    ];

    public function up(): void
    {
        $this->geser(self::JAM);
    }

    public function down(): void
    {
        $this->geser(-self::JAM);
    }

    /**
     * Menggeser setiap kolom datetime/timestamp pada basis data ini.
     *
     * Kolomnya dicari dari information_schema, bukan didaftar manual: daftar
     * manual pasti tertinggal begitu ada tabel baru, dan yang tertinggal tidak
     * menimbulkan galat apa pun — hanya beberapa kolom yang diam-diam beda
     * tujuh jam dari kolom di sebelahnya.
     */
    private function geser(int $jam): void
    {
        $skema = DB::getDatabaseName();

        $kolom = DB::select(
            'SELECT TABLE_NAME AS tabel, COLUMN_NAME AS kolom
               FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = ?
                AND DATA_TYPE IN (?, ?)',
            [$skema, 'datetime', 'timestamp']
        );

        $arah = $jam >= 0 ? 'DATE_ADD' : 'DATE_SUB';
        $besar = abs($jam);

        foreach ($kolom as $k) {
            if (in_array($k->tabel, self::DILEWATI, true)) {
                continue;
            }

            DB::statement(
                "UPDATE `{$k->tabel}`
                    SET `{$k->kolom}` = {$arah}(`{$k->kolom}`, INTERVAL {$besar} HOUR)
                  WHERE `{$k->kolom}` IS NOT NULL"
            );
        }
    }
};
