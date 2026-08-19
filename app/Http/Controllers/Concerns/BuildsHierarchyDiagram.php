<?php

namespace App\Http\Controllers\Concerns;

/**
 * Method identik yang dipakai KaeresPdController & KaeresRoController —
 * diekstrak dari duplikasi byte-per-byte sebelumnya (lihat audit). Method
 * pembangun hierarki node (visualizationEmbed) SENGAJA TIDAK diekstrak ke
 * sini karena strukturnya berbeda antar kedua controller (level/urutan node
 * KRS_PD vs KRO_PD berbeda sesuai Perdep PPKD No.4/2019 — 2a berbasis
 * Sasaran Strategis PD, 2b berbasis Kegiatan).
 */
trait BuildsHierarchyDiagram
{
    /**
     * tbl_krs_irs_pd/tbl_kro_iro_pd adalah tabel derivatif TANPA kolom
     * user_id/opd_id (dibangun ulang penuh oleh sync service dari tabel
     * sumber yang SUDAH discope per-user_id). Endpoint index()/
     * visualizationEmbed() sebelumnya tidak menyaring apapun untuk
     * non-admin, sehingga PIC OPD mana pun bisa membaca uraian risiko/RTP
     * seluruh OPD lain. Karena tidak ada FK langsung, penyaringan
     * dilakukan dengan mencocokkan nama OPD user login terhadap kolom teks
     * multi-baris OPD_PENANGGUNGJAWAB_KEGIATAN (case-insensitive, sama pola
     * matchKey() di KrsIrsSyncService).
     */
    private function rowVisibleToCurrentUser(object $row): bool
    {
        $isAdmin = auth()->user()?->canViewAllOpd() ?? false;
        if ($isAdmin) {
            return true;
        }

        $opdNama = auth()->user()?->opd?->nama;
        if (! $opdNama) {
            return false;
        }

        $opdList = array_map(
            fn ($v) => mb_strtolower(trim($v)),
            preg_split('/\r\n|\r|\n/', (string) ($row->OPD_PENANGGUNGJAWAB_KEGIATAN ?? '')),
        );

        return in_array(mb_strtolower(trim($opdNama)), $opdList, true);
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
     * Format daftar OPD jadi "> OPD" per baris agar dikenali parseIkLines()
     * di hierarchy.js & muncul di kolom OPD popup detail SubKegiatan.
     */
    private function formatOpdIk(array $opdNames): string
    {
        if (count($opdNames) === 0) {
            return '';
        }

        return implode("\n", array_map(fn ($o) => '> '.$o, $opdNames));
    }

    private function addEdge(array &$edges, array &$edgeIndex, string $from, string $to, int $rowIndex): void
    {
        $key = $from.'=>'.$to;
        if (! isset($edgeIndex[$key])) {
            $edgeIndex[$key] = \count($edges);
            $edges[] = ['from' => $from, 'to' => $to, 'rows' => []];
        }
        $edges[$edgeIndex[$key]]['rows'][$rowIndex] = true;
    }

    /**
     * SUMBER SEBAB RISIKO disimpan "Kategori (uraian)", dipecah supaya node
     * diagram cuma 3 macam (Internal/Eksternal/Internal dan Eksternal),
     * uraiannya dipindah ke properti tambahan node untuk popup detail.
     */
    private function splitSumberSebabRisiko(?string $value): array
    {
        $value = trim((string) $value);

        // "Eksternal dan Internal" (urutan terbalik) dinormalisasi ke
        // kategori kanonik "Internal dan Eksternal".
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
     * C / UC disimpan "Kategori (uraian)", dipecah supaya node diagram
     * cuma 2 macam (C, UC).
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
