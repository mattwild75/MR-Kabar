<?php

namespace App\Services\Excel;

use App\Support\RiskExcelRegistry;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Protection;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Membangun workbook Excel (satu sheet per modul RiskExcelRegistry) —
 * dipakai bersama utk Ekspor (includeData: true, semua baris lintas-OPD)
 * dan Unduh Template (includeData: false, header saja). Modul baru yang
 * ditambahkan ke registry otomatis dapat dukungan ekspor & template tanpa
 * perubahan apa pun di sini.
 */
class RiskExcelExportService
{
    /**
     * @param  array|null  $moduleSlugs  Subset modul yang jadi sheet — null = semua modul registry (perilaku admin, tidak berubah).
     * @param  int|null  $scopeUserId  Kalau diisi, modul scope='owned' HANYA menyertakan baris milik user ini (dipakai fitur PIC OPD); modul scope='global' (mis. krs_pemda) tetap TIDAK difilter — referensi lintas-OPD penuh selalu dibutuhkan utk validasi cross-ref & tampilan yang akurat.
     */
    public function build(bool $includeData, ?array $moduleSlugs = null, ?int $scopeUserId = null): Spreadsheet
    {
        $spreadsheet = new Spreadsheet();
        $spreadsheet->removeSheetByIndex(0);

        $modules = RiskExcelRegistry::modules();
        if ($moduleSlugs !== null) {
            $modules = array_intersect_key($modules, array_flip($moduleSlugs));
        }

        $index = 0;
        foreach ($modules as $module) {
            $sheet = $spreadsheet->createSheet($index);
            $sheet->setTitle($module['sheet_name']);
            $this->writeSheet($sheet, $module, $includeData, $scopeUserId);
            $index++;
        }

        $spreadsheet->setActiveSheetIndex(0);

        return $spreadsheet;
    }

    private function writeSheet(Worksheet $sheet, array $module, bool $includeData, ?int $scopeUserId): void
    {
        $header = RiskExcelRegistry::headerFor($module);

        foreach ($header as $col => $label) {
            $sheet->setCellValue([$col + 1, 1], $label);
        }

        $lastCol = count($header);
        $sheet->getStyle([1, 1, $lastCol, 1])->getFont()->setBold(true);
        $sheet->getStyle([1, 1, $lastCol, 1])->getProtection()->setLocked(Protection::PROTECTION_PROTECTED);

        if ($includeData) {
            $query = $module['model']::query()->orderBy('id');
            if ($scopeUserId !== null && $module['scope'] === 'owned') {
                $query->where('user_id', $scopeUserId);
            }
            $rows = $query->get();
            $rowIndex = 2;
            foreach ($rows as $row) {
                $this->writeRow($sheet, $module, $header, $rowIndex, $row);
                $rowIndex++;
            }
        }

        // Kolom _ROW_ID (kolom terakhir) dikunci di seluruh sheet (termasuk
        // baris data) — soft guard teknis, penegakan sesungguhnya tetap di
        // validasi struktur server-side saat impor.
        $rowIdCol = $lastCol;
        $maxRow = $sheet->getHighestRow();
        $sheet->getStyle([$rowIdCol, 1, $rowIdCol, $maxRow])->getProtection()->setLocked(Protection::PROTECTION_PROTECTED);
        $sheet->getProtection()->setSheet(true);
        // Sel data (bukan header, bukan _ROW_ID) sengaja TIDAK dikunci —
        // di-unlock per-baris saat ditulis (lihat writeRow()).

        foreach ($header as $col => $label) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($col + 1))->setWidth(22);
        }
    }

    private function writeRow(Worksheet $sheet, array $module, array $header, int $rowIndex, $row): void
    {
        foreach ($header as $col => $label) {
            $value = $this->valueFor($module, $label, $row);
            $sheet->setCellValue([$col + 1, $rowIndex], $this->escapeFormulaInjection($value));
        }

        $lastCol = count($header);
        // Sel data (semua kolom KECUALI _ROW_ID di paling akhir) dibuka
        // supaya bisa diedit meski sheet protection aktif.
        $sheet->getStyle([1, $rowIndex, $lastCol - 1, $rowIndex])->getProtection()->setLocked(Protection::PROTECTION_UNPROTECTED);
    }

    private function valueFor(array $module, string $label, $row)
    {
        if ($label === '_ROW_ID') {
            return $row->id;
        }

        if (array_key_exists($label, $module['constant_fields'])) {
            return $module['constant_fields'][$label];
        }

        $value = $row->{$label} ?? null;

        return $value === null ? '' : (string) $value;
    }

    /**
     * Cegah CSV/formula injection saat file dibuka di Excel/LibreOffice —
     * data risiko sering diketik bebas oleh PIC OPD (bisa saja diawali "="
     * tanpa maksud jahat, mis. uraian "=Rp5jt"), tapi kalau tersimpan apa
     * adanya lalu file diekspor-impor lagi, formula itu akan DIEKSEKUSI saat
     * dibuka. Prefiks apostrof memaksa Excel memperlakukannya sbg teks.
     */
    private function escapeFormulaInjection($value)
    {
        if (!is_string($value) || $value === '') {
            return $value;
        }

        if (in_array($value[0], ['=', '+', '-', '@'], true)) {
            return "'" . $value;
        }

        return $value;
    }
}
