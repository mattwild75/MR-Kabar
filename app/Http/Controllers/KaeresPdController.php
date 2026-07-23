<?php

namespace App\Http\Controllers;

use App\Models\RiskLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class KaeresPdController extends Controller
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
        $rows = DB::table('tbl_krs_irs_pd')
            ->get()
            ->map(fn ($row) => (array) $row)
            ->all();

        return Inertia::render('krs_irs_pd/Index', [
            'rows' => $rows,
            'riskLevels' => RiskLevel::orderBy('urutan')->get(['label', 'skala_min', 'skala_max', 'warna_class']),
        ]);
    }

    public function visualization()
    {
        return Inertia::render('krs_irs_pd_visualisasi/Index', [
            'tahunOptions' => $this->tahunOptions(),
        ]);
    }

    /** Sama seperti KaeresController::tahunOptions(). */
    private function tahunOptions(): array
    {
        return DB::table('tbl_krs_irs_pd')
            ->whereNotNull('TAHUN_DINILAI_RISIKO')
            ->where('TAHUN_DINILAI_RISIKO', '!=', '')
            ->distinct()
            ->orderByDesc('TAHUN_DINILAI_RISIKO')
            ->pluck('TAHUN_DINILAI_RISIKO')
            ->all();
    }

    /**
     * Halaman diagram standalone (Blade) — dimuat di dalam iframe pada
     * halaman visualisasi. Logika identik dengan KaeresController, dengan
     * dua level tambahan (KEGIATAN, SUBKEGIATAN) di antara PROGRAM dan OPD,
     * sesuai struktur hierarki Risiko Strategis PD.
     *
     * Filter `?tahun=` sama seperti KaeresController::visualizationEmbed().
     */
    public function visualizationEmbed(Request $request)
    {
        $query = DB::table('tbl_krs_irs_pd');
        if ($request->filled('tahun')) {
            $query->where('TAHUN_DINILAI_RISIKO', $request->string('tahun'));
        }
        $data = $query->get();

        $columns = Schema::getColumnListing('tbl_krs_irs_pd');
        $uraianPos = array_search('URAIAN_RISIKO', $columns, true);
        $detailColumns = $uraianPos === false ? [] : array_values(array_filter(
            array_slice($columns, $uraianPos + 1),
            fn ($col) => !in_array(strtolower($col), ['id', 'created_at', 'updated_at', 'deleted_at'], true)
        ));

        $nodeMap = [];
        $edges = [];
        $edgeIndex = [];

        // Node warisan Pemda (Tujuan/Sasaran RPJMD) di tabel ini hanya menyimpan
        // TEKS — IK/Baseline/Target/OPD-nya tidak ada. Ambil dari 1a
        // (tbl_krs_irs_pemda) via match teks supaya popup detail-nya selengkap
        // diagram Risiko Strategis Pemda.
        $pemdaIk = $this->pemdaRpjmdIkMap();

        foreach ($data as $rowIndex => $item) {
            // Baris NON-PRIORITAS: VISI kosong tapi PROGRAM_PD ada. Programnya
            // dirender menggantung mulai dari level PROGRAM (level 6) TANPA
            // rantai Visi/Misi/Tujuan/Sasaran di atasnya — sejajar dengan
            // program prioritas, hanya tanpa edge ke atas. Ditangani terpisah
            // di buildNonPrioritasNodes() lalu lanjut ke baris berikutnya.
            if (!$item->VISI) {
                if ($item->PROGRAM_PD) {
                    $this->buildNonPrioritasNodes($item, $rowIndex, $nodeMap, $edges, $edgeIndex, $detailColumns);
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
            ], $pemdaIk['tujuan'][$this->cleanKey($item->TUJUAN_RPJMD)] ?? []);
            $this->addEdge($edges, $edgeIndex, $misiId, $tujuanRpjmdId, $rowIndex);

            // SASARAN RPJMD (rujukan ke KRS_Pemda — titik sambung ke KRS_PD)
            if (!$item->SASARAN_RPJMD) {
                continue;
            }
            $sasaranRpjmdId = 'sasaranrpjmd_' . md5($item->SASARAN_RPJMD);
            $nodeMap[$sasaranRpjmdId] = array_merge([
                'id' => $sasaranRpjmdId,
                'name' => 'SASARAN RPJMD',
                'value' => $item->SASARAN_RPJMD,
                'level' => 3,
            ], $pemdaIk['sasaran'][$this->cleanKey($item->SASARAN_RPJMD)] ?? []);
            $this->addEdge($edges, $edgeIndex, $tujuanRpjmdId, $sasaranRpjmdId, $rowIndex);

            // TUJUAN STRATEGIS PD
            if (!$item->TUJUAN_STRATEGIS_PD) {
                continue;
            }
            $tujuanId = 'tujuan_' . md5($item->TUJUAN_STRATEGIS_PD);
            $nodeMap[$tujuanId] = [
                'id' => $tujuanId,
                'name' => 'TUJUAN STRATEGIS PD',
                'value' => $item->TUJUAN_STRATEGIS_PD,
                'ik' => $item->IK_TUJUAN_STRATEGIS_PD,
                'baseline_ik' => $item->BASELINE_IK_TUJUAN_STRATEGIS_PD,
                'target_ik' => $item->TARGET_IK_TUJUAN_STRATEGIS_PD,
                'level' => 4,
            ];
            $this->addEdge($edges, $edgeIndex, $sasaranRpjmdId, $tujuanId, $rowIndex);

            // SASARAN STRATEGIS PD
            if (!$item->SASARAN_STRATEGIS_PD) {
                continue;
            }
            $sasaranId = 'sasaranpd_' . md5($item->SASARAN_STRATEGIS_PD);
            $nodeMap[$sasaranId] = [
                'id' => $sasaranId,
                'name' => 'SASARAN STRATEGIS PD',
                'value' => $item->SASARAN_STRATEGIS_PD,
                'ik' => $item->IK_SASARAN_STRATEGIS_PD,
                'baseline_ik' => $item->BASELINE_IK_SASARAN_STRATEGIS_PD,
                'target_ik' => $item->TARGET_IK_SASARAN_STRATEGIS_PD,
                'level' => 5,
            ];
            $this->addEdge($edges, $edgeIndex, $tujuanId, $sasaranId, $rowIndex);

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
                'level' => 6,
            ];
            $this->addEdge($edges, $edgeIndex, $sasaranId, $programId, $rowIndex);

            // KEGIATAN PD
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
                'level' => 7,
            ];
            $this->addEdge($edges, $edgeIndex, $programId, $kegiatanId, $rowIndex);

            // SUBKEGIATAN PD
            if (!$item->SUBKEGIATAN_PD) {
                continue;
            }
            $cleanSubkegiatan = trim(preg_replace('/\s+/', ' ', $item->SUBKEGIATAN_PD));
            $subkegiatanId = 'subkegiatan_' . md5($cleanSubkegiatan);

            // OPD — satu SubKegiatan bisa dijalankan lebih dari satu OPD
            // sekaligus, satu OPD per baris di kolom
            // OPD_PENANGGUNGJAWAB_KEGIATAN, sama seperti pola KaeresController.
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
                // OPD penanggung jawab (di 2a OPD melekat ke SubKegiatan) agar
                // kolom OPD di popup detail terisi. "> OPD" per baris supaya
                // dikenali parseIkLines() di hierarchy.js.
                'opd_ik' => $this->formatOpdIk($opdNames),
                'level' => 8,
            ];
            $this->addEdge($edges, $edgeIndex, $kegiatanId, $subkegiatanId, $rowIndex);

            foreach ($opdNames as $opdName) {
                $opdId = 'opd_' . md5($opdName);
                $nodeMap[$opdId] = [
                    'id' => $opdId,
                    'name' => 'OPD',
                    'value' => $opdName,
                    'level' => 9,
                ];
                $this->addEdge($edges, $edgeIndex, $subkegiatanId, $opdId, $rowIndex);

                // RISIKO — unik per SASARAN STRATEGIS PD + uraian + nomor
                // urut, bukan per OPD, sama alasannya dengan KaeresController:
                // satu risiko terikat ke satu Sasaran Strategis PD, tapi satu
                // Sasaran bisa punya banyak Program/Kegiatan dengan OPD
                // berbeda.
                if ($item->URAIAN_RISIKO) {
                    $risikoId = 'risiko_' . md5(
                        $sasaranId . '|' . $item->URAIAN_RISIKO . '|' . ($item->NOMOR_URUT_RISIKO ?? '')
                    );
                    $risikoNode = [
                        'id' => $risikoId,
                        'name' => 'RISIKO',
                        'value' => $item->URAIAN_RISIKO,
                        'level' => 10,
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
                                'level' => 11 + $idx,
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

        return view('krsirs_pd.diagram', compact('hierarchyData'));
    }

    /**
     * Merender satu baris NON-PRIORITAS ke diagram: PROGRAM (menggantung, di
     * level 6 yang SAMA dengan program prioritas, TANPA edge ke Sasaran) lalu
     * turunannya Kegiatan→SubKegiatan→OPD→Risiko persis seperti jalur
     * prioritas. Node PROGRAM ditandai is_prioritas=false supaya diagram bisa
     * membedakan warnanya.
     */
    private function buildNonPrioritasNodes($item, int $rowIndex, array &$nodeMap, array &$edges, array &$edgeIndex, array $detailColumns): void
    {
        $cleanProgram = trim(preg_replace('/\s+/', ' ', $item->PROGRAM_PD));
        // ID diberi prefix "np" agar tidak bentrok dengan program prioritas
        // bernama sama (kalau ada) — non-prioritas adalah node terpisah.
        $programId = 'program_np_' . md5($cleanProgram);
        $nodeMap[$programId] = [
            'id' => $programId,
            'name' => 'PROGRAM PD',
            'value' => $cleanProgram,
            'is_prioritas' => false,
            'ik' => $item->IK_PROGRAM_PD,
            'baseline_ik' => $item->BASELINE_IK_PROGRAM_PD,
            'target_ik' => $item->TARGET_IK_PROGRAM_PD,
            'level' => 6,
        ];
        // Sengaja TIDAK ada addEdge dari Sasaran ke $programId — menggantung.

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
            'level' => 7,
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
            'level' => 8,
        ];
        $this->addEdge($edges, $edgeIndex, $kegiatanId, $subkegiatanId, $rowIndex);
        foreach ($opdNames as $opdName) {
            $opdId = 'opd_' . md5($opdName);
            $nodeMap[$opdId] = [
                'id' => $opdId,
                'name' => 'OPD',
                'value' => $opdName,
                'level' => 9,
            ];
            $this->addEdge($edges, $edgeIndex, $subkegiatanId, $opdId, $rowIndex);
        }
    }

    /**
     * Kunci pencocokan teks node antar-tabel: buang label kode ("Sasaran
     * 1.1.3 : ") dan rapikan spasi, supaya SASARAN_RPJMD dari tbl_krs_irs_pd
     * cocok dengan yang di tbl_krs_irs_pemda meski format labelnya beda.
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
     * Peta IK/Baseline/Target/OPD untuk node warisan Pemda (Tujuan & Sasaran
     * RPJMD), diambil dari 1a (tbl_krs_irs_pemda). Dipakai 2a agar popup detail
     * node RPJMD selengkap diagram Risiko Strategis Pemda. Struktur:
     * ['tujuan'|'sasaran'][kunci_teks] => ['ik','baseline_ik','target_ik','opd_ik'].
     */
    private function pemdaRpjmdIkMap(): array
    {
        $map = ['tujuan' => [], 'sasaran' => []];
        if (!Schema::hasTable('tbl_krs_irs_pemda')) {
            return $map;
        }

        foreach (DB::table('tbl_krs_irs_pemda')->get() as $p) {
            $tk = $this->cleanKey($p->TUJUAN_RPJMD ?? '');
            if ($tk !== '' && !isset($map['tujuan'][$tk])) {
                $map['tujuan'][$tk] = [
                    'ik' => $p->IK_TUJUAN_RPJMD ?? null,
                    'baseline_ik' => $p->BASELINE_IK_TUJUAN_RPJMD ?? null,
                    'target_ik' => $p->TARGET_IK_TUJUAN_RPJMD ?? null,
                    'opd_ik' => $p->OPD_IK_TUJUAN_RPJMD ?? null,
                ];
            }
            $sk = $this->cleanKey($p->SASARAN_RPJMD ?? '');
            if ($sk !== '' && !isset($map['sasaran'][$sk])) {
                $map['sasaran'][$sk] = [
                    'ik' => $p->IK_SASARAN_RPJMD ?? null,
                    'baseline_ik' => $p->BASELINE_IK_SASARAN_RPJMD ?? null,
                    'target_ik' => $p->TARGET_IK_SASARAN_RPJMD ?? null,
                    'opd_ik' => $p->OPD_IK_SASARAN_RPJMD ?? null,
                ];
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
