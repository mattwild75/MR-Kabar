<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * RPP disusun ulang mengikuti dokumen aslinya (berkas RPP*.xls Bagian
 * Perencanaan): SATU dokumen RPP — nomor, bulan, tanggal, tarif per hari —
 * memuat BEBERAPA penugasan bernomor urut, dan tiap penugasan punya obrik,
 * sifat audit, jumlah laporan, TMT, serta tim dengan hari DK/LK sendiri.
 *
 * Sebelumnya `rpps` adalah satu penugasan, dan dokumen yang sama tercerai
 * menjadi beberapa baris bernomor sama (111 baris untuk 36 nomor pada 2024).
 * Migrasi ini menyatukannya: baris pertama tiap nomor menjadi dokumen, semua
 * baris bernomor sama menjadi penugasan di bawahnya, dan tim/obrik/laporan
 * dipindahkan ke penugasan.
 *
 * Perubahan sertaan:
 *   - peran tim bertambah `penanggung_jawab` (Inspektur di baris pertama tiap
 *     tim; sebelumnya terpaksa dicatat sebagai koordinator/anggota);
 *   - tarif per hari bisa berbeda per dokumen dan per anggota (data 2025:
 *     100.000, 140.000, hingga 450.000 untuk Inspektur);
 *   - kategori mendapat kode nomor (Rev, AKh, AO, ...) dan sebutan untuk surat
 *     pengantar;
 *   - penanda tangan hanya Inspektur: pegawai dengan jabatan "Inspektur",
 *     bukan pilihan di pengaturan (kolom inspektur_employee_id dilepas).
 *
 * TIDAK DAPAT DIBALIK secara utuh: down() hanya mengembalikan skema, bukan
 * data. Pulihkan dari snapshot versi bila perlu mundur.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rpp_categories', function (Blueprint $table) {
            $table->string('kode_nomor', 10)->nullable()->after('name');
            $table->string('sebutan')->nullable()->after('kode_nomor');
            $table->string('tujuan_surat')->nullable()->after('sebutan');
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->string('jabatan')->nullable()->after('golongan');
        });

        Schema::create('rpp_penugasan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rpp_id')->constrained('rpps')->cascadeOnDelete();
            $table->unsignedSmallInteger('urutan')->default(1);
            $table->text('uraian')->nullable();
            $table->string('sifat')->nullable();
            $table->unsignedSmallInteger('jumlah_laporan')->nullable();
            $table->date('masa_tugas_mulai')->nullable();
            $table->date('masa_tugas_selesai')->nullable();
            $table->string('tmt_teks')->nullable();
            $table->string('nomor_sp')->nullable();
            $table->string('nomor_st')->nullable();
            $table->date('tanggal_st')->nullable();
            $table->string('nomor_kp')->nullable();
            $table->string('capaian_output')->nullable();
            $table->enum('status', ['draft', 'st_terbit', 'selesai', 'lhp_terbit'])->default('draft');
            $table->timestamps();
        });

        // Kolom dokumen baru
        Schema::table('rpps', function (Blueprint $table) {
            $table->string('judul')->nullable()->after('nomor_rpp');
            $table->string('sub_judul')->nullable()->after('judul');
            $table->unsignedInteger('tarif_per_hari')->nullable()->after('tanggal_rpp');
            $table->date('tanggal_surat')->nullable()->after('tarif_per_hari');
            $table->string('hal')->nullable()->after('surat_dasar_uraian');
            $table->string('tujuan_surat')->nullable()->after('hal');
            $table->boolean('dengan_penutup')->default(true)->after('tujuan_surat');
        });

        // Anak-anak menunjuk ke penugasan
        foreach (['rpp_team_members', 'rpp_obriks', 'rpp_laporans'] as $tabel) {
            Schema::table($tabel, function (Blueprint $table) {
                $table->foreignId('rpp_penugasan_id')->nullable()->after('rpp_id')->constrained('rpp_penugasan')->cascadeOnDelete();
            });
        }
        Schema::table('rpp_team_members', function (Blueprint $table) {
            $table->unsignedInteger('tarif_per_hari')->nullable()->after('hari_lapangan');
            $table->string('peran_teks')->nullable()->after('role');
        });
        DB::statement("ALTER TABLE rpp_team_members MODIFY role ENUM('penanggung_jawab','koordinator','ppj','ketua_tim','anggota_tim') NOT NULL");

        // --- pindahkan data ---
        $baris = DB::table('rpps')->orderBy('year')->orderBy('nomor_rpp')->orderBy('id')->get();
        $dokumenPerNomor = [];
        $urutan = [];
        foreach ($baris as $r) {
            $kunci = $r->year.'|'.$r->nomor_rpp;
            if (! isset($dokumenPerNomor[$kunci])) {
                $dokumenPerNomor[$kunci] = $r->id;
                $urutan[$kunci] = 0;
            }
            $dokumenId = $dokumenPerNomor[$kunci];
            $urutan[$kunci]++;

            $penugasanId = DB::table('rpp_penugasan')->insertGetId([
                'rpp_id' => $dokumenId,
                'urutan' => $urutan[$kunci],
                'uraian' => $r->uraian,
                'masa_tugas_mulai' => $r->masa_tugas_mulai,
                'masa_tugas_selesai' => $r->masa_tugas_selesai,
                'nomor_st' => $r->nomor_st,
                'tanggal_st' => $r->tanggal_st,
                'capaian_output' => $r->capaian_output,
                'status' => $r->status,
                'created_at' => $r->created_at,
                'updated_at' => $r->updated_at,
            ]);
            foreach (['rpp_team_members', 'rpp_obriks', 'rpp_laporans'] as $tabel) {
                DB::table($tabel)->where('rpp_id', $r->id)->update(['rpp_penugasan_id' => $penugasanId]);
            }
        }
        // Inspektur di urutan pertama tiap tim = penanggung jawab
        DB::table('rpp_team_members')->where('order', 0)->where('nama', 'like', 'Zakaria%')->update(['role' => 'penanggung_jawab']);

        // Lepas kunci asing rpp_id pada anak-anak DULU — mereka masih ber-
        // onDelete(cascade) ke rpps, dan baris rpps yang bukan dokumen akan
        // dihapus sesudah ini. Urutan terbalik = tim/obrik/laporan ikut terhapus.
        foreach (['rpp_team_members', 'rpp_obriks', 'rpp_laporans'] as $tabel) {
            Schema::table($tabel, function (Blueprint $table) {
                $table->dropConstrainedForeignId('rpp_id');
            });
            DB::statement("ALTER TABLE {$tabel} MODIFY rpp_penugasan_id BIGINT UNSIGNED NOT NULL");
        }

        // buang baris rpps yang bukan dokumen (sudah menjadi penugasan)
        $dipertahankan = array_values($dokumenPerNomor);
        if ($dipertahankan !== []) {
            DB::table('rpps')->whereNotIn('id', $dipertahankan)->delete();
        }

        Schema::table('rpps', function (Blueprint $table) {
            $table->dropColumn(['nomor_st', 'tanggal_st', 'uraian', 'masa_tugas_mulai', 'masa_tugas_selesai', 'capaian_output', 'status']);
            $table->unique(['nomor_rpp', 'year']);
        });

        // Penanda tangan: pegawai berjabatan Inspektur
        $inspekturId = DB::table('rpp_settings')->value('inspektur_employee_id');
        if ($inspekturId) {
            DB::table('employees')->where('id', $inspekturId)->update(['jabatan' => 'Inspektur']);
        }
        if (! DB::table('employees')->where('jabatan', 'Inspektur')->exists()) {
            DB::table('employees')->where('nama', 'like', 'Zakaria%')->limit(1)->update(['jabatan' => 'Inspektur']);
        }
        Schema::table('rpp_settings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('inspektur_employee_id');
        });
    }

    public function down(): void
    {
        Schema::table('rpp_settings', function (Blueprint $table) {
            $table->foreignId('inspektur_employee_id')->nullable()->constrained('employees')->nullOnDelete();
        });
        Schema::table('rpps', function (Blueprint $table) {
            $table->dropUnique(['nomor_rpp', 'year']);
            $table->string('nomor_st')->nullable();
            $table->date('tanggal_st')->nullable();
            $table->text('uraian')->nullable();
            $table->date('masa_tugas_mulai')->nullable();
            $table->date('masa_tugas_selesai')->nullable();
            $table->string('capaian_output')->nullable();
            $table->enum('status', ['draft', 'st_terbit', 'selesai', 'lhp_terbit'])->default('draft');
            $table->dropColumn(['judul', 'sub_judul', 'tarif_per_hari', 'tanggal_surat', 'hal', 'tujuan_surat', 'dengan_penutup']);
        });
        foreach (['rpp_team_members', 'rpp_obriks', 'rpp_laporans'] as $tabel) {
            Schema::table($tabel, function (Blueprint $table) {
                $table->foreignId('rpp_id')->nullable()->constrained('rpps')->cascadeOnDelete();
                $table->dropConstrainedForeignId('rpp_penugasan_id');
            });
        }
        Schema::table('rpp_team_members', function (Blueprint $table) {
            $table->dropColumn(['tarif_per_hari', 'peran_teks']);
        });
        Schema::dropIfExists('rpp_penugasan');
        Schema::table('employees', fn (Blueprint $table) => $table->dropColumn('jabatan'));
        Schema::table('rpp_categories', fn (Blueprint $table) => $table->dropColumn(['kode_nomor', 'sebutan', 'tujuan_surat']));
    }
};
