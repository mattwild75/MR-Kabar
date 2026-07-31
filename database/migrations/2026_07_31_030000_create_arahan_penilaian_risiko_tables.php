<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Arahan dan Kebijakan Penilaian Risiko, beserta tahapan dan tenggatnya.
 *
 * Perdep PPKD 4/2019 Lampiran 3 dan 4 (halaman berlabel 117 sampai 121) memuat
 * contoh Surat Edaran Kepala Daerah yang menetapkan kapan penilaian risiko
 * dilakukan: yang 5 tahunan mengikuti periode RPJMD, yang 1 tahunan mengikuti
 * siklus anggaran dan menyebut tanggal konkret — contohnya "penilaian risiko
 * operasional OPD diharapkan dilakukan mulai tanggal 3 sd 14 Oktober 2016
 * setelah RKA OPD disusun".
 *
 * Arahan ditetapkan TERPISAH dari Peraturan Bupati, bukan digabung, mengikuti
 * bentuk pada Perdep: Perbup adalah pedoman yang jarang berubah, sedangkan
 * arahan berubah tiap tahun mengikuti siklus anggaran. Kalau digabung, tiap
 * tahun Perbup harus diubah.
 *
 * Tabel ini menjadi SUMBER DATA jadwal pada Dasbor: tahapan yang ditampilkan
 * di sana bukan karangan aplikasi, melainkan apa yang benar-benar ditetapkan
 * Bupati untuk tahun berjalan.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('arahan_penilaian_risiko')) {
            Schema::create('arahan_penilaian_risiko', function (Blueprint $table) {
                $table->id();
                // '5_tahunan' mengikuti periode RPJMD, '1_tahunan' mengikuti
                // siklus anggaran.
                $table->string('jenis', 20);
                // Untuk arahan 1 tahunan, keduanya diisi tahun yang sama —
                // dengan begitu pencarian "arahan yang berlaku pada tahun X"
                // memakai satu bentuk kueri untuk kedua jenis.
                $table->unsignedSmallInteger('tahun_mulai');
                $table->unsignedSmallInteger('tahun_selesai');
                $table->string('nomor_se')->nullable();
                $table->date('tanggal_se')->nullable();
                $table->text('dasar_hukum')->nullable();
                $table->text('catatan')->nullable();
                // 'draf' selama masih disusun, 'berlaku' setelah ditetapkan.
                // Hanya yang berlaku yang dibaca jadwal Dasbor — arahan yang
                // masih disusun tidak boleh menagih siapa pun.
                $table->string('status', 20)->default('draf');
                $table->foreignId('ditetapkan_oleh')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
                $table->softDeletes();

                $table->index(['jenis', 'status', 'tahun_mulai', 'tahun_selesai'], 'arahan_berlaku_index');
            });
        }

        if (!Schema::hasTable('arahan_tahapan')) {
            Schema::create('arahan_tahapan', function (Blueprint $table) {
                $table->id();
                $table->foreignId('arahan_penilaian_risiko_id')
                    ->constrained('arahan_penilaian_risiko')
                    ->cascadeOnDelete();
                $table->unsignedSmallInteger('urutan')->default(0);
                $table->string('tahapan');
                // Dokumen perencanaan yang memicu tahapan ini, mis. "RKA OPD"
                // atau "Renstra OPD". Perdep menyatakan tenggat penilaian
                // risiko relatif terhadap dokumen tersebut, bukan terhadap
                // tanggal kalender semata.
                $table->string('dokumen_pemicu')->nullable();
                $table->date('tanggal_mulai')->nullable();
                $table->date('tanggal_selesai')->nullable();
                $table->string('pelaksana')->nullable();
                $table->string('keluaran')->nullable();
                $table->timestamps();

                $table->index(['arahan_penilaian_risiko_id', 'urutan'], 'arahan_tahapan_urutan_index');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('arahan_tahapan');
        Schema::dropIfExists('arahan_penilaian_risiko');
    }
};
