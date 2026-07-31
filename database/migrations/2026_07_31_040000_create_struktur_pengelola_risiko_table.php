<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Struktur pengelolaan Risiko Pemerintah Kabupaten Aceh Barat.
 *
 * Perdep PPKD 4/2019 Lampiran 2 (halaman berlabel 115 sampai 116) memuat
 * contoh Keputusan Kepala Daerah tentang struktur pengelolaan Risiko, dan
 * contoh Surat Edaran pada Lampiran 3 menyebut susunannya: Sekretaris Daerah
 * sebagai koordinator penyelenggaraan, Kepala Daerah sebagai Unit Pemilik
 * Risiko tingkat Pemda, pejabat eselon sebagai UPR di tingkatnya, Komite
 * Pengelolaan Risiko, Asisten Sekretaris Daerah sebagai Unit Kepatuhan, dan
 * Inspektur Daerah sebagai penanggung jawab pengawasan.
 *
 * Direkam sebagai DATA, bukan sekadar halaman cetak, supaya susunan ini dapat
 * dirujuk aplikasi — siapa Unit Kepatuhan, siapa Koordinator, siapa anggota
 * UPR tiap OPD. Selama ini keterangan itu hanya ada sebagai kalimat di dalam
 * Peraturan Bupati dan sebagai prosa yang dipatri di komponen bantuan, sehingga
 * tidak bisa dipakai mengarahkan apa pun.
 *
 * Per tahun, karena susunannya berubah mengikuti mutasi jabatan.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('struktur_pengelola_risiko')) {
            return;
        }

        Schema::create('struktur_pengelola_risiko', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('tahun');
            // Peran dalam struktur, mis. 'koordinator_penyelenggaraan',
            // 'upr_pemda', 'unit_kepatuhan'. Disimpan sebagai string, bukan
            // enum database: Perdep menyebut susunan bakunya tetapi tidak
            // melarang daerah menambah peran, dan mengubah enum menuntut
            // migrasi baru tiap kali.
            $table->string('peran', 60);
            $table->string('nama')->nullable();
            $table->string('jabatan')->nullable();
            // Diisi bila peran ini melekat pada satu OPD tertentu, mis.
            // anggota UPR di tingkat OPD. Kosong untuk peran tingkat Pemda.
            $table->foreignId('opd_id')->nullable()->constrained('opd')->nullOnDelete();
            $table->unsignedSmallInteger('urutan')->default(0);
            $table->text('tugas')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tahun', 'urutan'], 'struktur_tahun_urutan_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('struktur_pengelola_risiko');
    }
};
