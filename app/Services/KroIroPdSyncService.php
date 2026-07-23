<?php

namespace App\Services;

use App\Models\IroPd;
use App\Models\KroPd;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Meregenerasi `tbl_kro_iro_pd` (dipakai tabel gabungan /kro_iro_pd dan
 * diagram /kro_iro_pd_visualisasi) dari `tbl_kro_pd` (KRO_PD) LEFT JOIN
 * `tbl_iro_pd` (IRO_PD) berdasarkan Kegiatan PD — analog KrsIrsPdSyncService,
 * tapi join key-nya KEGIATAN PD (bukan Sasaran), karena basis risiko
 * operasional (Perdep PPKD No.4/2019 BPKP) adalah Kegiatan pada Renja OPD,
 * bukan Sasaran. Dua tingkat lookup dipakai untuk membawa naik VISI/MISI/
 * TUJUAN_RPJMD/SASARAN_RPJMD/TUJUAN_STRATEGIS_PD/SASARAN_STRATEGIS_PD ke
 * diagram: KRO_PD hanya menyimpan rujukan Sasaran Renstra (ke tbl_krs_pd),
 * jadi perlu look up tbl_krs_pd dulu (dapat Sasaran RPJMD-nya), lalu
 * tbl_krs_pemda (dapat Visi/Misi/Tujuan RPJMD induknya).
 */
class KroIroPdSyncService
{
    private const TARGET_TABLE = 'tbl_kro_iro_pd';

    /** Lock bersama dgn KrsIrsSyncService/KrsIrsPdSyncService — lihat komentar di KrsIrsSyncService::LOCK_KEY. */
    private const LOCK_KEY = 'sync-hierarchy-diagram';

    public function sync(): void
    {
        Cache::lock(self::LOCK_KEY, 30)->block(10, function () {
            $this->syncUnlocked();
        });
    }

    private function syncUnlocked(): void
    {
        if (!Schema::hasTable(self::TARGET_TABLE) || !Schema::hasTable('tbl_kro_pd')) {
            return;
        }

        $kroRows = KroPd::orderBy('id')->get();
        $iroRows = IroPd::all();

        // Kelompokkan baris IRO berdasarkan Kegiatan PD (teks bersih) —
        // satu Kegiatan bisa punya banyak risiko, sesuai basis Perdep.
        $iroByKegiatan = [];
        foreach ($iroRows as $iro) {
            $key = $this->matchKey((string) $iro->{'KEGIATAN PD'});
            $iroByKegiatan[$key][] = $iro;
        }

        // Peta Sasaran Renstra (teks bersih) -> baris tbl_krs_irs_pd
        // induknya (BUKAN tbl_krs_pd mentah) — tbl_krs_irs_pd sudah
        // diregenerasi KrsIrsPdSyncService dengan VISI/MISI/TUJUAN_RPJMD/
        // SASARAN_RPJMD/TUJUAN_STRATEGIS_PD/SASARAN_STRATEGIS_PD berkode
        // lengkap, jadi dipakai langsung sebagai sumber label supaya kode
        // hierarki Pemda & PD yang tampil di diagram KRO_IRO_PD konsisten
        // dengan yang tampil di diagram KRS_IRS_Pemda & KRS_IRS_PD.
        $krsPdBySasaranRenstra = [];
        if (Schema::hasTable('tbl_krs_irs_pd')) {
            foreach (DB::table('tbl_krs_irs_pd')->get() as $krsPd) {
                $key = $this->matchKey((string) $krsPd->SASARAN_STRATEGIS_PD);
                if ($key !== '' && !isset($krsPdBySasaranRenstra[$key])) {
                    $krsPdBySasaranRenstra[$key] = $krsPd;
                }
            }
        }

        $hierarchy = $this->buildLabeledHierarchy($kroRows, $krsPdBySasaranRenstra);

        $insertRows = [];
        foreach ($hierarchy as $item) {
            $kegiatanKeyClean = $this->matchKey($item['kegiatan_deskripsi']);
            $matches = $iroByKegiatan[$kegiatanKeyClean] ?? [null];

            $nomorUrut = 0;
            foreach ($matches as $iro) {
                $nomorUrut = $iro ? $nomorUrut + 1 : null;
                $insertRows[] = $this->buildRow($item, $iro, $nomorUrut);
            }
        }

        DB::table(self::TARGET_TABLE)->truncate();

        DB::transaction(function () use ($insertRows) {
            foreach (array_chunk($insertRows, 200) as $chunk) {
                DB::table(self::TARGET_TABLE)->insert($chunk);
            }
        });
    }

    private function removeLabel(string $value): string
    {
        $value = trim($value);
        if ($value === '') {
            return '';
        }

        if (preg_match('/^(?:[A-Za-z]+\s+){1,3}\d+(?:\.\d+)*\s*:\s*(.*)$/s', $value, $matches)) {
            return trim($matches[1]);
        }

        return $value;
    }

    /**
     * Kunci pencocokan (Kegiatan PD antara KRO_PD & IRO_PD; Sasaran Strategis
     * PD antara KRO_PD & tbl_krs_irs_pd): buang label kode + normalisasi
     * case-insensitive & spasi ganda, agar beda kecil penulisan tidak membuat
     * risiko/rantai induk hilang dari tabel/diagram gabungan.
     */
    private function matchKey(string $value): string
    {
        $clean = $this->removeLabel($value);
        $clean = preg_replace('/\s+/u', ' ', $clean);

        return mb_strtolower(trim($clean));
    }

    /**
     * Membangun ulang hierarki SasaranRenstra(ref)->Program->Kegiatan->
     * SubKegiatan dari tbl_kro_pd, meregenerasi label berkode — identik
     * logikanya dengan KroPdController::buildHierarchy(), plus lookup ke
     * tbl_krs_irs_pd (sudah berkode) untuk membawa naik Visi/Misi/Tujuan
     * RPJMD/Sasaran RPJMD/Tujuan Strategis PD/Sasaran Strategis PD ke
     * diagram.
     *
     * PENTING: root Sasaran Renstra memakai basis kode ASLI dari
     * tbl_krs_irs_pd.SASARAN_STRATEGIS_PD (sudah berkode lengkap, mis.
     * "1.1.1.1"), bukan nomor lokal 1,2,3 — supaya numbering Program/
     * Kegiatan/SubKegiatan turunannya nyambung dari Misi sampai
     * SubKegiatan (sama pola dengan KrsIrsPdSyncService).
     */
    private function buildLabeledHierarchy($rows, array $krsPdBySasaranRenstra = []): array
    {
        $programIndex = [];
        $kegiatanIndex = [];
        $sasaranRenstraIndex = [];
        $counters = [];

        $result = [];

        // Penomoran program NON-PRIORITAS (tanpa Sasaran Renstra) — terpisah
        // dengan awalan "NP".
        $npProgramIndex = [];
        $npKegiatanIndex = [];
        $nextNpProgramNo = 1;
        $npKegiatanCounter = [];
        $npSubkegiatanCounter = [];

        foreach ($rows as $row) {
            $sasaranRenstraVal = $this->removeLabel((string) $row->{'SASARAN RENSTRA'});
            $programVal = $this->removeLabel((string) $row->{'PROGRAM PD'});
            $kegiatanVal = $this->removeLabel((string) $row->{'KEGIATAN PD'});
            $subkegiatanVal = $this->removeLabel((string) $row->{'SUBKEGIATAN PD'});

            // Baris NON-PRIORITAS: tidak menurun dari Sasaran Renstra. Kode
            // Program/Kegiatan/SubKegiatan berawalan "NP.x", tanpa rantai
            // Visi/Misi/Tujuan/Sasaran — menggantung di diagram.
            if ($sasaranRenstraVal === '' || $sasaranRenstraVal === '-' || $sasaranRenstraVal === 'Tidak Ada Data') {
                $result[] = $this->buildNonPrioritasItem(
                    $row, $programVal, $kegiatanVal, $subkegiatanVal,
                    $npProgramIndex, $npKegiatanIndex, $nextNpProgramNo,
                    $npKegiatanCounter, $npSubkegiatanCounter
                );
                continue;
            }

            // $krsPd di sini adalah baris tbl_krs_irs_pd (sudah berkode
            // lengkap sampai Sasaran Strategis PD), bukan tbl_krs_pd mentah
            // — lihat komentar di sync() untuk alasannya.
            $krsPd = $krsPdBySasaranRenstra[$this->matchKey($sasaranRenstraVal)] ?? null;
            $sasaranRenstraKode = $sasaranRenstraVal;
            if ($krsPd && preg_match('/^Sasaran\s+([\d.]+)\s*:/s', (string) $krsPd->SASARAN_STRATEGIS_PD, $m)) {
                $sasaranRenstraKode = $m[1];
            }

            if (!isset($sasaranRenstraIndex[$sasaranRenstraVal])) {
                $sasaranRenstraIndex[$sasaranRenstraVal] = $sasaranRenstraKode;
                $counters[$sasaranRenstraKode] = ['program' => 1];
            }
            $sasaranRenstraNo = $sasaranRenstraIndex[$sasaranRenstraVal];

            $programKey = $sasaranRenstraNo . '|' . $programVal;
            if (!isset($programIndex[$programKey])) {
                $programNo = $counters[$sasaranRenstraNo]['program']++;
                $programIndex[$programKey] = $programNo;
                $counters[$sasaranRenstraNo]['kegiatan'][$programNo] = 1;
            }
            $programNo = $programIndex[$programKey];

            $kegiatanKey = $programKey . '|' . $kegiatanVal;
            if (!isset($kegiatanIndex[$kegiatanKey])) {
                $kegiatanNo = $counters[$sasaranRenstraNo]['kegiatan'][$programNo]++;
                $kegiatanIndex[$kegiatanKey] = $kegiatanNo;
                $counters[$sasaranRenstraNo]['subkegiatan'][$kegiatanKey] = 0;
            }
            $kegiatanNo = $kegiatanIndex[$kegiatanKey];

            $programKode = "{$sasaranRenstraNo}.{$programNo}";
            $kegiatanKode = "{$programKode}.{$kegiatanNo}";

            // SubKegiatan adalah leaf/unit terkecil (1 baris tbl_kro_pd = 1
            // SubKegiatan, tidak di-dedup) — nomor urutnya cukup dihitung
            // dari urutan baris di dalam Kegiatan yang sama.
            $subkegiatanNo = ($counters[$sasaranRenstraNo]['subkegiatan'][$kegiatanKey] ?? 0) + 1;
            $counters[$sasaranRenstraNo]['subkegiatan'][$kegiatanKey] = $subkegiatanNo;
            $subkegiatanKode = "{$kegiatanKode}.{$subkegiatanNo}";

            $result[] = [
                'visi' => $krsPd?->VISI,
                'misi' => $krsPd?->MISI,
                'tujuan_rpjmd' => $krsPd?->TUJUAN_RPJMD,
                'sasaran_rpjmd' => $krsPd?->SASARAN_RPJMD,
                'tujuan_strategis_pd' => $krsPd?->TUJUAN_STRATEGIS_PD,
                'sasaran_strategis_pd' => $krsPd?->SASARAN_STRATEGIS_PD,
                'sasaran_renstra' => $sasaranRenstraVal,
                'program_label' => "Program {$programKode} : {$programVal}",
                'program_kode' => $programKode,
                'kegiatan_label' => "Kegiatan {$kegiatanKode} : {$kegiatanVal}",
                'kegiatan_deskripsi' => $kegiatanVal,
                'kegiatan_kode' => $kegiatanKode,
                'subkegiatan_label' => "SubKegiatan {$subkegiatanKode} : {$subkegiatanVal}",
                'row' => $row,
            ];
        }

        return $result;
    }

    /**
     * Item hierarki untuk baris NON-PRIORITAS (tanpa Sasaran Renstra). Bentuk
     * sama dengan item prioritas tapi Visi/Misi/Tujuan/Sasaran dikosongkan &
     * kode program berawalan "NP.x" — supaya di diagram menggantung mulai
     * PROGRAM.
     */
    private function buildNonPrioritasItem(
        $row, string $programVal, string $kegiatanVal, string $subkegiatanVal,
        array &$programIndex, array &$kegiatanIndex, int &$nextProgramNo,
        array &$kegiatanCounter, array &$subkegiatanCounter
    ): array {
        if (!isset($programIndex[$programVal])) {
            $programIndex[$programVal] = $nextProgramNo++;
            $kegiatanCounter[$programVal] = 0;
        }
        $programNo = $programIndex[$programVal];
        $programKode = "NP.{$programNo}";

        $kegiatanKey = $programVal . '|' . $kegiatanVal;
        if (!isset($kegiatanIndex[$kegiatanKey])) {
            $kegiatanIndex[$kegiatanKey] = ++$kegiatanCounter[$programVal];
            $subkegiatanCounter[$kegiatanKey] = 0;
        }
        $kegiatanNo = $kegiatanIndex[$kegiatanKey];
        $kegiatanKode = "{$programKode}.{$kegiatanNo}";

        $subNo = ++$subkegiatanCounter[$kegiatanKey];
        $subkegiatanKode = "{$kegiatanKode}.{$subNo}";

        return [
            'visi' => null,
            'misi' => null,
            'tujuan_rpjmd' => null,
            'sasaran_rpjmd' => null,
            'tujuan_strategis_pd' => null,
            'sasaran_strategis_pd' => null,
            'sasaran_renstra' => '',
            'program_label' => "Program {$programKode} : {$programVal}",
            'program_kode' => $programKode,
            'kegiatan_label' => "Kegiatan {$kegiatanKode} : {$kegiatanVal}",
            'kegiatan_deskripsi' => $kegiatanVal,
            'kegiatan_kode' => $kegiatanKode,
            'subkegiatan_label' => "SubKegiatan {$subkegiatanKode} : {$subkegiatanVal}",
            'row' => $row,
            'is_non_prioritas' => true,
        ];
    }

    private function mergeIkColumns(string $label, string $kode, string $target, string $satuan): string
    {
        $targetLines = $target === '' ? [] : preg_split('/\r\n|\r|\n/', $target);
        $satuanLines = $satuan === '' ? [] : preg_split('/\r\n|\r|\n/', $satuan);
        $maxLines = max(count($targetLines), count($satuanLines));

        if ($maxLines === 0) {
            return '';
        }

        $lines = ["{$label} {$kode}   :"];
        for ($i = 0; $i < $maxLines; $i++) {
            $t = trim($targetLines[$i] ?? '');
            $s = trim($satuanLines[$i] ?? '');
            $lines[] = '> ' . $t . ($s !== '' ? " ({$s})" : '');
        }

        return implode("\n", $lines);
    }

    private function simpleFormat(string $value): string
    {
        $lines = $value === '' ? [] : preg_split('/\r\n|\r|\n/', $value);
        $lines = array_map(fn ($l) => '> ' . trim($l), $lines);

        return implode("\n", $lines);
    }

    private function buildRow(array $item, $iro, ?int $nomorUrut = null): array
    {
        $row = $item['row'];

        $get = fn (string $field) => $this->removeLabel((string) ($row->{$field} ?? ''));

        return [
            'VISI' => $item['visi'],
            'MISI' => $item['misi'],
            'TUJUAN_RPJMD' => $item['tujuan_rpjmd'],
            'SASARAN_RPJMD' => $item['sasaran_rpjmd'],
            'TUJUAN_STRATEGIS_PD' => $item['tujuan_strategis_pd'],
            'SASARAN_STRATEGIS_PD' => $item['sasaran_strategis_pd'],
            'SASARAN_RENSTRA' => $item['sasaran_renstra'],
            'PROGRAM_PD' => $item['program_label'],
            'IK_PROGRAM_PD' => $this->simpleFormat($get('IK PROGRAM PD')),
            'BASELINE_IK_PROGRAM_PD' => $this->mergeIkColumns('Baseline IK Program', $item['program_kode'], $get('BASELINE IK PROGRAM PD'), $get('SATUAN IK PROGRAM PD')),
            'TARGET_IK_PROGRAM_PD' => $this->mergeIkColumns('Target IK Program', $item['program_kode'], $get('TARGET IK PROGRAM PD'), $get('SATUAN IK PROGRAM PD')),
            'KEGIATAN_PD' => $item['kegiatan_label'],
            'IK_KEGIATAN_PD' => $this->simpleFormat($get('IK KEGIATAN PD')),
            'BASELINE_IK_KEGIATAN_PD' => $this->mergeIkColumns('Baseline IK Kegiatan', $item['kegiatan_kode'], $get('BASELINE IK KEGIATAN PD'), $get('SATUAN IK KEGIATAN PD')),
            'TARGET_IK_KEGIATAN_PD' => $this->mergeIkColumns('Target IK Kegiatan', $item['kegiatan_kode'], $get('TARGET IK KEGIATAN PD'), $get('SATUAN IK KEGIATAN PD')),
            'SUBKEGIATAN_PD' => $item['subkegiatan_label'],
            'IK_SUBKEGIATAN_PD' => $this->simpleFormat($get('IK SUBKEGIATAN PD')),
            'BASELINE_IK_SUBKEGIATAN_PD' => $this->simpleFormat($get('BASELINE IK SUBKEGIATAN PD')),
            'TARGET_IK_SUBKEGIATAN_PD' => $this->simpleFormat($get('TARGET IK SUBKEGIATAN PD')),
            'OPD_PENANGGUNGJAWAB_KEGIATAN' => trim((string) ($row->{'OPD PENANGGUNG JAWAB KEGIATAN'} ?? '')),
            'URAIAN_RISIKO' => $iro?->{'URAIAN RISIKO'},
            'TINGKAT_RISIKO' => $iro?->{'TINGKAT RISIKO'},
            'TAHUN_DINILAI_RISIKO' => $this->toIntOrNull($iro?->{'TAHUN DINILAI RISIKO'}),
            'JENIS_RISIKO' => $iro?->{'JENIS RISIKO'},
            'ENTITAS_PD_YANG_MENILAI' => $iro?->{'ENTITAS PD YANG MENILAI'},
            'NOMOR_URUT_RISIKO' => $nomorUrut,
            'TAHAP' => $iro?->{'TAHAP'},
            'PEMILIK_RISIKO' => $iro?->{'PEMILIK RISIKO'},
            'URAIAN_PENYEBAB_RISIKO' => $iro?->{'URAIAN PENYEBAB RISIKO'},
            'SUMBER_SEBAB_RISIKO' => $iro?->{'SUMBER SEBAB RISIKO'},
            'C_UC' => $iro?->{'C / UC'},
            'URAIAN_DAMPAK_RISIKO' => $iro?->{'URAIAN DAMPAK RISIKO'},
            'PIHAK_TERKENA_DAMPAK_RISIKO' => $iro?->{'PIHAK YANG TERKENA DAMPAK RISIKO'},
            'URAIAN_PENGENDALIAN_YANG_SUDAH_ADA' => $iro?->{'URAIAN PENGENDALIAN YANG SUDAH ADA'},
            'CELAH_PENGENDALIAN' => $iro?->{'CELAH PENGENDALIAN'},
            'RENCANA_TINDAK_PENGENDALIAN' => $iro?->{'RENCANA TINDAK PENGENDALIAN'},
            'PEMILIK_PENANGGUNGJAWAB' => $iro?->{'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN'},
            'PENANGGUNG_JAWAB_PENGENDALIAN_JABATAN' => $iro?->{'PENANGGUNG JAWAB PENGENDALIAN'},
            'TRIWULAN' => $iro?->{'TRIWULAN'},
            'TAHUN_TARGET_PENYELESAIAN' => $this->toIntOrNull($iro?->{'TAHUN TARGET PENYELESAIAN'}),
            'SKALA_DAMPAK' => $iro?->{'SKALA DAMPAK'},
            'SKALA_KEMUNGKINAN' => $iro?->{'SKALA KEMUNGKINAN'},
            'SKALA_RISIKO' => $iro?->{'SKALA RISIKO'},
            'SKALA_PRIORITAS' => $iro?->{'SKALA PRIORITAS'},
        ];
    }

    private function toIntOrNull($value): ?int
    {
        $value = trim((string) $value);

        return ctype_digit($value) ? (int) $value : null;
    }
}
