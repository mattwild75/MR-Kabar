<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Membuat tbl_krs_pemda dan tbl_krs_irs_pemda pada basis data yang belum
 * memilikinya.
 *
 * Kedua tabel ini terbawa dari sistem lama (berkas Excel bermakro) dan
 * SELAMA INI TIDAK PERNAH DIBUAT OLEH MIGRASI MANA PUN — hanya ada di basis
 * data kerja karena diimpor manual. Akibatnya pemasangan baru menghasilkan
 * aplikasi yang tampak berhasil dimigrasi tetapi langsung galat 500 begitu
 * halaman yang membacanya dibuka, misalnya Risiko 100 Program Bupati yang
 * mengambil VISI dan MISI dari tbl_krs_pemda.
 *
 * Migrasi ini sengaja bertanggal PALING AKHIR dan dijaga hasTable:
 *   - pada basis data yang sudah berjalan, kedua tabel sudah ada sehingga
 *     migrasi ini tidak mengubah apa pun;
 *   - pada basis data kosong, seluruh migrasi pengubah kolom sebelumnya
 *     melewati kedua tabel ini (semuanya dijaga hasTable), lalu migrasi ini
 *     membentuknya langsung dalam susunan akhir.
 *
 * Susunan kolom disalin apa adanya dari basis data yang berjalan, termasuk
 * dua gaya penamaan yang berbeda: tbl_krs_pemda memakai SPASI dan HURUF
 * BESAR mengikuti tajuk kolom Excel aslinya, sedangkan tbl_krs_irs_pemda
 * memakai GARIS BAWAH. Perbedaan ini disengaja dan tidak boleh diseragamkan
 * (lihat docs/KONVENSI_PENAMAAN_KOLOM.md).
 *
 * tbl_krs_irs_pemda memang tidak berkunci utama: ia tabel turunan yang
 * dibangun ulang seluruhnya oleh KrsIrsSyncService, bukan tabel yang
 * barisnya dirujuk satu per satu.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('tbl_krs_pemda')) {
            Schema::create('tbl_krs_pemda', function (Blueprint $table) {
                $table->id();
                foreach ([
                    'VISI',
                    'MISI',
                    'TUJUAN RPJMD',
                    'IK TUJUAN RPJMD',
                    'BASELINE IK TUJUAN RPJMD',
                    'TARGET IK TUJUAN RPJMD',
                    'SATUAN IK TUJUAN RPJMD',
                    'OPD IK TUJUAN RPJMD',
                    'SASARAN RPJMD',
                    'IK SASARAN RPJMD',
                    'BASELINE IK SASARAN RPJMD',
                    'TARGET IK SASARAN RPJMD',
                    'SATUAN IK SASARAN RPJMD',
                    'OPD IK SASARAN RPJMD',
                    'PROGRAM PRIORITAS',
                    'OUTCOME PROGRAM PRIORITAS',
                    'IK PROGRAM',
                    'BASELINE IK PROGRAM',
                    'TARGET IK PROGRAM',
                    'SATUAN IK PROGRAM',
                    'OPD IK PROGRAM',
                    'OPD PENANGGUNGJAWAB PROGRAM',
                ] as $kolom) {
                    $table->text($kolom)->nullable();
                }
                $table->softDeletes();
                $table->string('delete_batch', 36)->nullable()->index();
            });
        }

        if (! Schema::hasTable('tbl_krs_irs_pemda')) {
            Schema::create('tbl_krs_irs_pemda', function (Blueprint $table) {
                foreach ([
                    'VISI',
                    'MISI',
                    'TUJUAN_RPJMD',
                    'IK_TUJUAN_RPJMD',
                    'BASELINE_IK_TUJUAN_RPJMD',
                    'TARGET_IK_TUJUAN_RPJMD',
                    'OPD_IK_TUJUAN_RPJMD',
                    'SASARAN_RPJMD',
                    'IK_SASARAN_RPJMD',
                    'BASELINE_IK_SASARAN_RPJMD',
                    'TARGET_IK_SASARAN_RPJMD',
                    'OPD_IK_SASARAN_RPJMD',
                    'PROGRAM_PRIORITAS',
                    'OUTCOME_PROGRAM_PRIORITAS',
                    'IK_PROGRAM_PRIORITAS',
                    'BASELINE_IK_PROGRAM_PRIORITAS',
                    'TARGET_IK_PROGRAM_PRIORITAS',
                    'OPD_PENANGGUNGJAWAB_PROGRAM',
                    'URAIAN_RISIKO',
                    'TINGKAT_RISIKO',
                ] as $kolom) {
                    $table->text($kolom)->nullable();
                }

                $table->integer('TAHUN_DINILAI_RISIKO')->nullable();
                $table->text('JENIS_RISIKO')->nullable();
                $table->text('ENTITAS_PD_YANG_MENILAI')->nullable();
                $table->integer('NOMOR_URUT_RISIKO')->nullable();

                foreach ([
                    'PEMILIK_RISIKO',
                    'URAIAN_PENYEBAB_RISIKO',
                    'SUMBER_SEBAB_RISIKO',
                    'C_UC',
                    'URAIAN_DAMPAK_RISIKO',
                    'PIHAK_TERKENA_DAMPAK_RISIKO',
                    'URAIAN_PENGENDALIAN_YANG_SUDAH_ADA',
                    'CELAH_PENGENDALIAN',
                    'RENCANA_TINDAK_PENGENDALIAN',
                    'PEMILIK_PENANGGUNGJAWAB',
                    'PENANGGUNG_JAWAB_PENGENDALIAN_JABATAN',
                    'TRIWULAN',
                ] as $kolom) {
                    $table->text($kolom)->nullable();
                }

                $table->unsignedSmallInteger('TAHUN_TARGET_PENYELESAIAN')->nullable();
                $table->integer('SKALA_DAMPAK')->nullable();
                $table->integer('SKALA_KEMUNGKINAN')->nullable();
                $table->integer('SKALA_RISIKO')->nullable();
                $table->integer('SKALA_PRIORITAS')->nullable();

                $table->index('TAHUN_DINILAI_RISIKO', 'tbl_krs_irs_pemda_tahun_dinilai_risiko_index');
            });
        }
    }

    public function down(): void
    {
        // Sengaja tidak menghapus apa pun. Kedua tabel ini menyimpan data
        // warisan yang tidak dibuat oleh rangkaian migrasi, sehingga
        // menghapusnya saat rollback berarti membuang data yang tidak dapat
        // dibangun ulang oleh migrasi mana pun.
    }
};
