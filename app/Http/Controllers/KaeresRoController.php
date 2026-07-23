<?php

namespace App\Http\Controllers;

use App\Models\RiskLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class KaeresRoController extends Controller
{
    /**
     * Sama seperti IrsPemdaController::TRIWULAN_LABELS.
     */
    private const TRIWULAN_LABELS = [
        'I' => 'Triwulan I (Januari/Februari/Maret)',
        'II' => 'Triwulan II (April/Mei/Juni)',
        'III' => 'Triwulan III (Juli/Agustus/September)',
        'IV' => 'Triwulan IV (Oktober/November/Desember)',
    ];

    public function index()
    {
        $rows = DB::table('tbl_kro_iro_pd')
            ->get()
            ->map(fn ($row) => (array) $row)
            ->all();

        return Inertia::render('kro_iro_pd/Index', [
            'rows' => $rows,
            'riskLevels' => RiskLevel::orderBy('urutan')->get(['label', 'skala_min', 'skala_max', 'warna_class']),
        ]);
    }

    public function visualization()
    {
        return Inertia::render('kro_iro_pd_visualisasi/Index', [
            'tahunOptions' => $this->tahunOptions(),
        ]);
    }

    /** Sama seperti KaeresController::tahunOptions(). */
    private function tahunOptions(): array
    {
        return DB::table('tbl_kro_iro_pd')
            ->whereNotNull('TAHUN_DINILAI_RISIKO')
            ->where('TAHUN_DINILAI_RISIKO', '!=', '')
            ->distinct()
            ->orderByDesc('TAHUN_DINILAI_RISIKO')
            ->pluck('TAHUN_DINILAI_RISIKO')
            ->all();
    }

    /**
     * Halaman diagram standalone (Blade) — dimuat di dalam iframe pada
     * halaman visualisasi. Logika identik dengan KaeresPdController, dengan
     * penyesuaian: SASARAN_RENSTRA menggantikan (bukan menambah) level
     * SASARAN STRATEGIS PD sebagai titik sambung ke KRS_PD, dan RISIKO
     * di-attach di level KEGIATAN (bukan SubKegiatan) — sesuai basis risiko
     * operasional pada Perdep PPKD No.4/2019 BPKP (Renja OPD disusun per
     * Kegiatan).
     *
     * Filter `?tahun=` sama seperti KaeresController::visualizationEmbed().
     */
    public function visualizationEmbed(Request $request)
    {
        $query = DB::table('tbl_kro_iro_pd');
        if ($request->filled('tahun')) {
            $query->where('TAHUN_DINILAI_RISIKO', $request->string('tahun'));
        }
        $data = $query->get();

        $columns = Schema::getColumnListing('tbl_kro_iro_pd');
        $uraianPos = array_search('URAIAN_RISIKO', $columns, true);
        $detailColumns = $uraianPos === false ? [] : array_values(array_filter(
            array_slice($columns, $uraianPos + 1),
            fn ($col) => !in_array(strtolower($col), ['id', 'created_at', 'updated_at', 'deleted_at'], true)
        ));

        $nodeMap = [];
        $edges = [];
        $edgeIndex = [];

        // Node warisan (Tujuan/Sasaran RPJMD dari 1a & Tujuan/Sasaran Strategis
        // PD dari 2a) di tabel ini hanya menyimpan TEKS — IK-nya diambil dari
        // 1a (tbl_krs_irs_pemda) & 2a (tbl_krs_irs_pd) agar popup detail-nya
        // selengkap diagram di atasnya.
        $inheritedIk = $this->inheritedIkMap();

        foreach ($data as $rowIndex => $item) {
            // VISI — level teratas, disalin dari tbl_krs_pemda lewat
            // dua tingkat rujukan (KRO_PD -> KRS_PD -> KRS_Pemda), supaya
            // diagram Risiko Operasional PD tetap terhubung utuh ke
            // hierarki Pemda di atasnya.
            if (!$item->VISI) {
                // Baris NON-PRIORITAS (VISI kosong, PROGRAM_PD ada): program
                // menggantung mulai level PROGRAM (7), sejajar program
                // prioritas tanpa edge ke atas — lihat buildNonPrioritasNodes.
                if ($item->PROGRAM_PD) {
                    $this->buildNonPrioritasNodes($item, $rowIndex, $nodeMap, $edges, $edgeIndex);
                }
                continue;
            }
            $visiId = 'visi_' . md5($item->VISI);
            $nodeMap[$visiId] = [
                'id' => $visiId,
                'name' => 'VISI',
                'value' => $item->VISI,
                'level' => 0,
            ];

            // MISI
            if (!$item->MISI) {
                continue;
            }
            $misiId = 'misi_' . md5($item->MISI);
            $nodeMap[$misiId] = [
                'id' => $misiId,
                'name' => 'MISI',
                'value' => $item->MISI,
                'level' => 1,
            ];
            $this->addEdge($edges, $edgeIndex, $visiId, $misiId, $rowIndex);

            // TUJUAN RPJMD
            if (!$item->TUJUAN_RPJMD) {
                continue;
            }
            $tujuanRpjmdId = 'tujuanrpjmd_' . md5($item->TUJUAN_RPJMD);
            $nodeMap[$tujuanRpjmdId] = array_merge([
                'id' => $tujuanRpjmdId,
                'name' => 'TUJUAN RPJMD',
                'value' => $item->TUJUAN_RPJMD,
                'level' => 2,
            ], $inheritedIk['tujuan_rpjmd'][$this->cleanKey($item->TUJUAN_RPJMD)] ?? []);
            $this->addEdge($edges, $edgeIndex, $misiId, $tujuanRpjmdId, $rowIndex);

            // SASARAN RPJMD (rujukan ke KRS_Pemda)
            if (!$item->SASARAN_RPJMD) {
                continue;
            }
            $sasaranRpjmdId = 'sasaranrpjmd_' . md5($item->SASARAN_RPJMD);
            $nodeMap[$sasaranRpjmdId] = array_merge([
                'id' => $sasaranRpjmdId,
                'name' => 'SASARAN RPJMD',
                'value' => $item->SASARAN_RPJMD,
                'level' => 3,
            ], $inheritedIk['sasaran_rpjmd'][$this->cleanKey($item->SASARAN_RPJMD)] ?? []);
            $this->addEdge($edges, $edgeIndex, $tujuanRpjmdId, $sasaranRpjmdId, $rowIndex);

            // TUJUAN STRATEGIS PD (rujukan ke KRS_PD)
            if (!$item->TUJUAN_STRATEGIS_PD) {
                continue;
            }
            $tujuanPdId = 'tujuanpd_' . md5($item->TUJUAN_STRATEGIS_PD);
            $nodeMap[$tujuanPdId] = array_merge([
                'id' => $tujuanPdId,
                'name' => 'TUJUAN STRATEGIS PD',
                'value' => $item->TUJUAN_STRATEGIS_PD,
                'level' => 4,
            ], $inheritedIk['tujuan_pd'][$this->cleanKey($item->TUJUAN_STRATEGIS_PD)] ?? []);
            $this->addEdge($edges, $edgeIndex, $sasaranRpjmdId, $tujuanPdId, $rowIndex);

            // SASARAN STRATEGIS PD (rujukan ke KRS_PD)
            if (!$item->SASARAN_STRATEGIS_PD) {
                continue;
            }
            $sasaranPdId = 'sasaranpd_' . md5($item->SASARAN_STRATEGIS_PD);
            $nodeMap[$sasaranPdId] = array_merge([
                'id' => $sasaranPdId,
                'name' => 'SASARAN STRATEGIS PD',
                'value' => $item->SASARAN_STRATEGIS_PD,
                'level' => 5,
            ], $inheritedIk['sasaran_pd'][$this->cleanKey($item->SASARAN_STRATEGIS_PD)] ?? []);
            $this->addEdge($edges, $edgeIndex, $tujuanPdId, $sasaranPdId, $rowIndex);

            // SASARAN RENSTRA (rujukan KRO_PD ke KRS_PD — titik sambung
            // sebenarnya, sama sasarannya dengan SASARAN STRATEGIS PD, tapi
            // ditampilkan sebagai node terpisah karena label/peran field-nya
            // berbeda di skema KRO_PD). SASARAN_RENSTRA sendiri disimpan
            // tanpa label kode (lihat KroIroPdSyncService::buildLabeledHierarchy()),
            // jadi tampilkan pakai value SASARAN_STRATEGIS_PD yang sudah
            // berkode lengkap supaya numbering-nya konsisten dengan node lain.
            if (!$item->SASARAN_RENSTRA) {
                continue;
            }
            $sasaranRenstraId = 'sasaranrenstra_' . md5($item->SASARAN_RENSTRA);
            $nodeMap[$sasaranRenstraId] = [
                'id' => $sasaranRenstraId,
                'name' => 'SASARAN RENSTRA',
                'value' => $item->SASARAN_STRATEGIS_PD,
                'level' => 6,
            ];
            $this->addEdge($edges, $edgeIndex, $sasaranPdId, $sasaranRenstraId, $rowIndex);

            // PROGRAM PD
            if (!$item->PROGRAM_PD) {
                continue;
            }
            $cleanProgram = trim(preg_replace('/\s+/', ' ', $item->PROGRAM_PD));
            $programId = 'program_' . md5($cleanProgram);
            $nodeMap[$programId] = [
                'id' => $programId,
                'name' => 'PROGRAM PD',
                'value' => $cleanProgram,
                'ik' => $item->IK_PROGRAM_PD,
                'baseline_ik' => $item->BASELINE_IK_PROGRAM_PD,
                'target_ik' => $item->TARGET_IK_PROGRAM_PD,
                'level' => 7,
            ];
            $this->addEdge($edges, $edgeIndex, $sasaranRenstraId, $programId, $rowIndex);

            // KEGIATAN PD — level tempat RISIKO di-attach (bukan
            // SubKegiatan), sesuai basis Perdep bahwa risiko operasional
            // melekat ke Kegiatan pada Renja OPD.
            if (!$item->KEGIATAN_PD) {
                continue;
            }
            $kegiatanId = 'kegiatan_' . md5($item->KEGIATAN_PD);
            $nodeMap[$kegiatanId] = [
                'id' => $kegiatanId,
                'name' => 'KEGIATAN PD',
                'value' => $item->KEGIATAN_PD,
                'ik' => $item->IK_KEGIATAN_PD,
                'baseline_ik' => $item->BASELINE_IK_KEGIATAN_PD,
                'target_ik' => $item->TARGET_IK_KEGIATAN_PD,
                'level' => 8,
            ];
            $this->addEdge($edges, $edgeIndex, $programId, $kegiatanId, $rowIndex);

            // SUBKEGIATAN PD — tetap ditampilkan untuk kelengkapan struktur
            // Renja/RKA, tapi TIDAK jadi tempat RISIKO di-attach.
            if (!$item->SUBKEGIATAN_PD) {
                continue;
            }
            $cleanSubkegiatan = trim(preg_replace('/\s+/', ' ', $item->SUBKEGIATAN_PD));
            $subkegiatanId = 'subkegiatan_' . md5($cleanSubkegiatan);

            // OPD — satu SubKegiatan bisa dijalankan lebih dari satu OPD
            // sekaligus, satu OPD per baris di kolom
            // OPD_PENANGGUNGJAWAB_KEGIATAN, sama seperti pola KaeresPdController.
            $opdNames = array_values(array_filter(
                array_map('trim', preg_split('/\r\n|\r|\n/', (string) $item->OPD_PENANGGUNGJAWAB_KEGIATAN)),
                fn ($v) => $v !== '',
            ));

            $nodeMap[$subkegiatanId] = [
                'id' => $subkegiatanId,
                'name' => 'SUBKEGIATAN PD',
                'value' => $cleanSubkegiatan,
                'ik' => $item->IK_SUBKEGIATAN_PD,
                'baseline_ik' => $item->BASELINE_IK_SUBKEGIATAN_PD,
                'target_ik' => $item->TARGET_IK_SUBKEGIATAN_PD,
                'opd_ik' => $this->formatOpdIk($opdNames),
                'level' => 9,
            ];
            $this->addEdge($edges, $edgeIndex, $kegiatanId, $subkegiatanId, $rowIndex);

            foreach ($opdNames as $opdName) {
                $opdId = 'opd_' . md5($opdName);
                $nodeMap[$opdId] = [
                    'id' => $opdId,
                    'name' => 'OPD',
                    'value' => $opdName,
                    'level' => 10,
                ];
                $this->addEdge($edges, $edgeIndex, $subkegiatanId, $opdId, $rowIndex);

                // RISIKO — unik per KEGIATAN PD + uraian + nomor urut, bukan
                // per OPD/SubKegiatan: satu risiko terikat ke satu Kegiatan,
                // tapi satu Kegiatan bisa punya banyak SubKegiatan dengan
                // OPD berbeda.
                if ($item->URAIAN_RISIKO) {
                    $risikoId = 'risiko_' . md5(
                        $kegiatanId . '|' . $item->URAIAN_RISIKO . '|' . ($item->NOMOR_URUT_RISIKO ?? '')
                    );
                    $risikoNode = [
                        'id' => $risikoId,
                        'name' => 'RISIKO',
                        'value' => $item->URAIAN_RISIKO,
                        'level' => 11,
                    ];
                    foreach ($detailColumns as $col) {
                        $risikoNode[strtolower($col)] = $item->{$col} ?? null;
                    }
                    $nodeMap[$risikoId] = $risikoNode;
                    $this->addEdge($edges, $edgeIndex, $opdId, $risikoId, $rowIndex);

                    $prevId = $risikoId;
                    foreach ($detailColumns as $idx => $col) {
                        $val = $item->{$col} ?? null;
                        if ($val === null || trim((string) $val) === '') {
                            continue;
                        }

                        $label = match ($col) {
                            'C_UC' => 'C/UC',
                            'PEMILIK_PENANGGUNGJAWAB' => 'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN',
                            'PENANGGUNG_JAWAB_PENGENDALIAN_JABATAN' => 'PENANGGUNG JAWAB PENGENDALIAN',
                            default => str_replace('_', ' ', $col),
                        };

                        $detailValue = (string) $val;
                        $uraian = null;
                        $uraianKey = 'sumber_sebab_risiko_uraian';
                        if ($col === 'SUMBER_SEBAB_RISIKO') {
                            [$detailValue, $uraian] = $this->splitSumberSebabRisiko($detailValue);
                        }
                        if ($col === 'C_UC') {
                            [$detailValue, $uraian] = $this->splitCUc($detailValue);
                            $uraianKey = 'c_uc_uraian';
                        }
                        if ($col === 'TRIWULAN') {
                            $detailValue = self::TRIWULAN_LABELS[$detailValue] ?? $detailValue;
                        }

                        $detailId = strtolower($col) . '_' . md5($detailValue);
                        if (!isset($nodeMap[$detailId])) {
                            $nodeMap[$detailId] = [
                                'id' => $detailId,
                                'name' => $label,
                                'value' => $detailValue,
                                'level' => 12 + $idx,
                            ];
                        }
                        if ($uraian !== null && trim($uraian) !== '') {
                            // Diberi prefix nama entitas penilai — lihat komentar
                            // di KaeresController untuk alasannya.
                            $entitas = trim((string) ($item->ENTITAS_PD_YANG_MENILAI ?? ''));
                            $line = $entitas !== '' ? "({$entitas}) - {$uraian}" : $uraian;

                            $existing = $nodeMap[$detailId][$uraianKey] ?? '';
                            $lines = $existing === '' ? [] : explode("\n", $existing);
                            if (!in_array($line, $lines, true)) {
                                $lines[] = $line;
                            }
                            $nodeMap[$detailId][$uraianKey] = implode("\n", $lines);
                        }
                        $this->addEdge($edges, $edgeIndex, $prevId, $detailId, $rowIndex);
                        $prevId = $detailId;
                    }
                }
            }
        }

        $hierarchyData = [
            'nodes' => array_values($nodeMap),
            'edges' => array_values($edges),
        ];

        return view('kroiro_pd.diagram', compact('hierarchyData'));
    }

    /**
     * Merender satu baris NON-PRIORITAS: PROGRAM (menggantung di level 7 yang
     * SAMA dengan program prioritas, tanpa edge ke Sasaran Renstra) lalu
     * Kegiatan(8)→SubKegiatan(9)→OPD(10). Node PROGRAM ditandai
     * is_prioritas=false untuk pembeda warna di hierarchy.js.
     */
    private function buildNonPrioritasNodes($item, int $rowIndex, array &$nodeMap, array &$edges, array &$edgeIndex): void
    {
        $cleanProgram = trim(preg_replace('/\s+/', ' ', $item->PROGRAM_PD));
        $programId = 'program_np_' . md5($cleanProgram);
        $nodeMap[$programId] = [
            'id' => $programId,
            'name' => 'PROGRAM PD',
            'value' => $cleanProgram,
            'is_prioritas' => false,
            'ik' => $item->IK_PROGRAM_PD,
            'baseline_ik' => $item->BASELINE_IK_PROGRAM_PD,
            'target_ik' => $item->TARGET_IK_PROGRAM_PD,
            'level' => 7,
        ];
        // Sengaja TANPA edge dari Sasaran Renstra — menggantung.

        if (!$item->KEGIATAN_PD) {
            return;
        }
        $kegiatanId = 'kegiatan_np_' . md5($item->KEGIATAN_PD);
        $nodeMap[$kegiatanId] = [
            'id' => $kegiatanId,
            'name' => 'KEGIATAN PD',
            'value' => $item->KEGIATAN_PD,
            'ik' => $item->IK_KEGIATAN_PD,
            'baseline_ik' => $item->BASELINE_IK_KEGIATAN_PD,
            'target_ik' => $item->TARGET_IK_KEGIATAN_PD,
            'level' => 8,
        ];
        $this->addEdge($edges, $edgeIndex, $programId, $kegiatanId, $rowIndex);

        if (!$item->SUBKEGIATAN_PD) {
            return;
        }
        $cleanSub = trim(preg_replace('/\s+/', ' ', $item->SUBKEGIATAN_PD));
        $subkegiatanId = 'subkegiatan_np_' . md5($cleanSub);

        $opdNames = array_values(array_filter(
            array_map('trim', preg_split('/\r\n|\r|\n/', (string) $item->OPD_PENANGGUNGJAWAB_KEGIATAN)),
            fn ($v) => $v !== '',
        ));

        $nodeMap[$subkegiatanId] = [
            'id' => $subkegiatanId,
            'name' => 'SUBKEGIATAN PD',
            'value' => $cleanSub,
            'ik' => $item->IK_SUBKEGIATAN_PD,
            'baseline_ik' => $item->BASELINE_IK_SUBKEGIATAN_PD,
            'target_ik' => $item->TARGET_IK_SUBKEGIATAN_PD,
            'opd_ik' => $this->formatOpdIk($opdNames),
            'level' => 9,
        ];
        $this->addEdge($edges, $edgeIndex, $kegiatanId, $subkegiatanId, $rowIndex);
        foreach ($opdNames as $opdName) {
            $opdId = 'opd_' . md5($opdName);
            $nodeMap[$opdId] = [
                'id' => $opdId,
                'name' => 'OPD',
                'value' => $opdName,
                'level' => 10,
            ];
            $this->addEdge($edges, $edgeIndex, $subkegiatanId, $opdId, $rowIndex);
        }
    }

    /**
     * Kunci pencocokan teks node antar-tabel: buang label kode & rapikan spasi.
     */
    private function cleanKey(?string $value): string
    {
        $value = trim((string) $value);
        if (preg_match('/^(?:[A-Za-z]+\s+){1,3}[\d.]+\s*:\s*(.*)$/s', $value, $m)) {
            $value = trim($m[1]);
        }
        return mb_strtolower(preg_replace('/\s+/', ' ', $value));
    }

    /**
     * Peta IK/Baseline/Target/OPD untuk node warisan di diagram KRO_PD:
     * - RPJMD (Tujuan/Sasaran RPJMD) diambil dari 1a (tbl_krs_irs_pemda)
     * - Strategis PD (Tujuan/Sasaran Strategis PD) diambil dari 2a (tbl_krs_irs_pd)
     * Supaya popup detail node warisan selengkap diagram di atasnya.
     */
    private function inheritedIkMap(): array
    {
        $map = ['tujuan_rpjmd' => [], 'sasaran_rpjmd' => [], 'tujuan_pd' => [], 'sasaran_pd' => []];

        if (Schema::hasTable('tbl_krs_irs_pemda')) {
            foreach (DB::table('tbl_krs_irs_pemda')->get() as $p) {
                $tk = $this->cleanKey($p->TUJUAN_RPJMD ?? '');
                if ($tk !== '' && !isset($map['tujuan_rpjmd'][$tk])) {
                    $map['tujuan_rpjmd'][$tk] = [
                        'ik' => $p->IK_TUJUAN_RPJMD ?? null, 'baseline_ik' => $p->BASELINE_IK_TUJUAN_RPJMD ?? null,
                        'target_ik' => $p->TARGET_IK_TUJUAN_RPJMD ?? null, 'opd_ik' => $p->OPD_IK_TUJUAN_RPJMD ?? null,
                    ];
                }
                $sk = $this->cleanKey($p->SASARAN_RPJMD ?? '');
                if ($sk !== '' && !isset($map['sasaran_rpjmd'][$sk])) {
                    $map['sasaran_rpjmd'][$sk] = [
                        'ik' => $p->IK_SASARAN_RPJMD ?? null, 'baseline_ik' => $p->BASELINE_IK_SASARAN_RPJMD ?? null,
                        'target_ik' => $p->TARGET_IK_SASARAN_RPJMD ?? null, 'opd_ik' => $p->OPD_IK_SASARAN_RPJMD ?? null,
                    ];
                }
            }
        }

        if (Schema::hasTable('tbl_krs_irs_pd')) {
            foreach (DB::table('tbl_krs_irs_pd')->get() as $p) {
                $tk = $this->cleanKey($p->TUJUAN_STRATEGIS_PD ?? '');
                if ($tk !== '' && !isset($map['tujuan_pd'][$tk])) {
                    $map['tujuan_pd'][$tk] = [
                        'ik' => $p->IK_TUJUAN_STRATEGIS_PD ?? null, 'baseline_ik' => $p->BASELINE_IK_TUJUAN_STRATEGIS_PD ?? null,
                        'target_ik' => $p->TARGET_IK_TUJUAN_STRATEGIS_PD ?? null,
                    ];
                }
                $sk = $this->cleanKey($p->SASARAN_STRATEGIS_PD ?? '');
                if ($sk !== '' && !isset($map['sasaran_pd'][$sk])) {
                    $map['sasaran_pd'][$sk] = [
                        'ik' => $p->IK_SASARAN_STRATEGIS_PD ?? null, 'baseline_ik' => $p->BASELINE_IK_SASARAN_STRATEGIS_PD ?? null,
                        'target_ik' => $p->TARGET_IK_SASARAN_STRATEGIS_PD ?? null,
                    ];
                }
            }
        }

        return $map;
    }

    /**
     * Format daftar OPD jadi "> OPD" per baris agar dikenali parseIkLines()
     * di hierarchy.js & muncul di kolom OPD popup detail SubKegiatan.
     */
    private function formatOpdIk(array $opdNames): string
    {
        if (count($opdNames) === 0) {
            return '';
        }

        return implode("\n", array_map(fn ($o) => '> ' . $o, $opdNames));
    }

    private function addEdge(array &$edges, array &$edgeIndex, string $from, string $to, int $rowIndex): void
    {
        $key = $from . '=>' . $to;
        if (!isset($edgeIndex[$key])) {
            $edgeIndex[$key] = \count($edges);
            $edges[] = ['from' => $from, 'to' => $to, 'rows' => []];
        }
        $edges[$edgeIndex[$key]]['rows'][$rowIndex] = true;
    }

    /**
     * Sama seperti KaeresController::splitSumberSebabRisiko() — SUMBER
     * SEBAB RISIKO disimpan "Kategori (uraian)", dipecah supaya node
     * diagram cuma 3 macam (Internal/Eksternal/Internal dan Eksternal),
     * uraiannya dipindah ke properti tambahan node untuk popup detail.
     */
    private function splitSumberSebabRisiko(?string $value): array
    {
        $value = trim((string) $value);

        // "Eksternal dan Internal" (urutan terbalik) dinormalisasi ke
        // kategori kanonik "Internal dan Eksternal" — lihat komentar di
        // KaeresController untuk alasannya.
        $kategoriMap = [
            'Internal dan Eksternal' => 'Internal dan Eksternal',
            'Eksternal dan Internal' => 'Internal dan Eksternal',
            'Internal' => 'Internal',
            'Eksternal' => 'Eksternal',
        ];

        foreach ($kategoriMap as $mentah => $kanonik) {
            if ($value === $mentah) {
                return [$kanonik, null];
            }
            $prefix = "{$mentah} (";
            if (str_starts_with($value, $prefix) && str_ends_with($value, ')')) {
                return [$kanonik, substr($value, strlen($prefix), -1)];
            }
        }

        return [$value, null];
    }

    /**
     * Sama seperti KaeresController::splitCUc() — C / UC disimpan
     * "Kategori (uraian)", dipecah supaya node diagram cuma 2 macam (C, UC).
     */
    private function splitCUc(?string $value): array
    {
        $value = trim((string) $value);

        foreach (['C', 'UC'] as $kategori) {
            if ($value === $kategori) {
                return [$kategori, null];
            }
            $prefix = "{$kategori} (";
            if (str_starts_with($value, $prefix) && str_ends_with($value, ')')) {
                return [$kategori, substr($value, strlen($prefix), -1)];
            }
        }

        return [$value, null];
    }
}
