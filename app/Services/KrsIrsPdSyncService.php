<?php

namespace App\Services;

use App\Models\IrsPd;
use App\Models\KrsPd;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Meregenerasi `tbl_krs_irs_pd` (dipakai tabel gabungan /krs_irs_pd dan
 * diagram /krs_irs_pd_visualisasi) dari `tbl_krs_pd` (KRS_PD) LEFT JOIN
 * `tbl_irs_pd` (IRS_PD) berdasarkan Sasaran Strategis PD — analog persis
 * KrsIrsSyncService, tapi join key-nya Sasaran Strategis PD (bukan Sasaran
 * RPJMD) dan hierarkinya lebih dalam dua level: Kegiatan PD dan SubKegiatan
 * PD di bawah Program PD.
 */
class KrsIrsPdSyncService
{
    private const TARGET_TABLE = 'tbl_krs_irs_pd';

    /** Lock bersama dgn KrsIrsSyncService/KroIroPdSyncService — lihat komentar di KrsIrsSyncService::LOCK_KEY. */
    private const LOCK_KEY = 'sync-hierarchy-diagram';

    public function sync(): void
    {
        Cache::lock(self::LOCK_KEY, 30)->block(10, function () {
            $this->syncUnlocked();
        });
    }

    private function syncUnlocked(): void
    {
        if (!Schema::hasTable(self::TARGET_TABLE) || !Schema::hasTable('tbl_krs_pd')) {
            return;
        }

        $krsRows = KrsPd::orderBy('id')->get();
        $irsRows = IrsPd::all();

        $irsBySasaran = [];
        foreach ($irsRows as $irs) {
            $key = $this->matchKey((string) $irs->{'SASARAN RENSTRA'});
            $irsBySasaran[$key][] = $irs;
        }

        // Peta Sasaran RPJMD (teks bersih) -> baris tbl_krs_irs_pemda induknya
        // (BUKAN tbl_krs_pemda mentah) — tbl_krs_irs_pemda sudah
        // diregenerasi KrsIrsSyncService dengan MISI/TUJUAN_RPJMD/
        // SASARAN_RPJMD berkode lengkap (mis. "Misi 1 : ...", "Tujuan 1.1 :
        // ..."), jadi dipakai langsung sebagai sumber label supaya kode
        // hierarki Pemda yang tampil di diagram KRS_IRS_PD konsisten dengan
        // yang tampil di diagram KRS_IRS_Pemda — tanpa perlu menghitung
        // ulang penomoran Misi/Tujuan dari nol di sini.
        $pemdaBySasaran = [];
        if (Schema::hasTable('tbl_krs_irs_pemda')) {
            foreach (DB::table('tbl_krs_irs_pemda')->get() as $pemda) {
                $key = $this->matchKey((string) $pemda->SASARAN_RPJMD);
                if ($key !== '' && !isset($pemdaBySasaran[$key])) {
                    $pemdaBySasaran[$key] = $pemda;
                }
            }
        }

        $hierarchy = $this->buildLabeledHierarchy($krsRows, $pemdaBySasaran);

        $insertRows = [];
        foreach ($hierarchy as $item) {
            $sasaranKeyClean = $this->matchKey($item['sasaran_deskripsi']);
            $matches = $irsBySasaran[$sasaranKeyClean] ?? [null];

            $nomorUrut = 0;
            foreach ($matches as $irs) {
                $nomorUrut = $irs ? $nomorUrut + 1 : null;
                $insertRows[] = $this->buildRow($item, $irs, $nomorUrut);
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
     * Kunci pencocokan Sasaran antara IRS_PD (SASARAN RENSTRA) dan KRS_PD
     * (SASARAN STRATEGIS PD). Selain membuang label kode, di-normalisasi
     * case-insensitive + rapikan spasi ganda — supaya beda kecil penulisan
     * (mis. "Stunting dan Penyakit" vs "Stunting Dan Penyakit") tetap cocok
     * dan risikonya tidak hilang dari tabel/diagram gabungan.
     */
    private function matchKey(string $value): string
    {
        $clean = $this->removeLabel($value);
        $clean = preg_replace('/\s+/u', ' ', $clean);

        return mb_strtolower(trim($clean));
    }

    /**
     * Membangun ulang hierarki SasaranRPJMD(ref)->Tujuan->SasaranPD->
     * Program->Kegiatan->SubKegiatan dari tbl_krs_pd, meregenerasi label
     * berkode — identik logikanya dengan KrsPdController::buildHierarchy(),
     * plus label kode untuk Kegiatan/SubKegiatan yang tidak ada di versi
     * Pemda.
     *
     * PENTING: basis penomoran (Tujuan/Sasaran/Program/Kegiatan/SubKegiatan)
     * memakai KODE ASLI Sasaran RPJMD (mis. "1.1.1" dari
     * tbl_krs_irs_pemda.SASARAN_RPJMD), sama seperti
     * KrsPdController::buildHierarchy() — supaya satu rantai kode utuh
     * dengan I_a_KRS_Pemda, bukan nomor urut lokal 1,2,3.
     */
    private function buildLabeledHierarchy($rows, array $pemdaBySasaran = []): array
    {
        $tujuanIndex = [];
        $sasaranIndex = [];
        $programIndex = [];
        $kegiatanIndex = [];
        $sasaranRpjmdIndex = [];
        $counters = [];

        $result = [];

        // Penomoran program NON-PRIORITAS (tanpa Sasaran RPJMD) — dihitung
        // terpisah dengan awalan "NP" supaya tidak tercampur/tercemar rantai
        // kode prioritas.
        $npProgramIndex = [];
        $npKegiatanIndex = [];
        $nextNpProgramNo = 1;
        $npKegiatanCounter = [];
        $npSubkegiatanCounter = [];

        foreach ($rows as $row) {
            $sasaranRpjmdVal = $this->removeLabel((string) $row->{'SASARAN RPJMD'});
            $tujuanVal = $this->removeLabel((string) $row->{'TUJUAN STRATEGIS PD'});
            $sasaranVal = $this->removeLabel((string) $row->{'SASARAN STRATEGIS PD'});
            $programVal = $this->removeLabel((string) $row->{'PROGRAM PD'});
            $kegiatanVal = $this->removeLabel((string) $row->{'KEGIATAN PD'});
            $subkegiatanVal = $this->removeLabel((string) $row->{'SUBKEGIATAN PD'});

            // Baris NON-PRIORITAS: tidak menurun dari Sasaran RPJMD. Dibangun
            // dangkal (Program→Kegiatan→SubKegiatan berkode "NP.x...") tanpa
            // VISI/MISI/TUJUAN/SASARAN, agar di diagram menggantung sejajar
            // dengan program prioritas.
            if ($sasaranRpjmdVal === '' || $sasaranRpjmdVal === '-' || $sasaranRpjmdVal === 'Tidak Ada Data') {
                $result[] = $this->buildNonPrioritasItem(
                    $row, $programVal, $kegiatanVal, $subkegiatanVal,
                    $npProgramIndex, $npKegiatanIndex, $nextNpProgramNo,
                    $npKegiatanCounter, $npSubkegiatanCounter
                );
                continue;
            }

            // $pemda adalah baris tbl_krs_irs_pemda (sudah berkode lengkap),
            // bukan tbl_krs_pemda mentah — lihat komentar di sync()
            // untuk alasannya.
            $pemda = $pemdaBySasaran[$this->matchKey($sasaranRpjmdVal)] ?? null;
            $sasaranRpjmdKode = $sasaranRpjmdVal;
            if ($pemda && preg_match('/^Sasaran\s+([\d.]+)\s*:/s', (string) $pemda->SASARAN_RPJMD, $m)) {
                $sasaranRpjmdKode = $m[1];
            }

            if (!isset($sasaranRpjmdIndex[$sasaranRpjmdVal])) {
                $sasaranRpjmdIndex[$sasaranRpjmdVal] = $sasaranRpjmdKode;
                $counters[$sasaranRpjmdKode] = ['tujuan' => 1];
            }
            $sasaranRpjmdNo = $sasaranRpjmdIndex[$sasaranRpjmdVal];

            $tujuanKey = $sasaranRpjmdNo . '|' . $tujuanVal;
            if (!isset($tujuanIndex[$tujuanKey])) {
                $tujuanNo = $counters[$sasaranRpjmdNo]['tujuan']++;
                $tujuanIndex[$tujuanKey] = $tujuanNo;
                $counters[$sasaranRpjmdNo]['sasaran'][$tujuanNo] = 1;
            }
            $tujuanNo = $tujuanIndex[$tujuanKey];

            $sasaranKey = $sasaranRpjmdNo . '|' . $tujuanNo . '|' . $sasaranVal;
            if (!isset($sasaranIndex[$sasaranKey])) {
                $sasaranNo = $counters[$sasaranRpjmdNo]['sasaran'][$tujuanNo]++;
                $sasaranIndex[$sasaranKey] = $sasaranNo;
                $counters[$sasaranRpjmdNo]['program'][$tujuanNo][$sasaranNo] = 1;
            }
            $sasaranNo = $sasaranIndex[$sasaranKey];

            $programKey = $sasaranKey . '|' . $programVal;
            if (!isset($programIndex[$programKey])) {
                $programNo = $counters[$sasaranRpjmdNo]['program'][$tujuanNo][$sasaranNo]++;
                $programIndex[$programKey] = $programNo;
                $counters[$sasaranRpjmdNo]['kegiatan'][$tujuanNo][$sasaranNo][$programNo] = 1;
            }
            $programNo = $programIndex[$programKey];

            $kegiatanKey = $programKey . '|' . $kegiatanVal;
            if (!isset($kegiatanIndex[$kegiatanKey])) {
                $kegiatanNo = $counters[$sasaranRpjmdNo]['kegiatan'][$tujuanNo][$sasaranNo][$programNo]++;
                $kegiatanIndex[$kegiatanKey] = $kegiatanNo;
            }
            $kegiatanNo = $kegiatanIndex[$kegiatanKey];

            $tujuanKode = "{$sasaranRpjmdNo}.{$tujuanNo}";
            $sasaranKode = "{$sasaranRpjmdNo}.{$tujuanNo}.{$sasaranNo}";
            $programKode = "{$sasaranKode}.{$programNo}";
            $kegiatanKode = "{$programKode}.{$kegiatanNo}";

            // SubKegiatan adalah leaf/unit terkecil (1 baris tbl_krs_pd = 1
            // SubKegiatan, tidak di-dedup) — nomor urutnya cukup dihitung
            // dari urutan baris di dalam Kegiatan yang sama.
            $subkegiatanNo = ($counters[$sasaranRpjmdNo]['subkegiatan'][$kegiatanKey] ?? 0) + 1;
            $counters[$sasaranRpjmdNo]['subkegiatan'][$kegiatanKey] = $subkegiatanNo;
            $subkegiatanKode = "{$kegiatanKode}.{$subkegiatanNo}";

            $result[] = [
                'visi' => $pemda?->VISI,
                'misi' => $pemda?->MISI,
                'tujuan_rpjmd' => $pemda?->TUJUAN_RPJMD,
                'sasaran_rpjmd' => $pemda?->SASARAN_RPJMD ?? $sasaranRpjmdVal,
                'tujuan_label' => "Tujuan {$tujuanKode} : {$tujuanVal}",
                'tujuan_kode' => $tujuanKode,
                'sasaran_label' => "Sasaran {$sasaranKode} : {$sasaranVal}",
                'sasaran_deskripsi' => $sasaranVal,
                'sasaran_kode' => $sasaranKode,
                'program_label' => "Program {$programKode} : {$programVal}",
                'program_kode' => $programKode,
                'kegiatan_label' => "Kegiatan {$kegiatanKode} : {$kegiatanVal}",
                'kegiatan_kode' => $kegiatanKode,
                'subkegiatan_label' => "SubKegiatan {$subkegiatanKode} : {$subkegiatanVal}",
                'row' => $row,
            ];
        }

        return $result;
    }

    /**
     * Membangun satu item hierarki untuk baris NON-PRIORITAS (tanpa Sasaran
     * RPJMD). Bentuknya sama dengan item prioritas agar buildRow() bisa
     * memprosesnya seragam, tapi VISI/MISI/TUJUAN/SASARAN RPJMD & Tujuan/
     * Sasaran PD dikosongkan (null/'') — sehingga di visualizationEmbed
     * node-nya menggantung mulai dari PROGRAM. Kode program berawalan "NP.x".
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
            'tujuan_label' => '',
            'tujuan_kode' => '',
            'sasaran_label' => '',
            'sasaran_deskripsi' => '',
            'sasaran_kode' => '',
            'program_label' => "Program {$programKode} : {$programVal}",
            'program_kode' => $programKode,
            'kegiatan_label' => "Kegiatan {$kegiatanKode} : {$kegiatanVal}",
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

    private function mergeIkNamesOnly(string $label, string $kode, string $value): string
    {
        $lines = $value === '' ? [] : preg_split('/\r\n|\r|\n/', $value);
        if (count($lines) === 0) {
            return '';
        }

        $result = ["{$label} {$kode} : "];
        foreach ($lines as $line) {
            $result[] = '> ' . trim($line);
        }

        return implode("\n", $result);
    }

    private function simpleFormat(string $value): string
    {
        $lines = $value === '' ? [] : preg_split('/\r\n|\r|\n/', $value);
        $lines = array_map(fn ($l) => '> ' . trim($l), $lines);

        return implode("\n", $lines);
    }

    private function buildRow(array $item, $irs, ?int $nomorUrut = null): array
    {
        $row = $item['row'];

        $get = fn (string $field) => $this->removeLabel((string) ($row->{$field} ?? ''));

        return [
            'VISI' => $item['visi'],
            'MISI' => $item['misi'],
            'TUJUAN_RPJMD' => $item['tujuan_rpjmd'],
            'SASARAN_RPJMD' => $item['sasaran_rpjmd'],
            'TUJUAN_STRATEGIS_PD' => $item['tujuan_label'],
            'IK_TUJUAN_STRATEGIS_PD' => $this->mergeIkNamesOnly('IK Tujuan', $item['tujuan_kode'], $get('IK TUJUAN STRATEGIS PD')),
            'BASELINE_IK_TUJUAN_STRATEGIS_PD' => $this->mergeIkColumns('Baseline IK Tujuan', $item['tujuan_kode'], $get('BASELINE IK TUJUAN STRATEGIS PD'), $get('SATUAN IK TUJUAN STRATEGIS PD')),
            'TARGET_IK_TUJUAN_STRATEGIS_PD' => $this->mergeIkColumns('Target IK Tujuan', $item['tujuan_kode'], $get('TARGET IK TUJUAN STRATEGIS PD'), $get('SATUAN IK TUJUAN STRATEGIS PD')),
            'SASARAN_STRATEGIS_PD' => $item['sasaran_label'],
            'IK_SASARAN_STRATEGIS_PD' => $this->mergeIkNamesOnly('IK Sasaran', $item['sasaran_kode'], $get('IK SASARAN STRATEGIS PD')),
            'BASELINE_IK_SASARAN_STRATEGIS_PD' => $this->mergeIkColumns('Baseline IK Sasaran', $item['sasaran_kode'], $get('BASELINE IK SASARAN STRATEGIS PD'), $get('SATUAN IK SASARAN STRATEGIS PD')),
            'TARGET_IK_SASARAN_STRATEGIS_PD' => $this->mergeIkColumns('Target IK Sasaran', $item['sasaran_kode'], $get('TARGET IK SASARAN STRATEGIS PD'), $get('SATUAN IK SASARAN STRATEGIS PD')),
            'PROGRAM_PD' => $item['program_label'],
            'IK_PROGRAM_PD' => $this->mergeIkNamesOnly('IK Program', $item['program_kode'], $get('IK PROGRAM PD')),
            'BASELINE_IK_PROGRAM_PD' => $this->mergeIkColumns('Baseline IK Program', $item['program_kode'], $get('BASELINE IK PROGRAM PD'), $get('SATUAN IK PROGRAM PD')),
            'TARGET_IK_PROGRAM_PD' => $this->mergeIkColumns('Target IK Program', $item['program_kode'], $get('TARGET IK PROGRAM PD'), $get('SATUAN IK PROGRAM PD')),
            'KEGIATAN_PD' => $item['kegiatan_label'],
            'IK_KEGIATAN_PD' => $this->mergeIkNamesOnly('IK Kegiatan', $item['kegiatan_kode'], $get('IK KEGIATAN PD')),
            'BASELINE_IK_KEGIATAN_PD' => $this->mergeIkColumns('Baseline IK Kegiatan', $item['kegiatan_kode'], $get('BASELINE IK KEGIATAN PD'), $get('SATUAN IK KEGIATAN PD')),
            'TARGET_IK_KEGIATAN_PD' => $this->mergeIkColumns('Target IK Kegiatan', $item['kegiatan_kode'], $get('TARGET IK KEGIATAN PD'), $get('SATUAN IK KEGIATAN PD')),
            'SUBKEGIATAN_PD' => $item['subkegiatan_label'],
            'IK_SUBKEGIATAN_PD' => $this->simpleFormat($get('IK SUBKEGIATAN PD')),
            'BASELINE_IK_SUBKEGIATAN_PD' => $this->simpleFormat($get('BASELINE IK SUBKEGIATAN PD')),
            'TARGET_IK_SUBKEGIATAN_PD' => $this->simpleFormat($get('TARGET IK SUBKEGIATAN PD')),
            'OPD_PENANGGUNGJAWAB_KEGIATAN' => trim((string) ($row->{'OPD PENANGGUNG JAWAB KEGIATAN'} ?? '')),
            'URAIAN_RISIKO' => $irs?->{'URAIAN RISIKO'},
            'TINGKAT_RISIKO' => $irs?->{'TINGKAT RISIKO'},
            'TAHUN_DINILAI_RISIKO' => $this->toIntOrNull($irs?->{'TAHUN DINILAI RISIKO'}),
            'JENIS_RISIKO' => $irs?->{'JENIS RISIKO'},
            'ENTITAS_PD_YANG_MENILAI' => $irs?->{'ENTITAS PD YANG MENILAI'},
            'NOMOR_URUT_RISIKO' => $nomorUrut,
            'PEMILIK_RISIKO' => $irs?->{'PEMILIK RISIKO'},
            'URAIAN_PENYEBAB_RISIKO' => $irs?->{'URAIAN PENYEBAB RISIKO'},
            'SUMBER_SEBAB_RISIKO' => $irs?->{'SUMBER SEBAB RISIKO'},
            'C_UC' => $irs?->{'C / UC'},
            'URAIAN_DAMPAK_RISIKO' => $irs?->{'URAIAN DAMPAK RISIKO'},
            'PIHAK_TERKENA_DAMPAK_RISIKO' => $irs?->{'PIHAK YANG TERKENA DAMPAK RISIKO'},
            'URAIAN_PENGENDALIAN_YANG_SUDAH_ADA' => $irs?->{'URAIAN PENGENDALIAN YANG SUDAH ADA'},
            'CELAH_PENGENDALIAN' => $irs?->{'CELAH PENGENDALIAN'},
            'RENCANA_TINDAK_PENGENDALIAN' => $irs?->{'RENCANA TINDAK PENGENDALIAN'},
            'PEMILIK_PENANGGUNGJAWAB' => $irs?->{'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN'},
            'PENANGGUNG_JAWAB_PENGENDALIAN_JABATAN' => $irs?->{'PENANGGUNG JAWAB PENGENDALIAN'},
            'TRIWULAN' => $irs?->{'TRIWULAN'},
            'TAHUN_TARGET_PENYELESAIAN' => $this->toIntOrNull($irs?->{'TAHUN TARGET PENYELESAIAN'}),
            'SKALA_DAMPAK' => $irs?->{'SKALA DAMPAK'},
            'SKALA_KEMUNGKINAN' => $irs?->{'SKALA KEMUNGKINAN'},
            'SKALA_RISIKO' => $irs?->{'SKALA RISIKO'},
            'SKALA_PRIORITAS' => $irs?->{'SKALA PRIORITAS'},
        ];
    }

    private function toIntOrNull($value): ?int
    {
        $value = trim((string) $value);

        return ctype_digit($value) ? (int) $value : null;
    }
}
