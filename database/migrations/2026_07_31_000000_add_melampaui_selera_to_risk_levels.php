<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Selera Risiko sebagai data, bukan lagi ambang tetap di dalam kode.
 *
 * Perdep PPKD 4/2019 menyebut penetapan area yang menjadi Risiko Prioritas
 * dipengaruhi selera Risiko atau preferensi manajemen pemerintah daerah, dan
 * sisa Risiko harus dibawa ke tingkat yang berada dalam selera Risiko itu.
 * Sebelum ini aplikasi menganggap batasnya selalu berada antara Sedang dan
 * Tinggi, karena ambangnya dicari dengan mencocokkan label "Tinggi" dan
 * "Sangat Tinggi" — nama level yang kebetulan dipakai sekarang.
 *
 * Penanda per level dipilih, bukan satu kolom "ambang" pada tabel pengaturan,
 * karena batas selera pada matriks Risiko bukan satu garis lurus: ia mengikuti
 * bentuk bertangga sel-sel yang levelnya melampaui selera. Dengan penanda per
 * level, garis itu terhitung sendiri dan ikut bergeser begitu penandanya
 * dipindahkan — misalnya bila kelak selera diturunkan ke antara Rendah dan
 * Sedang.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('risk_levels', 'melampaui_selera')) {
            return;
        }

        Schema::table('risk_levels', function (Blueprint $table) {
            $table->boolean('melampaui_selera')
                ->default(false)
                ->after('warna_class')
                ->comment('Level ini berada di luar Selera Risiko, sehingga risikonya menjadi Risiko Prioritas');
        });

        // Pertahankan perilaku yang berlaku sebelum migrasi ini: batasnya di
        // antara Sedang dan Tinggi. Dicocokkan tanpa memperhatikan besar-kecil
        // huruf karena label diketik Admin lewat halaman Keterangan Pendukung.
        DB::table('risk_levels')
            ->whereIn(DB::raw('LOWER(label)'), ['tinggi', 'sangat tinggi'])
            ->update(['melampaui_selera' => true]);
    }

    public function down(): void
    {
        if (Schema::hasColumn('risk_levels', 'melampaui_selera')) {
            Schema::table('risk_levels', function (Blueprint $table) {
                $table->dropColumn('melampaui_selera');
            });
        }
    }
};
