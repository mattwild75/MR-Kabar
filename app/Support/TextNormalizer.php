<?php

namespace App\Support;

/**
 * Normalisasi teks utk pencocokan rujukan lunak (soft cross-reference)
 * antar modul, mis. IrsPemda.SASARAN RPJMD -> KrsPemda.SASARAN RPJMD.
 * Diekstrak dari KrsPemdaController/KrsPdController/KroPdController yang
 * sebelumnya menduplikasi logika ini secara identik — dipakai ulang di sini
 * supaya validator cross-ref pada impor Excel konsisten dgn cara sync
 * service & dropdown Form Input mencocokkan teks.
 */
class TextNormalizer
{
    /**
     * Buang label VBA-style di depan teks, mis. "Sasaran 1.1.1 : " atau
     * "Misi 2 : " -> sisakan teks bersihnya saja.
     */
    public static function removeLabel(string $value): string
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
     * Kunci pencocokan case-insensitive & spasi-dirapikan, dipakai
     * membandingkan rujukan lunak antar modul (mis. cross_ref di
     * RiskExcelRegistry) tanpa terganggu variasi kapitalisasi/spasi/label.
     */
    public static function matchKey(string $value): string
    {
        $clean = self::removeLabel($value);
        $clean = preg_replace('/\s+/u', ' ', $clean);

        return mb_strtolower(trim($clean));
    }
}
