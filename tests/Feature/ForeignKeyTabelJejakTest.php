<?php

namespace Tests\Feature;

use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Penjaga temuan R-08 — dua foreign key terakhir yang memang bisa dipasang.
 *
 * Audit menulis "31 dari 61 tabel tanpa foreign key". Diukur ulang pada basis
 * data sungguhan, angkanya jauh berbeda: 49 foreign key SUDAH ada, dan dari
 * 14 kolom rujukan yang belum, 12 POLIMORFIK — menunjuk lebih dari satu tabel,
 * jadi foreign key mustahil, bukan kelalaian. Tersisa dua, dan keduanya kini
 * terpasang.
 *
 * Yang dijaga di sini bukan sekadar "constraint-nya ada", melainkan
 * PERILAKUNYA: rujukan menggantung ditolak, dan jejak ikut terhapus bersama
 * induknya. Constraint yang ada tetapi tidak menahan apa-apa sama tak
 * bergunanya dengan yang tidak ada.
 */
class ForeignKeyTabelJejakTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<int, string> */
    private function foreignKey(string $tabel): array
    {
        return collect(DB::select(
            'SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
              WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL',
            [DB::getDatabaseName(), $tabel]
        ))->pluck('CONSTRAINT_NAME')->all();
    }

    public function test_kedua_foreign_key_terpasang(): void
    {
        $this->assertContains('fk_iro_pd_tahap_asli_iro_pd', $this->foreignKey('tbl_iro_pd_tahap_asli'));
        $this->assertContains('fk_krs_pemda_opd_asli_baris', $this->foreignKey('tbl_krs_pemda_opd_asli'));
    }

    /** Rujukan ke baris yang tidak ada harus DITOLAK, bukan diterima diam-diam. */
    public function test_rujukan_menggantung_ditolak(): void
    {
        $this->expectException(QueryException::class);

        DB::table('tbl_krs_pemda_opd_asli')->insert([
            'baris_id' => 999999,
            'kolom' => 'OPD IK PROGRAM',
            'nilai_asli' => 'Tidak Ada',
            'diubah_pada' => now(),
        ]);
    }

    /**
     * Jejak ikut terhapus saat induknya dihapus PERMANEN.
     *
     * Penghapusan lunak sengaja tidak diuji di sini karena memang tidak boleh
     * memicu cascade — barisnya masih ada, dan jejaknya harus tetap utuh
     * selama induknya masih bisa dipulihkan lewat menu Data Terhapus.
     */
    public function test_jejak_ikut_terhapus_saat_induk_dihapus_permanen(): void
    {
        $indukId = DB::table('tbl_krs_pemda')->insertGetId([
            'VISI' => 'UJI', 'MISI' => 'UJI',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        DB::table('tbl_krs_pemda_opd_asli')->insert([
            'baris_id' => $indukId,
            'kolom' => 'OPD IK PROGRAM',
            'nilai_asli' => 'Dinas Uji',
            'diubah_pada' => now(),
        ]);

        $this->assertSame(1, DB::table('tbl_krs_pemda_opd_asli')->where('baris_id', $indukId)->count());

        DB::table('tbl_krs_pemda')->where('id', $indukId)->delete();

        $this->assertSame(
            0,
            DB::table('tbl_krs_pemda_opd_asli')->where('baris_id', $indukId)->count(),
            'Jejak tidak ikut terhapus — cascade tidak bekerja.'
        );
    }
}
