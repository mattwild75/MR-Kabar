<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Uji coba penerapan pengendalian pada Form 9 Pemantauan.
 *
 * Perdep PPKD 4/2019 halaman berlabel 76 merinci enam langkah membangun
 * infrastruktur pengendalian. Langkah keempat adalah "Melakukan uji coba
 * penerapan pengendalian", dan langkah kelima "Menyempurnakan rancangan
 * infrastruktur pengendalian berdasarkan hasil pelaksanaan uji coba" —
 * sehingga hasil uji coba bukan catatan tambahan, melainkan dasar penyempurnaan
 * rancangan sebelum pengendalian ditetapkan berlaku.
 *
 * Aplikasi sebelumnya melompat dari rencana pemantauan langsung ke realisasi,
 * tanpa tempat merekam bahwa pengendaliannya pernah diuji lebih dulu.
 *
 * Ditempatkan pada monitoring_rtp, bukan tabel tersendiri, karena satu RTP
 * hanya punya satu tahap uji coba dan seluruh kolom Form 8 dan Form 9 memang
 * sudah berada di baris yang sama.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('monitoring_rtp', 'uji_coba_triwulan')) {
            return;
        }

        Schema::table('monitoring_rtp', function (Blueprint $table) {
            $table->string('uji_coba_triwulan')->nullable()->after('tahun_rencana_pemantauan');
            $table->unsignedSmallInteger('uji_coba_tahun')->nullable()->after('uji_coba_triwulan');
            // Bukan sekadar "sudah/belum": langkah kelima Perdep menyempurnakan
            // rancangan BERDASARKAN hasilnya, jadi hasilnya harus dapat
            // diuraikan, bukan cuma ditandai selesai.
            $table->text('uji_coba_hasil')->nullable()->after('uji_coba_tahun');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('monitoring_rtp', 'uji_coba_triwulan')) {
            Schema::table('monitoring_rtp', function (Blueprint $table) {
                $table->dropColumn(['uji_coba_triwulan', 'uji_coba_tahun', 'uji_coba_hasil']);
            });
        }
    }
};
