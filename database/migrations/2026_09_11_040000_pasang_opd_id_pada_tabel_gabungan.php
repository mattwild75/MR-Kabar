<?php

use App\Services\KroIroPdSyncService;
use App\Services\KrsIrsPdSyncService;
use App\Services\KrsIrsSyncService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Kunci asing `opd_id` pada tiga tabel gabungan — temuan audit R-08.
 *
 * Tabel tbl_krs_irs_pd, tbl_kro_iro_pd, dan tbl_krs_irs_pemda dulu hanya
 * menyimpan nama OPD sebagai teks, disalin dari kolom yang diisi bebas dan
 * ejaannya berbeda-beda antar pengisi. Kunci asing tidak bisa dipasang ke
 * nama; penyaringan per OPD karena itu bergantung pada pencocokan teks.
 *
 * KENAPA BISA AMAN SEKARANG. Ketiga tabel ini bukan tabel yang diisi orang —
 * ia dibangun ulang PENUH oleh layanan sinkronisasi dari baris sumber
 * (KRS/KRO/IRS/IRO), dan tiap baris sumber punya `user_id` yang tertaut ke
 * satu OPD. `opd_id` diturunkan dari situ (lihat MemetakanPemilikKeOpd),
 * sehingga tidak pernah bisa yatim: setiap pembangunan ulang mengisinya lagi
 * dari kebenaran.
 *
 * Nullable dan nullOnDelete: baris hierarki tanpa risiko memang tidak punya
 * OPD pemilik, dan OPD yang dihapus tidak boleh menggagalkan sinkronisasi.
 *
 * Kolom teks nama OPD TIDAK dibuang. Ia tetap dipakai untuk ditampilkan dan
 * dicocokkan pada dokumen sumber; yang berubah adalah penyaringan dan
 * penyambungan kini punya kunci yang bisa dipercaya.
 */
return new class extends Migration
{
    private const TABEL = ['tbl_krs_irs_pd', 'tbl_kro_iro_pd', 'tbl_krs_irs_pemda'];

    public function up(): void
    {
        foreach (self::TABEL as $tabel) {
            if (! Schema::hasTable($tabel) || Schema::hasColumn($tabel, 'opd_id')) {
                continue;
            }

            Schema::table($tabel, function (Blueprint $table) use ($tabel) {
                // tbl_krs_irs_pemda tidak punya kolom `id` (warisan sheet
                // asli), jadi `after('id')` akan gagal di sana — kolomnya
                // ditaruh di depan lewat `first()`.
                $kolom = $table->foreignId('opd_id')->nullable();
                Schema::hasColumn($tabel, 'id') ? $kolom->after('id') : $kolom->first();
                $kolom->constrained('opd')->nullOnDelete();
            });
        }

        // Isi kolom barunya dengan membangun ulang dari sumber — bukan dengan
        // menebak dari nama. Sinkron, di sini juga, supaya sesudah migrasi
        // tidak ada jendela di mana kolomnya ada tetapi kosong.
        foreach ([KrsIrsSyncService::class, KrsIrsPdSyncService::class, KroIroPdSyncService::class] as $layanan) {
            app($layanan)->syncNow();
        }
    }

    public function down(): void
    {
        foreach (self::TABEL as $tabel) {
            if (! Schema::hasTable($tabel) || ! Schema::hasColumn($tabel, 'opd_id')) {
                continue;
            }

            Schema::table($tabel, function (Blueprint $table) {
                $table->dropConstrainedForeignId('opd_id');
            });
        }
    }
};
