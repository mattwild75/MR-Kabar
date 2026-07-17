<?php

namespace App\Http\Controllers\Concerns;

use App\Models\RiskEntitasPenilai;
use Illuminate\Support\Str;

/**
 * Logika Kode Risiko & pencocokan teks (matchKey) yang dipakai bersama
 * CetakRisikoController (Form 2/3) dan CetakHasilAnalisisController
 * (Form 4/5) — dipindahkan ke trait supaya tidak duplikat persis di kedua
 * controller, sejak Form 4/5 butuh kode risiko yang SAMA PERSIS dengan
 * yang tercetak di Form 3a/3b/3c untuk risiko yang sama (satu sumber
 * kebenaran, bukan 2 implementasi yang bisa saling menyimpang).
 */
trait GeneratesKodeRisiko
{
    /** Cache in-memory (per instance controller/request) nama entitas (lowercase+trim) -> urutan — dari `entitasUrutanMap()`. */
    private ?array $entitasUrutanMap = null;

    /**
     * Peta nama entitas (lowercase+trim) -> urutan, dimuat SEKALI per
     * request lalu dipakai ulang oleh setiap panggilan generateKodeRisiko()
     * — sebelumnya tiap baris risiko memicu query
     * RiskEntitasPenilai::whereRaw(...)->first() sendiri-sendiri (N+1),
     * padahal tabel referensi ini kecil & sama sekali tidak berubah dalam
     * satu request. Form 4/5/7 (lintas-OPD, bisa ratusan baris risiko)
     * jadi cuma 1 query total utk seluruh render, bukan 1 query per baris.
     */
    private function entitasUrutanMap(): array
    {
        if ($this->entitasUrutanMap === null) {
            $this->entitasUrutanMap = RiskEntitasPenilai::all(['nama', 'urutan'])
                ->mapWithKeys(fn ($e) => [mb_strtolower(trim($e->nama)) => $e->urutan])
                ->all();
        }

        return $this->entitasUrutanMap;
    }

    /**
     * Buang label kode di awal teks (mis. "Sasaran 1.1 : ...", "Kegiatan
     * 2.3.1 : ...") lalu normalisasi (rapikan spasi ganda, lowercase, trim)
     * — dipakai utk mencocokkan teks Sasaran Strategis PD / Kegiatan PD
     * antara KRS_PD/KRO_PD (konteks) dgn IRS_PD/IRO_PD (risiko teregister),
     * SAMA PERSIS logikanya dgn KrsIrsPdSyncService::matchKey() /
     * KroIroPdSyncService::matchKey() — supaya "bold = dipilih sbg
     * Penetapan Konteks Risiko" di Form 2b/2c konsisten dgn cara tabel
     * gabungan /krs_irs_pd & /kro_iro_pd menentukan kecocokan.
     */
    private function matchKey(string $value): string
    {
        $value = trim($value);
        if ($value !== '' && preg_match('/^(?:[A-Za-z]+\s+){1,3}\d+(?:\.\d+)*\s*:\s*(.*)$/s', $value, $m)) {
            $value = trim($m[1]);
        }

        $value = preg_replace('/\s+/u', ' ', $value);

        return mb_strtolower(trim($value));
    }

    /**
     * Bangun Kode Risiko sesuai format Perdep PPKD:
     * [JENIS].[TAHUN 2-digit].[KODE JENIS RISIKO].[URUTAN ENTITAS PENILAI].[NOMOR URUT],
     * mis. "RSP.25.37.30.01" (RSP=Risiko Strategis Pemda, tahun 2025, jenis
     * risiko 37=Keuangan dan Pendapatan, entitas penilai urutan ke-30=
     * Inspektorat, urut ke-01). Semua komponen SUDAH ADA sbg kolom
     * tersimpan (TAHUN DINILAI RISIKO, JENIS RISIKO "kode - nama", ENTITAS
     * PD YANG MENILAI dicocokkan ke RiskEntitasPenilai.urutan, NOMOR URUT
     * RISIKO dihitung withNomorUrut() di controller data masing2) — TIDAK
     * ada kolom kode_risiko baru yg perlu ditambah ke database, kode ini
     * murni tampilan yg dihitung ulang saat cetak, sama pola dgn Skala
     * Risiko/Prioritas yg juga dihitung dari kolom lain, bukan disimpan.
     *
     * $prefix: 'RSP' (IrsPemda), 'RSO' (IrsPd), atau 'ROO' (IroPd) — sesuai
     * TINGKAT_RISIKO_VALUE masing2 controller data.
     */
    private function generateKodeRisiko(string $prefix, ?string $tahunDinilai, ?string $jenisRisiko, ?string $entitasPenilai, ?string $nomorUrut): ?string
    {
        if (!$tahunDinilai || !$jenisRisiko || !$entitasPenilai || !$nomorUrut) {
            return null;
        }

        $tahun2Digit = substr($tahunDinilai, -2);

        // "JENIS RISIKO" tersimpan format "37 - Keuangan dan Pendapatan"
        // (lihat RiskReferenceDataService::jenisRisikoOptions()) — ambil
        // angka kode di depan tanda "-".
        if (!preg_match('/^(\d+)\s*-/', trim($jenisRisiko), $m)) {
            return null;
        }
        $kodeJenis = str_pad($m[1], 2, '0', STR_PAD_LEFT);

        // "ENTITAS PD YANG MENILAI" tersimpan nama OPD polos — cocokkan ke
        // urutan RiskEntitasPenilai (itulah "kode entitas" 2-digit di
        // contoh RSP.25.37.30.01, 30=urutan INSPEKTORAT), lewat peta
        // in-memory (lihat entitasUrutanMap()) bukan query per baris.
        $urutan = $this->entitasUrutanMap()[Str::lower(trim($entitasPenilai))] ?? null;
        if ($urutan === null) {
            return null;
        }
        $kodeEntitas = str_pad((string) $urutan, 2, '0', STR_PAD_LEFT);

        return "{$prefix}.{$tahun2Digit}.{$kodeJenis}.{$kodeEntitas}.{$nomorUrut}";
    }

    /**
     * Nomor urut risiko (2-digit, "01", "02", ...) — komponen TERAKHIR
     * pada Kode Risiko [PREFIX].[TAHUN].[JENIS].[ENTITAS].[NOMOR_URUT].
     * Di-reset per kombinasi (TAHUN DINILAI RISIKO, JENIS RISIKO, ENTITAS
     * PD YANG MENILAI) — BUKAN per Sasaran/Kegiatan — karena itulah 3
     * komponen SEBELUM nomor urut dalam Kode Risiko; kalau nomor urut
     * di-reset per Sasaran/Kegiatan (seperti versi awal), 2 risiko dari
     * Sasaran/Kegiatan BERBEDA tapi kebetulan sama Tahun+Jenis+Entitas-nya
     * akan menghasilkan Kode Risiko IDENTIK (mis. 2 risiko RSUD sama2
     * "Kesehatan" tapi beda Sasaran, dulu sama2 dapat nomor urut "01" —
     * bug ditemukan saat membangun Form 4/5 yg menampilkan lintas-Sasaran
     * sekaligus dalam satu tabel, jadi tabrakan ini baru terlihat).
     * Menerima $rows dlm urutan APAPUN (biasanya `orderBy('id')` dari
     * caller) — di dalam fungsi ini rows di-sortBy kombinasi grup dulu
     * (lalu id sbg tie-breaker) SEBELUM dihitung, supaya baris grup yg
     * sama pasti bersebelahan meski aslinya terselip baris grup lain
     * (mis. id 3 & id 7 sama2 "2026|2 - Kesehatan|BLUD RSUD ..." tapi
     * terpisah id 4/5/6 milik OPD lain — tanpa sortBy ini keduanya
     * masing2 dianggap "grup baru" & sama2 dapat nomor urut "01").
     * HANYA menghitung baris yg URAIAN RISIKO-nya terisi. Dipakai
     * bersama oleh withNomorUrut() di IrsPemdaController/IrsPdController/
     * IroPdController (nomor urut yg tampil di Form Input sehari-hari)
     * DAN Form 3/4/5 Cetak — SATU sumber kebenaran, supaya kode risiko
     * yg tercetak & yg terlihat di Form Input selalu sama persis.
     */
    private function nomorUrutFor($rows): array
    {
        $groupKey = fn ($row) => mb_strtolower(trim((string) ($row->{'TAHUN DINILAI RISIKO'} ?? ''))) . '|'
            . mb_strtolower(trim((string) ($row->{'JENIS RISIKO'} ?? ''))) . '|'
            . mb_strtolower(trim((string) ($row->{'ENTITAS PD YANG MENILAI'} ?? '')));

        $sorted = collect($rows)->sortBy([
            fn ($a, $b) => $groupKey($a) <=> $groupKey($b),
            fn ($a, $b) => $a->id <=> $b->id,
        ]);

        $prevGroup = null;
        $counter = 0;
        $result = [];

        foreach ($sorted as $row) {
            $group = $groupKey($row);

            if ($group !== $prevGroup) {
                $counter = 0;
                $prevGroup = $group;
            }

            if (trim((string) $row->{'URAIAN RISIKO'}) !== '') {
                $counter++;
                $result[$row->id] = str_pad((string) $counter, 2, '0', STR_PAD_LEFT);
            } else {
                $result[$row->id] = null;
            }
        }

        return $result;
    }
}
