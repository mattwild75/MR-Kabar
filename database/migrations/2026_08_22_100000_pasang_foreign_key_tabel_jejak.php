<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Dua foreign key terakhir yang memang bisa dipasang — temuan R-08.
 *
 * TEMUANNYA JAUH LEBIH KECIL DARIPADA YANG TERCATAT. Audit menulis "31 dari
 * 61 tabel tanpa foreign key". Diukur ulang pada basis data sungguhan:
 *
 *   54 tabel, 49 foreign key SUDAH ADA
 *   14 kolom rujukan (*_id) tanpa foreign key
 *   12 di antaranya POLIMORFIK — menunjuk lebih dari satu tabel, jadi
 *      foreign key mustahil dipasang, bukan kelalaian:
 *        activity_log.subject_id      -> IroPd, IrsPd, IrsPemda, KroPd
 *        program_bupati_risiko.risiko_id -> iro_pd, irs_pd, irs_pemda
 *        media, notifications, model_has_roles, model_has_permissions,
 *        monitoring_rtp, laporan_kejadian_risiko, pencatatan_kejadian_risiko,
 *        program_bupati_risiko_usulan, tbl_periode_penilaian_asli
 *      Masing-masing punya kolom pendamping bertipe (*_type / *_tipe /
 *      `tabel`) yang menyimpan tabel mana yang sedang dirujuk.
 *   2 sisanya nyata dan dipasang di sini.
 *
 * Jadi yang tersisa dari R-08 bukan pekerjaan berminggu-minggu pada 31 tabel,
 * melainkan dua constraint.
 *
 * BARIS YATIM DIBERESKAN LEBIH DULU. Menambahkan constraint pada tabel yang
 * memuat rujukan menggantung akan gagal DI TENGAH migrasi, dan gagal di
 * tengah jauh lebih buruk daripada tidak mulai. Diperiksa: hanya
 * tbl_krs_pemda_opd_asli yang punya, 6 baris menunjuk 3 id yang sudah tidak
 * ada (296, 354, 355). Isinya dicatat di sini supaya tidak hilang dari
 * catatan sekalipun barisnya dihapus:
 *
 *   296  OPD IK PROGRAM              Dinas Pendidikan dan Kebudayaan
 *   296  OPD PENANGGUNGJAWAB PROGRAM Dinas Pendidikan dan Kebudayaan
 *   354  OPD IK PROGRAM              Sekretariat Daerah
 *   354  OPD PENANGGUNGJAWAB PROGRAM Sekretariat Daerah
 *   355  OPD IK PROGRAM              Sekretariat Daerah
 *   355  OPD PENANGGUNGJAWAB PROGRAM Sekretariat Daerah
 *
 * Keenamnya jejak penyeragaman ejaan nama perangkat daerah pada baris yang
 * kemudian dihapus. Jejak yang subjeknya sudah tidak ada tidak menerangkan
 * apa pun.
 *
 * onDelete('cascade') SENGAJA. Kedua tabel ini merekam nilai SEBELUM diubah;
 * tanpa baris induknya, catatan itu kehilangan artinya. Perlu dicatat bahwa
 * penghapusan lunak (soft delete) TIDAK memicu cascade — barisnya masih ada
 * di tabel — jadi jejaknya tetap utuh selama induknya masih bisa dipulihkan
 * lewat menu Data Terhapus. Cascade baru bekerja pada penghapusan permanen.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Yatim dibereskan lebih dulu, kalau tidak constraint di bawah gagal.
        $terhapus = DB::table('tbl_krs_pemda_opd_asli')
            ->whereNotIn('baris_id', fn ($q) => $q->select('id')->from('tbl_krs_pemda'))
            ->delete();

        if ($terhapus > 0) {
            logger()->info("Migrasi foreign key: {$terhapus} baris jejak yatim dihapus dari tbl_krs_pemda_opd_asli");
        }

        Schema::table('tbl_iro_pd_tahap_asli', function (Blueprint $table) {
            $table->foreign('iro_pd_id', 'fk_iro_pd_tahap_asli_iro_pd')
                ->references('id')->on('tbl_iro_pd')
                ->cascadeOnDelete();
        });

        Schema::table('tbl_krs_pemda_opd_asli', function (Blueprint $table) {
            $table->foreign('baris_id', 'fk_krs_pemda_opd_asli_baris')
                ->references('id')->on('tbl_krs_pemda')
                ->cascadeOnDelete();
        });
    }

    /**
     * Constraint dilepas kembali.
     *
     * Enam baris yatim yang dihapus di atas TIDAK dikembalikan — datanya sudah
     * tidak ada, dan mengarang ulang isinya lebih buruk daripada mengakui
     * hilangnya. Nilainya tercatat pada keterangan kelas ini.
     */
    public function down(): void
    {
        Schema::table('tbl_iro_pd_tahap_asli', function (Blueprint $table) {
            $table->dropForeign('fk_iro_pd_tahap_asli_iro_pd');
        });

        Schema::table('tbl_krs_pemda_opd_asli', function (Blueprint $table) {
            $table->dropForeign('fk_krs_pemda_opd_asli_baris');
        });
    }
};
