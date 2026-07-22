<?php

namespace App\Support;

use App\Models\IroPd;
use App\Models\IrsPd;
use App\Models\IrsPemda;
use App\Models\KroPd;
use App\Models\KrsPd;
use App\Models\KrsPemda;
use App\Services\KrsIrsPdSyncService;
use App\Services\KrsIrsSyncService;
use App\Services\KroIroPdSyncService;

/**
 * Satu-satunya sumber kebenaran utk ekspor/impor Excel seluruh Form Input
 * (Settings > Backup > Excel) — dipakai baik oleh RiskExcelExportService
 * maupun RiskExcelImportService. Menambah modul Form Input baru di masa
 * depan (mis. "Rencana dan Realisasi Pemantauan atas Kegiatan Pengendalian
 * Intern") cukup menambah satu entry array di modules() — mekanisme
 * ekspor/impor/template lainnya tidak perlu diubah.
 *
 * Rule validasi di sini SENGAJA mereplikasi (bukan mereferensikan) rule di
 * masing-masing controller's validated(), karena keenam controller memakai
 * $request->validate() inline, bukan FormRequest terpisah yang bisa dipakai
 * ulang. Kalau validasi salah satu controller berubah, registry ini harus
 * disinkronkan manual — known tradeoff, dicatat di plan implementasi.
 */
class RiskExcelRegistry
{
    private const TRIWULAN_OPTIONS = ['I', 'II', 'III', 'IV'];

    public static function modules(): array
    {
        return [
            'krs_pemda' => [
                'model' => KrsPemda::class,
                'sheet_name' => 'I_a_KRS_Pemda',
                'label' => 'I_a KRS Pemda',
                'table' => 'tbl_krs_pemda',
                'scope' => 'global',
                'fields' => [
                    'VISI', 'MISI', 'TUJUAN RPJMD', 'IK TUJUAN RPJMD', 'BASELINE IK TUJUAN RPJMD',
                    'TARGET IK TUJUAN RPJMD', 'SATUAN IK TUJUAN RPJMD', 'OPD IK TUJUAN RPJMD',
                    'SASARAN RPJMD', 'IK SASARAN RPJMD', 'BASELINE IK SASARAN RPJMD',
                    'TARGET IK SASARAN RPJMD', 'SATUAN IK SASARAN RPJMD', 'OPD IK SASARAN RPJMD',
                    'PROGRAM PRIORITAS', 'OUTCOME PROGRAM PRIORITAS', 'IK PROGRAM', 'BASELINE IK PROGRAM',
                    'TARGET IK PROGRAM', 'SATUAN IK PROGRAM', 'OPD IK PROGRAM', 'OPD PENANGGUNGJAWAB PROGRAM',
                ],
                'required_fields' => ['PROGRAM PRIORITAS', 'OPD PENANGGUNGJAWAB PROGRAM'],
                'computed_fields' => [],
                'constant_fields' => [],
                'input_only_fields' => [],
                'enum_fields' => [],
                'cross_ref' => null,
                'sync' => KrsIrsSyncService::class,
            ],

            'irs_pemda' => [
                'model' => IrsPemda::class,
                'sheet_name' => 'I_b_IRS_Pemda',
                'label' => 'I_b IRS Pemda',
                'table' => 'tbl_irs_pemda',
                'scope' => 'owned',
                'fields' => [
                    'SASARAN RPJMD', 'URAIAN RISIKO', 'TAHUN DINILAI RISIKO', 'JENIS RISIKO',
                    'ENTITAS PD YANG MENILAI', 'PEMILIK RISIKO', 'URAIAN PENYEBAB RISIKO',
                    'SUMBER SEBAB RISIKO', 'C / UC', 'URAIAN DAMPAK RISIKO',
                    'PIHAK YANG TERKENA DAMPAK RISIKO', 'URAIAN PENGENDALIAN YANG SUDAH ADA',
                    'KATEGORI EXISTING CONTROL', 'CELAH PENGENDALIAN', 'RENCANA TINDAK PENGENDALIAN',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN', 'PENANGGUNG JAWAB PENGENDALIAN',
                    'TRIWULAN', 'TAHUN TARGET PENYELESAIAN',
                ],
                'required_fields' => ['URAIAN RISIKO'],
                'computed_fields' => ['SKALA RISIKO', 'SKALA PRIORITAS'],
                'constant_fields' => ['TINGKAT RISIKO' => 'Risiko Strategis Pemda'],
                'input_only_fields' => ['SKALA DAMPAK', 'SKALA KEMUNGKINAN', 'SKALA DAMPAK INHEREN', 'SKALA KEMUNGKINAN INHEREN'],
                'enum_fields' => ['TRIWULAN' => self::TRIWULAN_OPTIONS],
                'cross_ref' => ['field' => 'SASARAN RPJMD', 'parent_module' => 'krs_pemda', 'parent_field' => 'SASARAN RPJMD'],
                'sync' => KrsIrsSyncService::class,
            ],

            'krs_pd' => [
                'model' => KrsPd::class,
                'sheet_name' => 'II_a_KRS_PD',
                'label' => 'II_a KRS PD',
                'table' => 'tbl_krs_pd',
                'scope' => 'owned',
                'fields' => [
                    'SASARAN RPJMD', 'TUJUAN STRATEGIS PD', 'IK TUJUAN STRATEGIS PD',
                    'BASELINE IK TUJUAN STRATEGIS PD', 'TARGET IK TUJUAN STRATEGIS PD',
                    'SATUAN IK TUJUAN STRATEGIS PD', 'SASARAN STRATEGIS PD', 'IK SASARAN STRATEGIS PD',
                    'BASELINE IK SASARAN STRATEGIS PD', 'TARGET IK SASARAN STRATEGIS PD',
                    'SATUAN IK SASARAN STRATEGIS PD', 'PROGRAM PD', 'IK PROGRAM PD',
                    'BASELINE IK PROGRAM PD', 'TARGET IK PROGRAM PD', 'SATUAN IK PROGRAM PD',
                    'KEGIATAN PD', 'IK KEGIATAN PD', 'BASELINE IK KEGIATAN PD', 'TARGET IK KEGIATAN PD',
                    'SATUAN IK KEGIATAN PD', 'SUBKEGIATAN PD', 'IK SUBKEGIATAN PD',
                    'BASELINE IK SUBKEGIATAN PD', 'TARGET IK SUBKEGIATAN PD', 'SATUAN IK SUBKEGIATAN PD',
                    'OPD PENANGGUNG JAWAB KEGIATAN',
                ],
                'required_fields' => ['PROGRAM PD', 'SUBKEGIATAN PD', 'OPD PENANGGUNG JAWAB KEGIATAN'],
                'computed_fields' => [],
                'constant_fields' => [],
                'input_only_fields' => [],
                'enum_fields' => [],
                'cross_ref' => ['field' => 'SASARAN RPJMD', 'parent_module' => 'krs_pemda', 'parent_field' => 'SASARAN RPJMD', 'optional' => true],
                'sync' => KrsIrsPdSyncService::class,
            ],

            'kro_pd' => [
                'model' => KroPd::class,
                'sheet_name' => 'III_a_KRO_PD',
                'label' => 'III_a KRO PD',
                'table' => 'tbl_kro_pd',
                'scope' => 'owned',
                'fields' => [
                    'SASARAN RENSTRA', 'PROGRAM PD', 'IK PROGRAM PD', 'BASELINE IK PROGRAM PD',
                    'TARGET IK PROGRAM PD', 'SATUAN IK PROGRAM PD', 'KEGIATAN PD', 'IK KEGIATAN PD',
                    'BASELINE IK KEGIATAN PD', 'TARGET IK KEGIATAN PD', 'SATUAN IK KEGIATAN PD',
                    'SUBKEGIATAN PD', 'IK SUBKEGIATAN PD', 'BASELINE IK SUBKEGIATAN PD',
                    'TARGET IK SUBKEGIATAN PD', 'SATUAN IK SUBKEGIATAN PD', 'OPD PENANGGUNG JAWAB KEGIATAN',
                ],
                'required_fields' => ['PROGRAM PD', 'SUBKEGIATAN PD', 'OPD PENANGGUNG JAWAB KEGIATAN'],
                'computed_fields' => [],
                'constant_fields' => [],
                'input_only_fields' => [],
                'enum_fields' => [],
                'cross_ref' => ['field' => 'SASARAN RENSTRA', 'parent_module' => 'krs_pd', 'parent_field' => 'SASARAN STRATEGIS PD', 'optional' => true],
                'sync' => KroIroPdSyncService::class,
            ],

            'irs_pd' => [
                'model' => IrsPd::class,
                'sheet_name' => 'II_b_IRS_PD',
                'label' => 'II_b IRS PD',
                'table' => 'tbl_irs_pd',
                'scope' => 'owned',
                'fields' => [
                    'SASARAN RENSTRA', 'URAIAN RISIKO', 'TAHUN DINILAI RISIKO', 'JENIS RISIKO',
                    'ENTITAS PD YANG MENILAI', 'PEMILIK RISIKO', 'URAIAN PENYEBAB RISIKO',
                    'SUMBER SEBAB RISIKO', 'C / UC', 'URAIAN DAMPAK RISIKO',
                    'PIHAK YANG TERKENA DAMPAK RISIKO', 'URAIAN PENGENDALIAN YANG SUDAH ADA',
                    'KATEGORI EXISTING CONTROL', 'CELAH PENGENDALIAN', 'RENCANA TINDAK PENGENDALIAN',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN', 'PENANGGUNG JAWAB PENGENDALIAN',
                    'TRIWULAN', 'TAHUN TARGET PENYELESAIAN',
                ],
                'required_fields' => ['URAIAN RISIKO'],
                'computed_fields' => ['SKALA RISIKO', 'SKALA PRIORITAS'],
                'constant_fields' => ['TINGKAT RISIKO' => 'Risiko Strategis OPD'],
                'input_only_fields' => ['SKALA DAMPAK', 'SKALA KEMUNGKINAN', 'SKALA DAMPAK INHEREN', 'SKALA KEMUNGKINAN INHEREN'],
                'enum_fields' => ['TRIWULAN' => self::TRIWULAN_OPTIONS],
                'cross_ref' => ['field' => 'SASARAN RENSTRA', 'parent_module' => 'krs_pd', 'parent_field' => 'SASARAN STRATEGIS PD'],
                'sync' => KrsIrsPdSyncService::class,
            ],

            'iro_pd' => [
                'model' => IroPd::class,
                'sheet_name' => 'III_b_IRO_PD',
                'label' => 'III_b IRO PD',
                'table' => 'tbl_iro_pd',
                'scope' => 'owned',
                'fields' => [
                    'KEGIATAN PD', 'URAIAN RISIKO', 'TAHUN DINILAI RISIKO', 'JENIS RISIKO',
                    'ENTITAS PD YANG MENILAI', 'TAHAP', 'PEMILIK RISIKO', 'URAIAN PENYEBAB RISIKO',
                    'SUMBER SEBAB RISIKO', 'C / UC', 'URAIAN DAMPAK RISIKO',
                    'PIHAK YANG TERKENA DAMPAK RISIKO', 'URAIAN PENGENDALIAN YANG SUDAH ADA',
                    'KATEGORI EXISTING CONTROL', 'CELAH PENGENDALIAN', 'RENCANA TINDAK PENGENDALIAN',
                    'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN', 'PENANGGUNG JAWAB PENGENDALIAN',
                    'TRIWULAN', 'TAHUN TARGET PENYELESAIAN',
                ],
                'required_fields' => ['URAIAN RISIKO'],
                'computed_fields' => ['SKALA RISIKO', 'SKALA PRIORITAS'],
                'constant_fields' => ['TINGKAT RISIKO' => 'Risiko Operasional OPD'],
                'input_only_fields' => ['SKALA DAMPAK', 'SKALA KEMUNGKINAN', 'SKALA DAMPAK INHEREN', 'SKALA KEMUNGKINAN INHEREN'],
                'enum_fields' => ['TRIWULAN' => self::TRIWULAN_OPTIONS],
                'cross_ref' => ['field' => 'KEGIATAN PD', 'parent_module' => 'kro_pd', 'parent_field' => 'KEGIATAN PD'],
                'sync' => KroIroPdSyncService::class,
            ],
        ];
    }

    /**
     * Urutan dependency utk import (parent sebelum child) & untuk memutuskan
     * urutan sync service yang dijalankan ulang setelah tulis — krs_pemda
     * duluan, lalu (irs_pemda, krs_pd), lalu (irs_pd, kro_pd), terakhir iro_pd.
     */
    public static function importOrder(): array
    {
        return ['krs_pemda', 'irs_pemda', 'krs_pd', 'irs_pd', 'kro_pd', 'iro_pd'];
    }

    public static function find(string $slug): ?array
    {
        return self::modules()[$slug] ?? null;
    }

    /**
     * Subset modul utk fitur Ekspor/Impor Excel PIC OPD (Form Input >
     * Ekspor/Impor KRS) — krs_pemda WAJIB ikut sbg referensi (dibutuhkan
     * utk validasi cross-ref krs_pd.SASARAN RPJMD & tampilan lengkap),
     * tapi HANYA krs_pd & kro_pd yang boleh jadi target TULIS (lihat
     * picOpdWritableModules()) — krs_pemda tetap read-only, PIC OPD tidak
     * pernah menulis ke sana lewat jalur ini (datanya global lintas-OPD,
     * bukan milik satu PIC — lihat KrsPemdaController::ensureCanManage()).
     * Urutan sudah sesuai dependency (krs_pemda dulu, baru krs_pd, kro_pd).
     */
    public static function picOpdModules(): array
    {
        return ['krs_pemda', 'krs_pd', 'kro_pd'];
    }

    /**
     * Subset picOpdModules() yang benar-benar boleh ditulis oleh PIC OPD —
     * dipakai RiskExcelImportService::write() sbg pagar tambahan (defense-
     * in-depth) supaya krs_pemda tidak pernah ter-tulis lewat jalur PIC OPD
     * meski entah bagaimana lolos tahap validasi sebelumnya.
     */
    public static function picOpdWritableModules(): array
    {
        return ['krs_pd', 'kro_pd'];
    }

    /**
     * Header lengkap satu sheet, urutan: fields + input_only_fields +
     * computed_fields + key constant_fields + _ROW_ID di akhir.
     */
    public static function headerFor(array $module): array
    {
        return array_merge(
            $module['fields'],
            $module['input_only_fields'],
            $module['computed_fields'],
            array_keys($module['constant_fields']),
            ['_ROW_ID'],
        );
    }
}
