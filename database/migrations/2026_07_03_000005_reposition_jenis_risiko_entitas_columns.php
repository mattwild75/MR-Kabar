<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Migration sebelumnya (change_jenis_risiko_entitas_to_text) memindahkan
     * JENIS_RISIKO dan ENTITAS_PD_YANG_MENILAI ke akhir tabel karena
     * drop+rename column selalu menambah kolom baru di posisi terakhir.
     * Ini penting diperbaiki karena KaeresController::visualizationEmbed()
     * membangun urutan level diagram risiko dari URUTAN KOLOM FISIK tabel
     * (Schema::getColumnListing() + array_slice setelah URAIAN_RISIKO) —
     * posisi kolom yang salah akan mengubah urutan level diagram yang
     * sudah sempurna.
     */
    public function up(): void
    {
        if (!Schema::hasTable('tbl_krs_irs_pemda')) {
            return;
        }

        DB::statement('ALTER TABLE tbl_krs_irs_pemda MODIFY COLUMN `JENIS_RISIKO` text NULL AFTER `TAHUN_DINILAI_RISIKO`');
        DB::statement('ALTER TABLE tbl_krs_irs_pemda MODIFY COLUMN `ENTITAS_PD_YANG_MENILAI` text NULL AFTER `JENIS_RISIKO`');
    }

    public function down(): void
    {
        // Tidak perlu reverse — posisi kolom murni kosmetik/urutan diagram,
        // tidak ada data yang berubah oleh migration ini.
    }
};
