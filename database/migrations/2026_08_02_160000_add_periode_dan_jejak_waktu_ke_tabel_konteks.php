<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Menyekat tabel konteks per periode/tahun, dan memberinya jejak waktu.
     *
     * DUA persoalan yang diperbaiki sekaligus, karena keduanya berakar sama:
     * tabel konteks selama ini tidak punya penanda waktu apa pun.
     *
     * 1. TIDAK BERSEKAT. Ketiganya menumpuk lintas tahun tanpa pemisah,
     *    sehingga konteks periode Renstra lama dan baru berdampingan tanpa ada
     *    yang bisa membedakan. Sekarang:
     *      - KRS Pemda dan KRS PD disekat PERIODE PENILAIAN (mis. 2025-2029),
     *        karena keduanya menurunkan RPJMD dan Renstra yang memang berlaku
     *        lima tahunan;
     *      - KRO PD disekat TAHUN PENILAIAN, karena ia turun sampai kegiatan
     *        yang anggarannya ditetapkan tahunan lewat Renja dan DPA.
     *    Sekatnya mengikuti Data Umum: kolom Periode Penilaian untuk yang
     *    pertama, Tahun Penilaian untuk yang kedua.
     *
     * 2. TANPA JEJAK WAKTU. `tbl_krs_pemda` tidak punya kolom created_at sama
     *    sekali; dua yang lain punya kolomnya tetapi tidak pernah terisi karena
     *    modelnya menyetel $timestamps = false. Akibatnya tidak ada cara
     *    mengetahui kapan konteks diisi atau terakhir diubah — dan setiap hari
     *    yang lewat menambah baris tanpa jejak yang tidak bisa dipulihkan
     *    mundur.
     *
     * Baris lama diisi mundur dari Data Umum pemiliknya; yang tidak punya Data
     * Umum memakai setelan Pemda yang berlaku. Waktu pembuatan baris lama
     * TIDAK dikarang — dibiarkan kosong, karena menuliskan waktu yang bukan
     * sebenarnya lebih buruk daripada mengaku tidak tahu.
     */
    public function up(): void
    {
        Schema::table('tbl_krs_pemda', function (Blueprint $table) {
            $table->string('PERIODE PENILAIAN', 20)->nullable()->after('SATUAN IK SASARAN RPJMD');
            $table->timestamps();
        });

        Schema::table('tbl_krs_pd', function (Blueprint $table) {
            $table->string('PERIODE PENILAIAN', 20)->nullable()->after('user_id');
        });

        Schema::table('tbl_kro_pd', function (Blueprint $table) {
            $table->unsignedSmallInteger('TAHUN PENILAIAN')->nullable()->after('user_id');
        });

        $pengaturan = DB::table('pengaturan_pemda')->first();
        $tahunBerlaku = (int) ($pengaturan->tahun_penilaian ?? now()->year);

        // Periode yang paling banyak dipakai di Data Umum dijadikan acuan untuk
        // baris yang pemiliknya belum pernah mengisi Data Umum.
        $periodeUmum = DB::table('data_umum')
            ->whereNotNull('periode_penilaian')->where('periode_penilaian', '<>', '')
            ->select('periode_penilaian', DB::raw('count(*) as n'))
            ->groupBy('periode_penilaian')->orderByDesc('n')->value('periode_penilaian')
            ?: ($tahunBerlaku . '-' . ($tahunBerlaku + 4));

        // KRS Pemda lintas-OPD, jadi seluruh barisnya memakai periode acuan.
        DB::table('tbl_krs_pemda')->update(['PERIODE PENILAIAN' => $periodeUmum]);

        // KRS PD dan KRO PD dimiliki per-PIC, jadi diisi dari Data Umum
        // pemiliknya masing-masing. Satu PIC bisa punya beberapa baris Data
        // Umum (satu per tahun); yang dipakai yang terbaru.
        foreach (DB::table('tbl_krs_pd')->select('user_id')->distinct()->pluck('user_id') as $uid) {
            $periode = DB::table('data_umum')->where('user_id', $uid)
                ->whereNotNull('periode_penilaian')->where('periode_penilaian', '<>', '')
                ->orderByDesc('tahun_penilaian')->value('periode_penilaian') ?: $periodeUmum;
            DB::table('tbl_krs_pd')->where('user_id', $uid)
                ->update(['PERIODE PENILAIAN' => $periode]);
        }

        foreach (DB::table('tbl_kro_pd')->select('user_id')->distinct()->pluck('user_id') as $uid) {
            $tahun = DB::table('data_umum')->where('user_id', $uid)
                ->orderByDesc('tahun_penilaian')->value('tahun_penilaian') ?: $tahunBerlaku;
            DB::table('tbl_kro_pd')->where('user_id', $uid)
                ->update(['TAHUN PENILAIAN' => (int) $tahun]);
        }
    }

    public function down(): void
    {
        Schema::table('tbl_krs_pemda', function (Blueprint $table) {
            $table->dropColumn(['PERIODE PENILAIAN', 'created_at', 'updated_at']);
        });
        Schema::table('tbl_krs_pd', function (Blueprint $table) {
            $table->dropColumn('PERIODE PENILAIAN');
        });
        Schema::table('tbl_kro_pd', function (Blueprint $table) {
            $table->dropColumn('TAHUN PENILAIAN');
        });
    }
};
