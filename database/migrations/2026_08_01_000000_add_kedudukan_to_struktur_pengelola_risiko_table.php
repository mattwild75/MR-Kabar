<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Kedudukan seseorang di dalam satu peran pengelola Risiko.
 *
 * Perdep PPKD 4/2019 Lampiran 2 (halaman berlabel 110 sampai 112) menyebut
 * Unit Pemilik Risiko dan Komite Pengelolaan Risiko sebagai TIM, bukan jabatan
 * tunggal: tiap tingkatan punya ketua, koordinator teknis yang merangkap
 * anggota, dan anggota. Contohnya Unit Pemilik Risiko Tingkat Pemerintah
 * Daerah — Bupati sebagai ketua, Kepala Bappeda sebagai koordinator merangkap
 * anggota, dan seluruh Kepala Perangkat Daerah sebagai anggota.
 *
 * Sebelum ini satu peran hanya bisa diisi satu baris, sehingga susunan tim itu
 * tidak dapat direkam dan bagan strukturnya menampilkan satu kotak saja untuk
 * seluruh tim.
 *
 * Dibiarkan boleh kosong: peran yang memang dipangku satu orang — Koordinator
 * Penyelenggaraan, Unit Kepatuhan, dan Penanggung Jawab Pengawasan — tidak
 * perlu menyebut kedudukan apa pun.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('struktur_pengelola_risiko', 'kedudukan')) {
            return;
        }

        Schema::table('struktur_pengelola_risiko', function (Blueprint $table) {
            $table->string('kedudukan', 30)
                ->nullable()
                ->after('peran')
                ->comment('Kedudukan dalam tim: ketua, koordinator, atau anggota');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('struktur_pengelola_risiko', 'kedudukan')) {
            Schema::table('struktur_pengelola_risiko', function (Blueprint $table) {
                $table->dropColumn('kedudukan');
            });
        }
    }
};
