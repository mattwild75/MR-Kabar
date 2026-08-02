<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kolom yang disaring pada SETIAP pemuatan halaman tetapi belum berindeks.
     *
     * Tiga yang pertama ditambahkan bersama penyaring Periode/Tahun Penilaian
     * dan kolomnya dibuat tanpa indeks — kelalaian yang tidak terasa sekarang
     * karena tabelnya masih ratusan baris, tetapi memburuk seiring tahun
     * penilaian bertambah.
     *
     * `deleted_at` lebih mendasar: seluruh model risiko memakai hapus-lunak,
     * sehingga SETIAP kueri menambahkan `where deleted_at is null`. Tiga tabel
     * sudah berindeks sejak awal, enam lainnya belum — jadi ini juga
     * menyeragamkan sesuatu yang setengah jalan.
     */
    private const PENYARING = [
        'tbl_krs_pemda' => ['PERIODE PENILAIAN'],
        'tbl_krs_pd' => ['PERIODE PENILAIAN'],
        'tbl_kro_pd' => ['TAHUN PENILAIAN'],
    ];

    private const SOFT_DELETE = [
        'tbl_krs_pemda', 'tbl_krs_pd', 'tbl_kro_pd',
        'monitoring_rtp', 'cee_jawaban',
        'pencatatan_kejadian_risiko', 'laporan_kejadian_risiko',
    ];

    public function up(): void
    {
        foreach (self::PENYARING as $tabel => $kolom) {
            foreach ($kolom as $k) {
                $this->tambah($tabel, $k);
            }
        }
        foreach (self::SOFT_DELETE as $tabel) {
            $this->tambah($tabel, 'deleted_at');
        }
    }

    public function down(): void
    {
        foreach (self::PENYARING as $tabel => $kolom) {
            foreach ($kolom as $k) {
                $this->buang($tabel, $k);
            }
        }
        foreach (self::SOFT_DELETE as $tabel) {
            $this->buang($tabel, 'deleted_at');
        }
    }

    /** Nama indeks dibuat sendiri: nama kolom di sini memuat spasi. */
    private function nama(string $tabel, string $kolom): string
    {
        return $tabel . '_' . str_replace(' ', '_', mb_strtolower($kolom)) . '_index';
    }

    private function tambah(string $tabel, string $kolom): void
    {
        if (! Schema::hasTable($tabel) || ! Schema::hasColumn($tabel, $kolom)) {
            return;
        }
        $nama = $this->nama($tabel, $kolom);
        $ada = collect(DB::select("SHOW INDEX FROM `{$tabel}`"))->pluck('Key_name')->contains($nama);
        if ($ada) {
            return;
        }
        Schema::table($tabel, fn (Blueprint $t) => $t->index([$kolom], $nama));
    }

    private function buang(string $tabel, string $kolom): void
    {
        if (! Schema::hasTable($tabel)) {
            return;
        }
        $nama = $this->nama($tabel, $kolom);
        if (! collect(DB::select("SHOW INDEX FROM `{$tabel}`"))->pluck('Key_name')->contains($nama)) {
            return;
        }
        Schema::table($tabel, fn (Blueprint $t) => $t->dropIndex($nama));
    }
};
