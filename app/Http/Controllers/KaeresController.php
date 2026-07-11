<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class KaeresController extends Controller
{
    /**
     * Sama seperti IrsPemdaController::TRIWULAN_LABELS — dipakai supaya
     * node diagram TRIWULAN menampilkan label deskriptif (dengan bulan),
     * bukan cuma angka romawi mentah dari database.
     */
    private const TRIWULAN_LABELS = [
        'I' => 'Triwulan I (Januari/Februari/Maret)',
        'II' => 'Triwulan II (April/Mei/Juni)',
        'III' => 'Triwulan III (Juli/Agustus/September)',
        'IV' => 'Triwulan IV (Oktober/November/Desember)',
    ];

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $rows = DB::table('tbl_krs_irs_pemda')
            ->get()
            ->map(function ($row) {
                return (array) $row;
            })
            ->all();

        return Inertia::render('krs_irs_pemda/Index', [
            'rows' => $rows,
        ]);
    }

    public function visualization()
    {
        return Inertia::render('krs_irs_pemda_visualisasi/Index');
    }

    /**
     * Halaman diagram standalone (Blade) — dimuat di dalam iframe
     * pada halaman visualisasi. Logika identik dengan analogi1.
     */
    public function visualizationEmbed()
    {
        $data = DB::table('tbl_krs_irs_pemda')->get();

        // Rantai atribut risiko dibangun dinamis dari skema tabel: semua
        // kolom setelah URAIAN_RISIKO, mengikuti urutan kolom di database
        // (kiri ke kanan pada tabel = atas ke bawah pada diagram). Saat ini
        // dimulai dari TINGKAT_RISIKO s.d. SKALA_KEMUNGKINAN; bila skema
        // berubah, diagram menyesuaikan tanpa perlu mengubah kode.
        $columns = Schema::getColumnListing('tbl_krs_irs_pemda');
        $uraianPos = array_search('URAIAN_RISIKO', $columns, true);
        $detailColumns = $uraianPos === false ? [] : array_values(array_filter(
            array_slice($columns, $uraianPos + 1),
            fn ($col) => !in_array(strtolower($col), ['id', 'created_at', 'updated_at', 'deleted_at'], true)
        ));

        $nodeMap = [];
        $edges = [];
        $edgeIndex = [];

        foreach ($data as $rowIndex => $item) {
            // VISI
            if (!$item->VISI) {
                // Baris NON-PRIORITAS (VISI kosong, PROGRAM ada): program
                // menggantung mulai level PROGRAM (4), sejajar program
                // prioritas tanpa edge ke Sasaran — lihat buildNonPrioritasNodes.
                if ($item->PROGRAM_PRIORITAS) {
                    $this->buildNonPrioritasNodes($item, $rowIndex, $nodeMap, $edges, $edgeIndex);
                }
                continue;
            }
            // VISI & MISI TIDAK punya indikator sendiri di RPJMD (tabel hanya
            // menyimpan teksnya) — jadi node-nya sengaja TANPA ik/baseline/
            // target/opd. Popup detail-nya cukup menampilkan VALUE. (Sebelumnya
            // keliru diisi IK_TUJUAN_RPJMD milik Tujuan — sudah dibersihkan.)
            $visiId = 'visi_' . md5($item->VISI);
            $nodeMap[$visiId] = [
                'id' => $visiId,
                'name' => 'VISI',
                'value' => $item->VISI,
                'level' => 0,
            ];

            // MISI
            if ($item->MISI) {
                $misiId = 'misi_' . md5($item->MISI);
                $nodeMap[$misiId] = [
                    'id' => $misiId,
                    'name' => 'MISI',
                    'value' => $item->MISI,
                    'level' => 1,
                ];
                $this->addEdge($edges, $edgeIndex, $visiId, $misiId, $rowIndex);

                // TUJUAN
                if ($item->TUJUAN_RPJMD) {
                    $tujuanId = 'tujuan_' . md5($item->TUJUAN_RPJMD);
                    $nodeMap[$tujuanId] = [
                        'id' => $tujuanId,
                        'name' => 'TUJUAN',
                        'value' => $item->TUJUAN_RPJMD,
                        'ik' => $item->IK_TUJUAN_RPJMD,
                        'baseline_ik' => $item->BASELINE_IK_TUJUAN_RPJMD,
                        'target_ik' => $item->TARGET_IK_TUJUAN_RPJMD,
                        'opd_ik' => $item->OPD_IK_TUJUAN_RPJMD,
                        'level' => 2,
                    ];
                    $this->addEdge($edges, $edgeIndex, $misiId, $tujuanId, $rowIndex);

                    // SASARAN
                    if ($item->SASARAN_RPJMD) {
                        $sasaranId = 'sasaran_' . md5($item->SASARAN_RPJMD);
                        $nodeMap[$sasaranId] = [
                            'id' => $sasaranId,
                            'name' => 'SASARAN',
                            'value' => $item->SASARAN_RPJMD,
                            'ik' => $item->IK_SASARAN_RPJMD,
                            'baseline_ik' => $item->BASELINE_IK_SASARAN_RPJMD,
                            'target_ik' => $item->TARGET_IK_SASARAN_RPJMD,
                            'opd_ik' => $item->OPD_IK_SASARAN_RPJMD,
                            'level' => 3,
                        ];
                        $this->addEdge($edges, $edgeIndex, $tujuanId, $sasaranId, $rowIndex);

                        // PROGRAM
                        if ($item->PROGRAM_PRIORITAS) {
                            $cleanProgram = trim(preg_replace('/\s+/', ' ', $item->PROGRAM_PRIORITAS));
                            $programId = 'program_' . md5($cleanProgram);

                            // OPD — satu Program bisa dijalankan lebih dari
                            // satu OPD sekaligus (satu OPD per baris pada
                            // kolom OPD_PENANGGUNGJAWAB_PROGRAM), jadi setiap
                            // baris dipecah jadi node OPD sendiri, masing-
                            // masing terhubung ke Program yang sama.
                            $opdNames = array_values(array_filter(
                                array_map('trim', preg_split('/\r\n|\r|\n/', (string) $item->OPD_PENANGGUNGJAWAB_PROGRAM)),
                                fn ($v) => $v !== '',
                            ));

                            $nodeMap[$programId] = [
                                'id' => $programId,
                                'name' => 'PROGRAM',
                                'value' => $cleanProgram,
                                'outcome' => $item->OUTCOME_PROGRAM_PRIORITAS,
                                'ik' => $item->IK_PROGRAM_PRIORITAS,
                                'baseline_ik' => $item->BASELINE_IK_PROGRAM_PRIORITAS,
                                'target_ik' => $item->TARGET_IK_PROGRAM_PRIORITAS,
                                // OPD penanggung jawab agar kolom OPD di popup
                                // detail terisi. Diformat "> OPD" per baris agar
                                // dikenali parseIkLines() di hierarchy.js.
                                'opd_ik' => $this->formatOpdIk($opdNames),
                                'level' => 4,
                            ];
                            $this->addEdge($edges, $edgeIndex, $sasaranId, $programId, $rowIndex);

                            foreach ($opdNames as $opdName) {
                                $opdId = 'opd_' . md5($opdName);
                                $nodeMap[$opdId] = [
                                    'id' => $opdId,
                                    'name' => 'OPD',
                                    'value' => $opdName,
                                    'level' => 5,
                                ];
                                $this->addEdge($edges, $edgeIndex, $programId, $opdId, $rowIndex);

                                // RISIKO — unik per SASARAN + uraian + nomor
                                // urut (bukan per OPD): satu risiko terikat
                                // ke satu Sasaran, tapi satu Sasaran bisa
                                // punya banyak Program dengan OPD berbeda.
                                // Menge-scope per OPD akan memecah risiko
                                // yang sama jadi banyak node duplikat visual
                                // saat satu Sasaran punya banyak Program.
                                if ($item->URAIAN_RISIKO) {
                                    $risikoId = 'risiko_' . md5(
                                        $sasaranId . '|' . $item->URAIAN_RISIKO . '|' . ($item->NOMOR_URUT_RISIKO ?? '')
                                    );
                                    // Semua atribut ikut disimpan di node
                                    // risiko untuk modal detail.
                                    $risikoNode = [
                                        'id' => $risikoId,
                                        'name' => 'RISIKO',
                                        'value' => $item->URAIAN_RISIKO,
                                        'level' => 6,
                                    ];
                                    foreach ($detailColumns as $col) {
                                        $risikoNode[strtolower($col)] = $item->{$col} ?? null;
                                    }
                                    $nodeMap[$risikoId] = $risikoNode;
                                    $this->addEdge($edges, $edgeIndex, $opdId, $risikoId, $rowIndex);

                                    // Pecah atribut risiko menjadi rantai node
                                    // ke bawah — satu level per kolom, mengikuti
                                    // urutan kolom tabel. Level tetap per kolom
                                    // agar node sejenis selalu sebaris.
                                    $prevId = $risikoId;
                                    foreach ($detailColumns as $idx => $col) {
                                        $val = $item->{$col} ?? null;
                                        if ($val === null || trim((string) $val) === '') {
                                            continue; // kolom kosong dilewati, rantai lanjut
                                        }

                                        // Label node = nama kolom tanpa underscore.
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

                                        // Dedup berdasarkan nilai — pola sama dengan
                                        // hierarki di atasnya (mis. opd_md5(nilai)):
                                        // nilai sama = satu node, banyak garis masuk.
                                        // Node boleh digabung; yang menjamin highlight
                                        // tetap akurat adalah tag row_id per edge (lihat
                                        // addEdge()), bukan pemisahan identitas node.
                                        $detailId = strtolower($col) . '_' . md5($detailValue);
                                        if (!isset($nodeMap[$detailId])) {
                                            $nodeMap[$detailId] = [
                                                'id' => $detailId,
                                                'name' => $label,
                                                'value' => $detailValue,
                                                'level' => 7 + $idx,
                                            ];
                                        }
                                        // Kategori SUMBER SEBAB RISIKO yang sama bisa punya
                                        // uraian berbeda-beda antar baris — kumpulkan semua
                                        // uraian unik (bukan ditimpa) supaya popup detail
                                        // menampilkan seluruh variasi penyebab yang pernah
                                        // dicatat untuk kategori tersebut.
                                        if ($uraian !== null && trim($uraian) !== '') {
                                            // Diberi prefix nama entitas penilai supaya di popup
                                            // detail jelas uraian itu berasal dari OPD mana —
                                            // penting karena satu kategori (mis. "Internal dan
                                            // Eksternal" atau "C") bisa dipakai banyak OPD berbeda
                                            // sekaligus dengan konteks yang berbeda-beda.
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
                    }
                }
            }
        }

        // Setiap edge membawa daftar baris asalnya sebagai 'rows' — nodes
        // tetap digabung per nilai (seperti semula), tapi frontend memakai
        // 'rows' untuk menelusuri hanya jalur ancestor/descendant yang
        // benar-benar berasal dari baris tabel yang sama, alih-alih
        // mengikuti semua sambungan graph yang kebetulan bertemu di sebuah
        // node gabungan.
        $hierarchyData = [
            'nodes' => array_values($nodeMap),
            'edges' => array_values($edges),
        ];

        return view('krsirs_pemda.diagram', compact('hierarchyData'));
    }

    /**
     * Merender satu baris NON-PRIORITAS: PROGRAM (menggantung di level 4 yang
     * SAMA dengan program prioritas, tanpa edge ke Sasaran) lalu OPD (level 5).
     * Node PROGRAM ditandai is_prioritas=false untuk pembeda di hierarchy.js.
     */
    /**
     * Format daftar OPD jadi teks "> OPD" per baris agar dikenali
     * parseIkLines() di hierarchy.js & muncul di kolom OPD popup detail.
     * OPD berlaku untuk seluruh program (bukan per-indikator).
     */
    private function formatOpdIk(array $opdNames): string
    {
        if (count($opdNames) === 0) {
            return '';
        }

        return implode("\n", array_map(fn ($o) => '> ' . $o, $opdNames));
    }

    private function buildNonPrioritasNodes($item, int $rowIndex, array &$nodeMap, array &$edges, array &$edgeIndex): void
    {
        $cleanProgram = trim(preg_replace('/\s+/', ' ', $item->PROGRAM_PRIORITAS));
        $programId = 'program_np_' . md5($cleanProgram);

        $opdNames = array_values(array_filter(
            array_map('trim', preg_split('/\r\n|\r|\n/', (string) $item->OPD_PENANGGUNGJAWAB_PROGRAM)),
            fn ($v) => $v !== '',
        ));

        $nodeMap[$programId] = [
            'id' => $programId,
            'name' => 'PROGRAM',
            'value' => $cleanProgram,
            'is_prioritas' => false,
            'outcome' => $item->OUTCOME_PROGRAM_PRIORITAS,
            'ik' => $item->IK_PROGRAM_PRIORITAS,
            'baseline_ik' => $item->BASELINE_IK_PROGRAM_PRIORITAS,
            'target_ik' => $item->TARGET_IK_PROGRAM_PRIORITAS,
            'opd_ik' => $this->formatOpdIk($opdNames),
            'level' => 4,
        ];
        // Sengaja TANPA edge dari Sasaran — menggantung.
        foreach ($opdNames as $opdName) {
            $opdId = 'opd_' . md5($opdName);
            $nodeMap[$opdId] = [
                'id' => $opdId,
                'name' => 'OPD',
                'value' => $opdName,
                'level' => 5,
            ];
            $this->addEdge($edges, $edgeIndex, $programId, $opdId, $rowIndex);
        }
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
     * SUMBER SEBAB RISIKO disimpan sebagai "Kategori (uraian)" (lihat
     * CategorizedTextarea di frontend) — kategorinya cuma 3 macam (Internal,
     * Eksternal, Internal dan Eksternal), tapi uraiannya bebas/unik per
     * baris. Kalau dipakai apa adanya sebagai node value, setiap baris
     * dengan uraian beda akan jadi node diagram TERPISAH walau kategorinya
     * sama, membuat diagram penuh kotak "SUMBER SEBAB RISIKO" duplikat.
     * Di sini nilai dipecah: kategori jadi identitas/label node (supaya
     * cuma ada maksimal 3 node sejenis), uraian lengkapnya disimpan sebagai
     * properti tambahan node dan otomatis tampil di popup detail
     * (showNodeDetail() me-render semua properti non-standar apa adanya).
     */
    private function splitSumberSebabRisiko(?string $value): array
    {
        $value = trim((string) $value);

        // "Eksternal dan Internal" (urutan terbalik) dinormalisasi ke
        // kategori kanonik "Internal dan Eksternal" — supaya tetap hanya
        // 3 node kategori di diagram, bukan 4, walau data lama/baru ada
        // yang menulis urutannya terbalik.
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
     * C / UC disimpan sebagai "Kategori (uraian)" (lihat CategorizedTextarea
     * di frontend) — kategorinya cuma 2 macam (C, UC), tapi uraiannya
     * bebas/unik per baris. Dipecah sama seperti splitSumberSebabRisiko()
     * supaya node diagram cuma 2 node (C dan UC), uraiannya dikumpulkan ke
     * properti terpisah untuk popup detail.
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
