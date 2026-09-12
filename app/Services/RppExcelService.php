<?php

namespace App\Services;

use App\Models\Rpp;
use App\Models\RppPenugasan;
use App\Models\RppSetting;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

/**
 * Lembar tabel RPP dalam bentuk Excel — disalin sel demi sel dari berkas
 * RPP*.xls Bagian Perencanaan (diukur dengan xlrd: gabungan sel, lebar
 * kolom, huruf, perataan), sehingga hasilnya sama dengan berkas asli dan
 * dengan cetakan PDF-nya:
 *
 *   A NO | B OBRIK | C no anggota | D nama / NIP | E pangkat / (gol) |
 *   F peran | G DK H "Hari" | I LK J "Hari" | K JLH L "Hari" | M sifat |
 *   N:O jumlah laporan lalu TMT
 *
 * Tiap anggota dua baris; NO/OBRIK/SIFAT merentang satu penugasan; peran dan
 * angka hari merentang dua baris anggota. Kaki: KETERANGAN di kiri, tanggal
 * dan tanda tangan Inspektur di kolom H.
 */
class RppExcelService
{
    private const LEBAR = [
        'A' => 5.2, 'B' => 53.8, 'C' => 4.0, 'D' => 38.0, 'E' => 24.5, 'F' => 23.5, 'G' => 2.8, 'H' => 6.2,
        'I' => 4.0, 'J' => 5.5, 'K' => 4.7, 'L' => 5.5, 'M' => 14.2, 'N' => 6.8, 'O' => 11.5, 'P' => 9.2,
    ];

    public function buat(Rpp $rpp): Spreadsheet
    {
        $rpp->load(['category', 'penugasan.teamMembers', 'penugasan.obriks']);
        $inspektur = RppSetting::inspektur();

        $ss = new Spreadsheet;
        $ws = $ss->getActiveSheet();
        $ws->setTitle(str_replace(['/', '\\', '?', '*', '[', ']', ':'], '-', substr('RPP '.$rpp->nomor_rpp, 0, 31)));
        foreach (self::LEBAR as $kolom => $lebar) {
            $ws->getColumnDimension($kolom)->setWidth($lebar);
        }
        $ws->getDefaultRowDimension()->setRowHeight(15);

        $bookman = ['name' => 'Bookman Old Style', 'size' => 11];
        $arial = ['name' => 'Arial', 'size' => 11];
        $tengah = ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER];
        $kiri = ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER];

        // --- kepala ---
        $ws->mergeCells('A1:P1')->setCellValue('A1', $rpp->judulTampil());
        $ws->mergeCells('A2:P2')->setCellValue('A2', $rpp->subJudulTampil());
        $ws->mergeCells('A3:E3')->setCellValue('A3', 'Nomor : '.$rpp->nomor_rpp);
        $ws->getStyle('A1:P2')->applyFromArray(['font' => $bookman + ['size' => 16, 'bold' => true], 'alignment' => $tengah]);
        $ws->getStyle('A3')->applyFromArray(['font' => $bookman + ['size' => 12, 'bold' => true], 'alignment' => $kiri]);
        $ws->getRowDimension(1)->setRowHeight(20);
        $ws->getRowDimension(2)->setRowHeight(17.25);
        $ws->getRowDimension(3)->setRowHeight(29.25);

        // --- judul kolom (baris 4-5) ---
        $ws->mergeCells('A4:A5')->setCellValue('A4', 'NO.');
        $ws->mergeCells('B4:B5')->setCellValue('B4', 'OBRIK');
        $ws->mergeCells('C4:D5')->setCellValue('C4', 'TIM PEMERIKSA');
        $ws->mergeCells('E4:E5')->setCellValue('E4', 'PANGKAT/GOL. RUANG');
        $ws->mergeCells('F4:F5')->setCellValue('F4', 'PERAN DALAM TIM');
        $ws->mergeCells('G4:L4')->setCellValue('G4', 'HARI PEMERIKSAAN');
        $ws->mergeCells('G5:H5')->setCellValue('G5', 'DK');
        $ws->mergeCells('I5:J5')->setCellValue('I5', 'LK');
        $ws->mergeCells('K5:L5')->setCellValue('K5', 'JLH');
        $ws->mergeCells('M4:M5')->setCellValue('M4', 'SIFAT AUDIT');
        $ws->mergeCells('N4:O5')->setCellValue('N4', 'JUMLAH LAPORAN');
        $ws->getStyle('A4:O5')->applyFromArray(['font' => $bookman + ['bold' => true], 'alignment' => $tengah + ['wrapText' => true]]);

        // --- isi ---
        $r = 6;
        foreach ($rpp->penugasan as $p) {
            $awal = $r;
            $anggota = $p->teamMembers->values();
            $tinggi = max(1, $anggota->count()) * 2;
            $akhir = $awal + $tinggi - 1;

            $ws->mergeCells("A{$awal}:A{$akhir}")->setCellValue("A{$awal}", $p->urutan);
            $obrik = $p->uraian ?? '';
            foreach ($p->obriks as $k => $o) {
                $obrik .= "\n".($k + 1).'.'.$o->nama;
            }
            $ws->mergeCells("B{$awal}:B{$akhir}")->setCellValue("B{$awal}", $obrik);
            $ws->mergeCells("M{$awal}:M{$akhir}")->setCellValue("M{$awal}", $p->sifat ?? '');
            $ws->getStyle("A{$awal}")->applyFromArray(['font' => $arial, 'alignment' => $tengah]);
            $ws->getStyle("B{$awal}")->applyFromArray(['font' => $arial, 'alignment' => $kiri + ['wrapText' => true]]);
            $ws->getStyle("M{$awal}")->applyFromArray(['font' => $arial + ['bold' => true], 'alignment' => $tengah + ['wrapText' => true]]);

            foreach ($anggota as $i => $m) {
                $b1 = $awal + $i * 2;
                $b2 = $b1 + 1;
                $ws->setCellValue("C{$b1}", $i + 1);
                $ws->setCellValue("D{$b1}", $m->nama);
                $ws->setCellValueExplicit("D{$b2}", $this->nipSpasi($m->nip), DataType::TYPE_STRING);
                $ws->setCellValue("E{$b1}", $m->pangkat ?? '');
                $ws->setCellValue("E{$b2}", $m->golongan ? '('.$m->golongan.')' : '');
                $ws->mergeCells("F{$b1}:F{$b2}")->setCellValue("F{$b1}", $m->peranTampil());
                $dk = (int) $m->hari_kantor;
                $lk = (int) $m->hari_lapangan;
                foreach ([['G', 'H', $dk], ['I', 'J', $lk], ['K', 'L', $dk + $lk]] as [$ka, $kh, $nilai]) {
                    $ws->mergeCells("{$ka}{$b1}:{$ka}{$b2}")->setCellValue("{$ka}{$b1}", $nilai);
                    $ws->mergeCells("{$kh}{$b1}:{$kh}{$b2}")->setCellValue("{$kh}{$b1}", 'Hari');
                }
                $ws->getStyle("C{$b1}:E{$b2}")->applyFromArray(['font' => $arial]);
                $ws->getStyle("C{$b1}")->applyFromArray(['alignment' => $tengah]);
                $ws->getStyle("D{$b1}:D{$b2}")->applyFromArray(['alignment' => ['vertical' => Alignment::VERTICAL_CENTER]]);
                $ws->getStyle("E{$b1}:E{$b2}")->applyFromArray(['alignment' => $tengah]);
                $ws->getStyle("F{$b1}:L{$b2}")->applyFromArray(['font' => $bookman, 'alignment' => ['vertical' => Alignment::VERTICAL_CENTER]]);
                $ws->getStyle("F{$b1}")->applyFromArray(['alignment' => $tengah + ['wrapText' => true]]);
            }

            // JUMLAH LAPORAN: "n Laporan" setinggi anggota pertama (dua baris), TMT merentang sisanya
            $barisLap = min($awal + 1, $akhir);
            $ws->mergeCells("N{$awal}:O{$barisLap}")->setCellValue("N{$awal}", $p->jumlah_laporan !== null ? $p->jumlah_laporan.' Laporan' : '');
            $ws->getStyle("N{$awal}")->applyFromArray(['font' => $arial, 'alignment' => $tengah + ['wrapText' => true]]);
            if ($akhir > $barisLap) {
                $ws->mergeCells('N'.($barisLap + 1).":O{$akhir}")->setCellValue('N'.($barisLap + 1), $p->tmtTampil() ?? '');
                $ws->getStyle('N'.($barisLap + 1))->applyFromArray(['font' => $arial, 'alignment' => $tengah + ['wrapText' => true]]);
            }

            $r = $akhir + 1;
        }
        $akhirTabel = $r - 1;
        $ws->getStyle("A4:O{$akhirTabel}")->applyFromArray(['borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]]);
        // garis pemisah nama/NIP di dalam satu anggota dihilangkan (dua baris satu sel secara visual)
        for ($p = 6; $p <= $akhirTabel; $p += 2) {
            $ws->getStyle("D{$p}:E{$p}")->getBorders()->getBottom()->setBorderStyle(Border::BORDER_NONE);
            $ws->getStyle('C'.$p)->getBorders()->getBottom()->setBorderStyle(Border::BORDER_NONE);
        }

        // --- kaki ---
        $tgl = $rpp->tanggal_rpp ? $rpp->tanggal_rpp->day.' '.RppPenugasan::BULAN[$rpp->tanggal_rpp->month].' '.$rpp->tanggal_rpp->year : '..........';
        $kaki = $akhirTabel + 2;
        $ws->mergeCells("H{$kaki}:O{$kaki}")->setCellValue("H{$kaki}", 'Meulaboh,      '.$tgl);
        $ws->mergeCells('H'.($kaki + 1).':O'.($kaki + 1))->setCellValue('H'.($kaki + 1), 'INSPEKTUR KABUPATEN ACEH BARAT');
        $ws->setCellValue('B'.($kaki + 1), ' KETERANGAN :');
        $ws->setCellValue('B'.($kaki + 2), 'DK = Dalam Kantor');
        $ws->setCellValue('B'.($kaki + 3), 'LK = Luar Kantor');
        $ws->getStyle('B'.($kaki + 1))->applyFromArray(['font' => $bookman + ['size' => 12, 'bold' => true, 'underline' => 'single']]);
        $ws->getStyle('B'.($kaki + 2).':B'.($kaki + 3))->applyFromArray(['font' => $bookman + ['size' => 12]]);
        $nip = preg_replace('/\D/', '', (string) ($inspektur?->nip ?? ''));
        $ws->mergeCells('H'.($kaki + 7).':O'.($kaki + 7))->setCellValue('H'.($kaki + 7), strtoupper($inspektur?->nama ?? '............').'.');
        $ws->mergeCells('H'.($kaki + 8).':O'.($kaki + 8))->setCellValueExplicit('H'.($kaki + 8), 'NIP '.($nip ?: '............'), DataType::TYPE_STRING);
        $ws->getStyle("H{$kaki}:O".($kaki + 8))->applyFromArray(['font' => $arial + ['size' => 12], 'alignment' => $tengah]);
        $ws->getStyle('H'.($kaki + 7))->applyFromArray(['font' => ['bold' => true, 'underline' => 'single']]);

        // --- halaman: A4 mendatar, muat lebar, area cetak A:P ---
        $ps = $ws->getPageSetup();
        $ps->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)->setPaperSize(PageSetup::PAPERSIZE_A4)->setFitToWidth(1)->setFitToHeight(0);
        $ps->setPrintArea('A1:P'.($kaki + 8));
        $ws->getPageMargins()->setTop(0.4)->setBottom(0.4)->setLeft(0.5)->setRight(0.4);

        return $ss;
    }

    public function simpanKe(Rpp $rpp, string $jalur): void
    {
        (new Xlsx($this->buat($rpp)))->save($jalur);
    }

    private function nipSpasi(?string $nip): string
    {
        $d = preg_replace('/\D/', '', (string) $nip);
        if (strlen($d) !== 18) {
            return (string) $nip;
        }

        return substr($d, 0, 8).' '.substr($d, 8, 6).' '.substr($d, 14, 1).' '.substr($d, 15);
    }
}
