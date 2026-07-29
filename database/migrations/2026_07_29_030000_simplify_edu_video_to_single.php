<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Video edukasi disederhanakan jadi SATU video saja.
     *
     * Versi ringkas yang lama dihapus karena isinya keliru pada dua hal
     * mendasar: menyebut alur ISO 31000 sebagai "lima tahap Perdep", dan
     * menyatakan Skala Risiko = dampak x kemungkinan (sebenarnya tabel
     * peringkat 1-25 yang membobot dampak). Membiarkannya tetap bisa dipilih
     * berarti membiarkan pengguna diajari hal yang salah, jadi pemilih
     * Video 1/Video 2 ikut dibuang — bukan sekadar disembunyikan.
     *
     * `edu_video_path` (unggahan kustom admin) dan ketiga kolom gain
     * DIPERTAHANKAN: keduanya masih dipakai.
     */
    public function up(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->dropColumn(['edu_video_2_path', 'edu_video_active']);
        });
    }

    public function down(): void
    {
        Schema::table('settingapp', function (Blueprint $table) {
            $table->string('edu_video_2_path')->nullable()->after('edu_video_path');
            $table->unsignedTinyInteger('edu_video_active')->default(2)->after('edu_video_2_path');
        });
    }
};
