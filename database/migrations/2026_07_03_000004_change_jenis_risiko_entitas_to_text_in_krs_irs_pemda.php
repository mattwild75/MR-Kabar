<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // `tbl_krs_irs_pemda` adalah tabel legacy pre-existing (dari Power
        // Query Excel), tidak ada di database yang di-migrate dari nol (mis.
        // test suite) — lewati jika belum ada.
        if (!Schema::hasTable('tbl_krs_irs_pemda')) {
            return;
        }

        // JENIS_RISIKO dan ENTITAS_PD_YANG_MENILAI sebelumnya integer (kode
        // angka saja dari Power Query), tapi form web I_b_IRS_Pemda yang baru
        // menyimpan label lengkap (mis. "2 - Kesehatan", nama OPD penuh) agar
        // lebih informatif di modal detail diagram — perlu text agar tidak
        // kehilangan makna saat sinkronisasi.
        Schema::table('tbl_krs_irs_pemda', function (Blueprint $table) {
            $table->text('JENIS RISIKO_tmp')->nullable();
            $table->text('ENTITAS PD YANG MENILAI_tmp')->nullable();
        });

        // Isi kolom tmp dari data lama sebagai teks (angka polos), supaya
        // tidak hilang; sinkronisasi berikutnya akan menimpa dengan format
        // label lengkap dari data form web yang sebenarnya.
        \Illuminate\Support\Facades\DB::statement(
            'UPDATE tbl_krs_irs_pemda SET `JENIS RISIKO_tmp` = CAST(JENIS_RISIKO AS CHAR), `ENTITAS PD YANG MENILAI_tmp` = CAST(ENTITAS_PD_YANG_MENILAI AS CHAR)'
        );

        Schema::table('tbl_krs_irs_pemda', function (Blueprint $table) {
            $table->dropColumn(['JENIS_RISIKO', 'ENTITAS_PD_YANG_MENILAI']);
        });

        Schema::table('tbl_krs_irs_pemda', function (Blueprint $table) {
            $table->renameColumn('JENIS RISIKO_tmp', 'JENIS_RISIKO');
            $table->renameColumn('ENTITAS PD YANG MENILAI_tmp', 'ENTITAS_PD_YANG_MENILAI');
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('tbl_krs_irs_pemda')) {
            return;
        }

        Schema::table('tbl_krs_irs_pemda', function (Blueprint $table) {
            $table->integer('JENIS_RISIKO_int')->nullable();
            $table->integer('ENTITAS_PD_YANG_MENILAI_int')->nullable();
        });

        \Illuminate\Support\Facades\DB::statement(
            "UPDATE tbl_krs_irs_pemda SET JENIS_RISIKO_int = CAST(NULLIF(REGEXP_SUBSTR(JENIS_RISIKO, '^[0-9]+'), '') AS UNSIGNED), ENTITAS_PD_YANG_MENILAI_int = CAST(NULLIF(REGEXP_SUBSTR(ENTITAS_PD_YANG_MENILAI, '^[0-9]+'), '') AS UNSIGNED)"
        );

        Schema::table('tbl_krs_irs_pemda', function (Blueprint $table) {
            $table->dropColumn(['JENIS_RISIKO', 'ENTITAS_PD_YANG_MENILAI']);
        });

        Schema::table('tbl_krs_irs_pemda', function (Blueprint $table) {
            $table->renameColumn('JENIS_RISIKO_int', 'JENIS_RISIKO');
            $table->renameColumn('ENTITAS_PD_YANG_MENILAI_int', 'ENTITAS_PD_YANG_MENILAI');
        });
    }
};
