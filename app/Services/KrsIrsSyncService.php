<?php

namespace App\Services;

use App\Models\IrsPemda;
use App\Models\KrsPemda;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Meregenerasi `tbl_krs_irs_pemda` (dipakai diagram hierarki di
 * KaeresController/hierarchy.js) dari dua sumber yang diedit lewat form web:
 * `tbl_krs_pemda` (KRS_Pemda) LEFT JOIN `tbl_irs_pemda` (IRS_Pemda)
 * berdasarkan Sasaran RPJMD — persis logika Power Query Excel milik
 * pengguna (Table.NestedJoin + MergeIKColumns/SimpleFormat), supaya diagram
 * yang sudah sempurna tetap bisa dipakai tanpa proses refresh manual Excel.
 *
 * Tabel target di-truncate dan diisi ulang total setiap sinkronisasi
 * (bukan di-diff), karena tidak punya primary key dan seluruh isinya murni
 * derived data — aman dilakukan ulang kapan saja tanpa efek samping.
 */
class KrsIrsSyncService
{
    private const TARGET_TABLE = 'tbl_krs_irs_pemda';

    /**
     * Key lock SAMA dipakai oleh KrsIrsSyncService/KrsIrsPdSyncService/
     * KroIroPdSyncService — ketiganya membentuk rantai dependensi tulis-baca
     * (KrsIrsPd & KroIroPd membaca tbl_krs_irs_pemda yang ditulis service
     * ini), jadi harus saling eksklusif satu sama lain juga, bukan cuma
     * terhadap dirinya sendiri. Tanpa ini, dua request submit form yang
     * hampir bersamaan bisa saling menyelingi TRUNCATE (DDL, auto-commit)
     * dengan INSERT proses lain, membuat tabel diagram kosong/duplikat
     * sesaat.
     */
    private const LOCK_KEY = 'sync-hierarchy-diagram';

    public function sync(): void
    {
        Cache::lock(self::LOCK_KEY, 30)->block(10, function () {
            $this->syncUnlocked();
        });
    }

    private function syncUnlocked(): void
    {
        if (!Schema::hasTable(self::TARGET_TABLE) || !Schema::hasTable('tbl_krs_pemda')) {
            return;
        }

        $krsRows = KrsPemda::orderBy('id')->get();
        $irsRows = IrsPemda::all();

        // Kelompokkan baris IRS berdasarkan Sasaran RPJMD (teks bersih,
        // tanpa label) — satu Sasaran bisa punya banyak baris risiko,
        // sesuai LEFT OUTER JOIN di Power Query (satu baris KRS bisa
        // "diperbanyak" jadi beberapa baris hasil gabungan kalau match
        // lebih dari satu risiko).
        $irsBySasaran = [];
        foreach ($irsRows as $irs) {
            $key = $this->matchKey((string) $irs->{'SASARAN RPJMD'});
            $irsBySasaran[$key][] = $irs;
        }

        $hierarchy = $this->buildLabeledHierarchy($krsRows);

        $insertRows = [];
        foreach ($hierarchy as $item) {
            $sasaranKeyClean = $this->matchKey($item['sasaran_deskripsi']);
            $matches = $irsBySasaran[$sasaranKeyClean] ?? [null];

            // Nomor urut risiko dihitung per kelompok Sasaran (1, 2, 3...),
            // meniru withNomorUrut() pada IrsPemdaController — bukan selalu
            // 1 untuk setiap baris.
            $nomorUrut = 0;
            foreach ($matches as $irs) {
                $nomorUrut = $irs ? $nomorUrut + 1 : null;
                $insertRows[] = $this->buildRow($item, $irs, $nomorUrut);
            }
        }

        // TRUNCATE adalah DDL di MySQL dan memicu implicit commit, yang akan
        // merusak transaksi Laravel jika keduanya dibungkus bersama — jadi
        // truncate dijalankan terpisah, di luar transaksi insert.
        DB::table(self::TARGET_TABLE)->truncate();

        DB::transaction(function () use ($insertRows) {
            foreach (array_chunk($insertRows, 200) as $chunk) {
                DB::table(self::TARGET_TABLE)->insert($chunk);
            }
        });
    }

    /**
     * Sama seperti KrsPemdaController::removeLabel() — hanya
     * memotong prefix berpola label VBA ("Kata Angka :"), bukan sekadar
     * ambil teks setelah ":" terakhir, supaya konten asli yang mengandung
     * ":" sendiri tidak rusak.
     */
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
     * Kunci pencocokan Sasaran antara IRS_Pemda (SASARAN RPJMD) dan KRS_Pemda:
     * buang label kode + normalisasi case-insensitive & spasi ganda, supaya
     * beda kecil penulisan tidak membuat risiko hilang dari tabel/diagram
     * gabungan.
     */
    private function matchKey(string $value): string
    {
        $clean = $this->removeLabel($value);
        $clean = preg_replace('/\s+/u', ' ', $clean);

        return mb_strtolower(trim($clean));
    }

    /**
     * Membangun ulang hierarki Visi->Misi->Tujuan->Sasaran->Program dari
     * tbl_krs_pemda, sekaligus meregenerasi label berkode (mis.
     * "Misi 1 : ...", "Sasaran 1.1.1 : ...") — logika penomoran identik
     * dengan KrsPemdaController::buildHierarchy(), supaya kode
     * hierarki yang tampil di tbl_krs_irs_pemda selalu konsisten dengan
     * yang tampil di halaman KRS_Pemda.
     */
    private function buildLabeledHierarchy($rows): array
    {
        $misiIndex = [];
        $tujuanIndex = [];
        $sasaranIndex = [];
        $nextMisiNo = 1;
        $misiCounters = [];

        $result = [];

        foreach ($rows as $row) {
            $visiVal = $this->removeLabel((string) $row->VISI);
            $misiVal = $this->removeLabel((string) $row->MISI);
            $tujuanVal = $this->removeLabel((string) $row->{'TUJUAN RPJMD'});
            $sasaranVal = $this->removeLabel((string) $row->{'SASARAN RPJMD'});
            $programVal = $this->removeLabel((string) $row->{'PROGRAM PRIORITAS'});

            // Baris NON-PRIORITAS (tanpa Sasaran RPJMD): Visi/Misi/Tujuan/
            // Sasaran dikosongkan agar di diagram (KaeresController) program-nya
            // menggantung mulai level PROGRAM, sejajar program prioritas.
            if ($sasaranVal === '' || $sasaranVal === '-' || $sasaranVal === 'Tidak Ada Data') {
                $result[] = [
                    'visi' => '',
                    'misi_label' => '',
                    'tujuan_label' => '',
                    'tujuan_kode' => '',
                    'sasaran_label' => '',
                    'sasaran_deskripsi' => '',
                    'sasaran_kode' => '',
                    'program' => $programVal,
                    'row' => $row,
                ];
                continue;
            }

            if (!isset($misiIndex[$misiVal])) {
                $misiNo = $nextMisiNo++;
                $misiIndex[$misiVal] = $misiNo;
                $misiCounters[$misiNo] = ['tujuan' => 1];
            }
            $misiNo = $misiIndex[$misiVal];

            $tujuanKey = $misiNo . '|' . $tujuanVal;
            if (!isset($tujuanIndex[$tujuanKey])) {
                $tujuanNo = $misiCounters[$misiNo]['tujuan']++;
                $tujuanIndex[$tujuanKey] = $tujuanNo;
                $misiCounters[$misiNo]['sasaran'][$tujuanNo] = 1;
            }
            $tujuanNo = $tujuanIndex[$tujuanKey];

            $sasaranKey = $misiNo . '|' . $tujuanNo . '|' . $sasaranVal;
            if (!isset($sasaranIndex[$sasaranKey])) {
                $sasaranNo = $misiCounters[$misiNo]['sasaran'][$tujuanNo]++;
                $sasaranIndex[$sasaranKey] = $sasaranNo;
            }
            $sasaranNo = $sasaranIndex[$sasaranKey];

            $tujuanKode = "{$misiNo}.{$tujuanNo}";
            $sasaranKode = "{$misiNo}.{$tujuanNo}.{$sasaranNo}";

            $result[] = [
                'visi' => $visiVal,
                'misi_label' => "Misi {$misiNo} : {$misiVal}",
                'tujuan_label' => "Tujuan {$tujuanKode} : {$tujuanVal}",
                'tujuan_kode' => $tujuanKode,
                'sasaran_label' => "Sasaran {$sasaranKode} : {$sasaranVal}",
                'sasaran_deskripsi' => $sasaranVal,
                'sasaran_kode' => $sasaranKode,
                'program' => $programVal,
                'row' => $row,
            ];
        }

        return $result;
    }

    /**
     * Menggabungkan baris IK multi-nilai (dipisah newline) dengan satuannya
     * menjadi satu teks per baris "> value (satuan)", diawali label kode —
     * setara fungsi MergeIKColumns pada Power Query pengguna.
     */
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

    /**
     * Menggabungkan kolom IK Tujuan/Sasaran/Program (tanpa satuan) — setara
     * MergeIKColumns tanpa bagian satuan, dipakai untuk kolom "IK ..." yang
     * hanya berisi daftar nama indikator.
     */
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

    /**
     * Menggabungkan kolom Outcome/IK Program/Baseline/Target Program (tanpa
     * label kode di depan) — setara fungsi SimpleFormat pada Power Query,
     * yang hanya memberi prefix "> " per baris.
     */
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
            'MISI' => $item['misi_label'],
            'TUJUAN_RPJMD' => $item['tujuan_label'],
            'IK_TUJUAN_RPJMD' => $this->mergeIkNamesOnly('IK Tujuan', $item['tujuan_kode'], $get('IK TUJUAN RPJMD')),
            'BASELINE_IK_TUJUAN_RPJMD' => $this->mergeIkColumns('Baseline IK Tujuan', $item['tujuan_kode'], $get('BASELINE IK TUJUAN RPJMD'), $get('SATUAN IK TUJUAN RPJMD')),
            'TARGET_IK_TUJUAN_RPJMD' => $this->mergeIkColumns('Target IK Tujuan', $item['tujuan_kode'], $get('TARGET IK TUJUAN RPJMD'), $get('SATUAN IK TUJUAN RPJMD')),
            'OPD_IK_TUJUAN_RPJMD' => $this->simpleFormat($get('OPD IK TUJUAN RPJMD')),
            'SASARAN_RPJMD' => $item['sasaran_label'],
            'IK_SASARAN_RPJMD' => $this->mergeIkNamesOnly('IK Sasaran', $item['sasaran_kode'], $get('IK SASARAN RPJMD')),
            'BASELINE_IK_SASARAN_RPJMD' => $this->mergeIkColumns('Baseline IK Sasaran', $item['sasaran_kode'], $get('BASELINE IK SASARAN RPJMD'), $get('SATUAN IK SASARAN RPJMD')),
            'TARGET_IK_SASARAN_RPJMD' => $this->mergeIkColumns('Target IK Sasaran', $item['sasaran_kode'], $get('TARGET IK SASARAN RPJMD'), $get('SATUAN IK SASARAN RPJMD')),
            'OPD_IK_SASARAN_RPJMD' => $this->simpleFormat($get('OPD IK SASARAN RPJMD')),
            'PROGRAM_PRIORITAS' => $item['program'],
            'OUTCOME_PROGRAM_PRIORITAS' => $this->simpleFormat($get('OUTCOME PROGRAM PRIORITAS')),
            'IK_PROGRAM_PRIORITAS' => $this->simpleFormat($get('IK PROGRAM')),
            'BASELINE_IK_PROGRAM_PRIORITAS' => $this->simpleFormat($get('BASELINE IK PROGRAM')),
            'TARGET_IK_PROGRAM_PRIORITAS' => $this->simpleFormat($get('TARGET IK PROGRAM')),
            'OPD_PENANGGUNGJAWAB_PROGRAM' => trim((string) ($row->{'OPD PENANGGUNGJAWAB PROGRAM'} ?? '')),
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

    /**
     * Kolom TAHUN_DINILAI_RISIKO/TAHUN_TARGET_PENYELESAIAN bertipe integer
     * di tbl_krs_irs_pemda — hanya nilai digit murni yang dicast, selain
     * itu null agar tidak error saat insert ke kolom integer.
     */
    private function toIntOrNull($value): ?int
    {
        $value = trim((string) $value);

        return ctype_digit($value) ? (int) $value : null;
    }
}
