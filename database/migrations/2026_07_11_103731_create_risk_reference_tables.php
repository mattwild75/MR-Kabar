<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Memindahkan 6 data referensi risiko yang sebelumnya hardcoded di kode
 * (frontend irs-reference-data.ts + duplikasi 3x di IrsPemda/IrsPd/IroPd
 * Controller) menjadi tabel database yang bisa diedit Admin/Super Admin
 * lewat menu Settings > Keterangan Pendukung. OPD TIDAK dibuat di sini
 * karena sudah punya tabel `opd` sendiri sejak awal.
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. Kriteria Dampak — 5 level x 5 area/kategori (kolom teks tetap,
        // BUKAN generik key-value, supaya form edit WYSIWYG per kolom).
        Schema::create('risk_impact_criteria', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('level')->unique(); // 1-5
            $table->text('kerugian_negara')->nullable();
            $table->text('penurunan_reputasi')->nullable();
            $table->text('penurunan_kinerja')->nullable();
            $table->text('gangguan_pelayanan')->nullable();
            $table->text('tuntutan_hukum')->nullable();
            $table->timestamps();
        });

        // 2. Kriteria Kemungkinan — 5 level x nama/probabilitas/frekuensi/toleransi.
        Schema::create('risk_likelihood_criteria', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('level')->unique(); // 1-5
            $table->string('nama');
            $table->text('probabilitas')->nullable();
            $table->text('frekuensi')->nullable();
            $table->text('toleransi')->nullable();
            $table->timestamps();
        });

        // 3. Matriks Analisis Risiko — 25 baris eksplisit (dampak x
        // kemungkinan), tiap sel py skala risiko & warna sendiri yg bisa
        // diedit admin satu-satu (bukan dihitung rumus).
        Schema::create('risk_matrix_cells', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('dampak'); // 1-5
            $table->unsignedTinyInteger('kemungkinan'); // 1-5
            $table->unsignedTinyInteger('skala_risiko'); // 1-25
            $table->string('warna_class'); // tailwind class, mis. "bg-red-500 text-white"
            $table->timestamps();
            $table->unique(['dampak', 'kemungkinan']);
        });

        // 4. Tabel Level Risiko — band skala risiko (mis. 20-25) => label
        // (mis. "Sangat Tinggi") + warna. Dipakai badge/legend, TERPISAH
        // dari warna per-sel matriks (yg lebih granular).
        Schema::create('risk_levels', function (Blueprint $table) {
            $table->id();
            $table->string('label'); // "Sangat Tinggi", "Tinggi", dst
            $table->unsignedTinyInteger('skala_min');
            $table->unsignedTinyInteger('skala_max');
            $table->string('warna_class');
            $table->unsignedInteger('urutan')->default(0);
            $table->timestamps();
        });

        // 5. Jenis Risiko — 41 kode urusan pemerintahan (dipakai combobox
        // JENIS RISIKO di form IRS Pemda/PD/IRO PD).
        Schema::create('risk_jenis', function (Blueprint $table) {
            $table->id();
            $table->string('kode'); // "1", "33", dst (angka sbg string)
            $table->string('nama');
            $table->unsignedInteger('urutan')->default(0);
            $table->timestamps();
        });

        // 6. Entitas Penilai Risiko — daftar OPD/entitas yg bisa dipilih di
        // field ENTITAS PD YANG MENILAI (independen dari tabel `opd` utama
        // krn field ini secara historis adalah daftar konstan terpisah,
        // bukan relasi langsung ke tabel opd).
        Schema::create('risk_entitas_penilai', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->unsignedInteger('urutan')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('risk_entitas_penilai');
        Schema::dropIfExists('risk_jenis');
        Schema::dropIfExists('risk_levels');
        Schema::dropIfExists('risk_matrix_cells');
        Schema::dropIfExists('risk_likelihood_criteria');
        Schema::dropIfExists('risk_impact_criteria');
    }
};
