<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Indeks untuk kolom yang dipakai menyaring tetapi belum berindeks:
 * deleted_at pada tabel soft-delete (setiap kueri Eloquent menambah
 * `where deleted_at is null`), status/peran/jenis ERPIKA yang dipakai
 * rekap capaian, dan tahun_penilaian data umum. Hanya menambah indeks —
 * tidak satu pun nilai baris berubah. Idempoten: lewati bila sudah ada.
 */
return new class extends Migration
{
    private array $indeks = [
        'rpps' => ['deleted_at'],
        'employees' => ['deleted_at'],
        'rpp_penugasan' => ['status'],
        'rpp_team_members' => ['role'],
        'rpp_laporans' => ['jenis'],
        'data_umum' => ['tahun_penilaian'],
        'program_bupati_risiko' => ['deleted_at'],
        'pkpt_area_pengawasan' => ['deleted_at'],
        'pkpt_kematangan_mr' => ['deleted_at'],
        'fraud_risiko' => ['deleted_at'],
        'struktur_pengelola_risiko' => ['deleted_at'],
        'arahan_penilaian_risiko' => ['deleted_at', 'status'],
        'tbl_iro_pd' => ['deleted_at'],
        'tbl_irs_pd' => ['deleted_at'],
        'tbl_irs_pemda' => ['deleted_at'],
    ];

    private function ada(string $tabel, string $nama): bool
    {
        foreach (Schema::getIndexes($tabel) as $i) {
            if ($i['name'] === $nama) {
                return true;
            }
        }

        return false;
    }

    public function up(): void
    {
        foreach ($this->indeks as $tabel => $kolom) {
            if (! Schema::hasTable($tabel)) {
                continue;
            }
            foreach ($kolom as $k) {
                $nama = $tabel.'_'.$k.'_index';
                if (! Schema::hasColumn($tabel, $k) || $this->ada($tabel, $nama)) {
                    continue;
                }
                Schema::table($tabel, fn (Blueprint $t) => $t->index($k, $nama));
            }
        }
    }

    public function down(): void
    {
        foreach ($this->indeks as $tabel => $kolom) {
            if (! Schema::hasTable($tabel)) {
                continue;
            }
            foreach ($kolom as $k) {
                $nama = $tabel.'_'.$k.'_index';
                if ($this->ada($tabel, $nama)) {
                    Schema::table($tabel, fn (Blueprint $t) => $t->dropIndex($nama));
                }
            }
        }
    }
};
