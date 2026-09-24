<?php

namespace App\Services\Arep;

use App\Support\Arep\KmKatalog;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

/**
 * Formulir Kendali Mutu (KMA 1–30) dalam Excel — satu sheet per formulir,
 * satu halaman cetak. Header kop Inspektorat + kode "KM n" seragam; formulir
 * yang bisa ditarik dari RPP Perencanaan terisi otomatis, sisanya kolom
 * kosong siap isi. Tata letak sel mengikuti berkas KM asli Inspektorat.
 */
class KmExcelService
{
    private array $tepi = ['borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]]];

    /**
     * @param  array<string,mixed>  $d
     * @param  list<int>  $forms
     */
    public function simpanKe(array $d, array $forms, string $path): void
    {
        $ss = new Spreadsheet;
        $ss->removeSheetByIndex(0);
        foreach ($forms as $no) {
            $meta = KmKatalog::cari($no);
            if (! $meta) {
                continue;
            }
            $ws = $ss->createSheet();
            $ws->setTitle('KM '.$no);
            $ws->getPageSetup()->setOrientation($meta['orientasi'] === 'landscape' ? 'landscape' : 'portrait');
            $ws->getPageSetup()->setPaperSize(9); // A4
            $ws->getPageSetup()->setFitToWidth(1)->setFitToHeight(0);
            $ws->getPageMargins()->setTop(0.4)->setLeft(0.5)->setRight(0.4)->setBottom(0.4);
            match ($no) {
                6 => $this->km6($ws, $d),
                7 => $this->km7($ws, $d),
                9 => $this->km9($ws, $d),
                default => $this->umum($ws, $d, $meta),
            };
        }
        $ss->setActiveSheetIndex(0);
        (new Xlsx($ss))->save($path);
        $ss->disconnectWorksheets();
    }

    /** Kop + kode KM di kanan; kembalikan baris berikutnya. Lebar A..kolomTerakhir. */
    private function kop($ws, array $d, string $kode, string $kolAkhir): int
    {
        $ws->mergeCells("A1:{$kolAkhir}1")->setCellValue('A1', 'INSPEKTORAT KABUPATEN ACEH BARAT');
        $ws->getStyle('A1')->applyFromArray(['font' => ['bold' => true, 'size' => 12], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]]);
        $ws->mergeCells("A2:{$kolAkhir}2")->setCellValue('A2', $d['kop']['alamat']);
        $ws->mergeCells("A3:{$kolAkhir}3")->setCellValue('A3', 'MEULABOH');
        $ws->getStyle('A2:A3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        // Kode KM pojok kanan.
        $ws->setCellValue("{$kolAkhir}1", $kode);
        $ws->getStyle("{$kolAkhir}1")->applyFromArray(['font' => ['bold' => true], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT]]);
        $ws->getStyle("A1:{$kolAkhir}3")->getBorders()->getBottom()->setBorderStyle(Border::BORDER_MEDIUM);

        return 5;
    }

    /** Blok tanda tangan tiga kolom (Inspektur · Dalnis · WPJ) untuk KM 6. */
    private function ttdTiga($ws, array $d, int $r, string $tglKanan): int
    {
        $ws->setCellValue("K{$r}", 'Meulaboh, '.($tglKanan ?: $d['tanggal']['st']));
        $r++;
        $ws->setCellValue("B{$r}", 'Inspektur Kabupaten Aceh Barat');
        $ws->setCellValue("F{$r}", 'Pengendali Teknis');
        $ws->setCellValue("K{$r}", 'Wakil Penanggung Jawab');
        $r += 4;
        $ws->setCellValue("B{$r}", $d['inspektur']['nama']);
        $ws->setCellValue("F{$r}", $d['dalnis']['nama'] ?: '............');
        $ws->setCellValue("K{$r}", $d['wpj']['nama'] ?: '............');
        $ws->getStyle("B{$r}:K{$r}")->getFont()->setBold(true)->setUnderline(true);
        $r++;
        $ws->setCellValue("B{$r}", 'NIP. '.$d['inspektur']['nip_spasi']);
        $ws->setCellValue("F{$r}", $d['dalnis']['nip_spasi'] ? 'NIP. '.$d['dalnis']['nip_spasi'] : '');
        $ws->setCellValue("K{$r}", $d['wpj']['nip_spasi'] ? 'NIP. '.$d['wpj']['nip_spasi'] : '');

        return $r + 1;
    }

    /** KM 6 — Kartu Penugasan (autofill penuh). */
    private function km6($ws, array $d): void
    {
        foreach (['A' => 4, 'B' => 4, 'C' => 26, 'D' => 6, 'E' => 3, 'F' => 20, 'G' => 8, 'H' => 6, 'I' => 6, 'J' => 6, 'K' => 12] as $k => $w) {
            $ws->getColumnDimension($k)->setWidth($w);
        }
        $r = $this->kop($ws, $d, 'KM 6', 'K');
        $ws->mergeCells("A{$r}:K{$r}")->setCellValue("A{$r}", 'KARTU PENUGASAN');
        $ws->getStyle("A{$r}")->applyFromArray(['font' => ['bold' => true, 'size' => 12], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]]);
        $r++;
        $ws->mergeCells("A{$r}:K{$r}")->setCellValue("A{$r}", 'NOMOR : '.$d['nomor']['kp']);
        $ws->getStyle("A{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $r += 2;

        $baris = function (string $no, string $label, string $isi) use ($ws, &$r) {
            $ws->setCellValue("A{$r}", $no);
            $ws->mergeCells("B{$r}:E{$r}")->setCellValue("B{$r}", $label);
            $ws->setCellValue("F{$r}", ':');
            $ws->mergeCells("G{$r}:K{$r}")->setCellValue("G{$r}", $isi);
            $ws->getStyle("A{$r}:K{$r}")->getAlignment()->setVertical(Alignment::VERTICAL_TOP)->setWrapText(true);
            $r++;
        };
        $baris('1.', 'Nama objek penugasan', $d['objek']);
        $baris('2.', 'Rencana Penugasan Nomor', ($d['nomor']['rpp'] ?? '-').($d['rpp']['tanggal_rpp'] ? ' tanggal '.$d['rpp']['tanggal_rpp'] : ''));
        $baris('3.', 'Sifat / Sasaran Penugasan', $d['sifat'] ?: '-');
        $baris('4.', 'Laporan dikirim kepada', $d['laporan_kepada']);
        $baris('5.', 'Wakil Penanggung Jawab', $d['wpj']['nama'] ?: '-');
        $baris('', 'Pengendali Teknis', $d['dalnis']['nama'] ?: '-');
        $baris('', 'Ketua Tim', $d['kt']['nama'] ?: '-');
        $baris('', 'Anggota Tim', collect($d['anggota'])->pluck('nama')->filter()->join(', ') ?: '-');
        $baris('6.', 'Surat Tugas Nomor', $d['nomor']['st']);
        $baris('', 'Tanggal Surat Tugas', $d['tanggal']['st']);
        $baris('', 'Dimulai pada tanggal', $d['jangka']['mulai']);
        $baris('', 'Direncanakan selesai tanggal', $d['jangka']['selesai']);
        $baris('7.', 'Jumlah Laporan', (string) $d['jumlah_laporan']);
        $r++;
        $this->ttdTiga($ws, $d, $r, $d['tanggal']['st']);
    }

    /** KM 7 — Anggaran Waktu Penugasan (autofill header + tim, tahap kosong). */
    private function km7($ws, array $d): void
    {
        foreach (['A' => 4, 'B' => 40, 'C' => 6, 'D' => 6, 'E' => 6, 'F' => 6, 'G' => 6, 'H' => 6, 'I' => 6, 'J' => 6, 'K' => 8, 'L' => 8] as $k => $w) {
            $ws->getColumnDimension($k)->setWidth($w);
        }
        $r = $this->kop($ws, $d, 'KM 7', 'L');
        $ws->mergeCells("A{$r}:L{$r}")->setCellValue("A{$r}", 'ANGGARAN WAKTU PENUGASAN');
        $ws->getStyle("A{$r}")->applyFromArray(['font' => ['bold' => true, 'size' => 12], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]]);
        $r += 2;
        $ws->setCellValue("A{$r}", 'Nama Objek Penugasan');
        $ws->setCellValue("D{$r}", ':');
        $ws->mergeCells("E{$r}:L{$r}")->setCellValue("E{$r}", $d['objek']);
        $r++;
        $ws->setCellValue("A{$r}", 'Nomor Kartu Penugasan');
        $ws->setCellValue("D{$r}", ':');
        $ws->mergeCells("E{$r}:L{$r}")->setCellValue("E{$r}", $d['nomor']['kp']);
        $r += 2;

        // Kepala tabel tahap.
        $ws->setCellValue("A{$r}", 'No');
        $ws->mergeCells("B{$r}:B".($r + 1))->setCellValue("B{$r}", 'Tahapan Penugasan');
        $ws->mergeCells("C{$r}:D{$r}")->setCellValue("C{$r}", 'WPJ');
        $ws->mergeCells("E{$r}:F{$r}")->setCellValue("E{$r}", 'Dalnis');
        $ws->mergeCells("G{$r}:H{$r}")->setCellValue("G{$r}", 'Ketua Tim');
        $ws->mergeCells("I{$r}:J{$r}")->setCellValue("I{$r}", 'Anggota');
        $ws->mergeCells("K{$r}:L{$r}")->setCellValue("K{$r}", 'Jumlah');
        $r++;
        foreach (['C', 'E', 'G', 'I', 'K'] as $c) {
            $ws->setCellValue("{$c}{$r}", 'HP');
        }
        foreach (['D', 'F', 'H', 'J', 'L'] as $c) {
            $ws->setCellValue("{$c}{$r}", 'Jam');
        }
        $ws->getStyle("A".($r - 1).":L{$r}")->applyFromArray(['font' => ['bold' => true], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]] + $this->tepi);
        $r++;
        $tahap = [
            'I' => ['PERSIAPAN PENUGASAN', 'Penyusunan rencana penugasan', 'Pembicaraan pendahuluan', 'Pengumpulan informasi umum', 'Penelaahan peraturan', 'Menyusun program kerja'],
            'II' => ['PELAKSANAAN PENUGASAN', 'Pengujian bukti/dokumen', 'Wawancara dan konfirmasi', 'Pemeriksaan fisik', 'Penyusunan kesimpulan'],
            'III' => ['PENYELESAIAN PENUGASAN', 'Pembahasan intern tim dan PPJ', 'Menyusun konsep laporan', 'Pembahasan konsep laporan'],
        ];
        foreach ($tahap as $rom => $items) {
            $ws->setCellValue("A{$r}", $rom);
            $ws->mergeCells("B{$r}:L{$r}")->setCellValue("B{$r}", array_shift($items));
            $ws->getStyle("A{$r}:L{$r}")->applyFromArray(['font' => ['bold' => true]] + $this->tepi);
            $r++;
            foreach ($items as $i => $it) {
                $ws->setCellValue("A{$r}", $i + 1);
                $ws->setCellValue("B{$r}", $it);
                $ws->getStyle("A{$r}:L{$r}")->applyFromArray($this->tepi);
                $r++;
            }
        }
        $r++;
        // Tanda tangan KM 7: Disetujui (WPJ) · Dalnis · Disusun (KT); Mengetahui Inspektur.
        $ws->setCellValue("B{$r}", 'Disetujui, Wakil Penanggung Jawab');
        $ws->setCellValue("G{$r}", 'Disusun, Ketua Tim');
        $r += 4;
        $ws->setCellValue("B{$r}", $d['wpj']['nama'] ?: '............');
        $ws->setCellValue("G{$r}", $d['kt']['nama'] ?: '............');
        $ws->getStyle("B{$r}:G{$r}")->getFont()->setBold(true)->setUnderline(true);
    }

    /** KM 9 — Program Kerja Audit (header autofill, langkah kerja kosong). */
    private function km9($ws, array $d): void
    {
        foreach (['A' => 4, 'B' => 6, 'C' => 48, 'D' => 16, 'E' => 8, 'F' => 8, 'G' => 10] as $k => $w) {
            $ws->getColumnDimension($k)->setWidth($w);
        }
        $r = $this->kop($ws, $d, 'KM 9', 'G');
        $ws->setCellValue("A{$r}", 'Nama Auditi');
        $ws->setCellValue("B{$r}", ':');
        $ws->mergeCells("C{$r}:G{$r}")->setCellValue("C{$r}", $d['objek']);
        $r++;
        $ws->setCellValue("A{$r}", 'Sasaran');
        $ws->setCellValue("B{$r}", ':');
        $ws->mergeCells("C{$r}:G{$r}")->setCellValue("C{$r}", $d['sifat'] ?: '');
        $r++;
        $ws->setCellValue("A{$r}", 'Surat Tugas');
        $ws->setCellValue("B{$r}", ':');
        $ws->mergeCells("C{$r}:G{$r}")->setCellValue("C{$r}", $d['nomor']['st'].' tanggal '.$d['tanggal']['st']);
        $r += 2;
        $ws->mergeCells("A{$r}:G{$r}")->setCellValue("A{$r}", 'PROGRAM KERJA AUDIT');
        $ws->getStyle("A{$r}")->applyFromArray(['font' => ['bold' => true], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]]);
        $r += 2;
        $ws->setCellValue("A{$r}", 'No');
        $ws->setCellValue("B{$r}", '');
        $ws->setCellValue("C{$r}", 'Langkah Kerja Audit');
        $ws->setCellValue("D{$r}", 'Dilaksanakan oleh');
        $ws->setCellValue("E{$r}", 'Waktu (Renc.)');
        $ws->setCellValue("F{$r}", 'Waktu (Real.)');
        $ws->setCellValue("G{$r}", 'Ref. KKA');
        $ws->getStyle("A{$r}:G{$r}")->applyFromArray(['font' => ['bold' => true], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true]] + $this->tepi);
        $r++;
        for ($i = 0; $i < 14; $i++) {
            $ws->getStyle("A{$r}:G{$r}")->applyFromArray($this->tepi);
            $ws->getRowDimension($r)->setRowHeight(20);
            $r++;
        }
        $r++;
        $ws->setCellValue("B{$r}", 'Disetujui, Pengendali Teknis');
        $ws->setCellValue("E{$r}", 'Disusun, Ketua Tim');
        $r += 4;
        $ws->setCellValue("B{$r}", $d['dalnis']['nama'] ?: '............');
        $ws->setCellValue("E{$r}", $d['kt']['nama'] ?: '............');
        $ws->getStyle("B{$r}:E{$r}")->getFont()->setBold(true)->setUnderline(true);
    }

    /**
     * Formulir umum: kop + judul + identitas penugasan + area isian kosong
     * (grid) dengan blok tanda tangan. Dipakai formulir yang belum dibuat
     * khusus dan formulir tak-autofill (dari Renstra/PKPT/penilaian pegawai).
     */
    private function umum($ws, array $d, array $meta): void
    {
        $land = $meta['orientasi'] === 'landscape';
        $kolAkhir = $land ? 'H' : 'F';
        foreach ($land
            ? ['A' => 4, 'B' => 24, 'C' => 24, 'D' => 24, 'E' => 20, 'F' => 16, 'G' => 16, 'H' => 16]
            : ['A' => 4, 'B' => 22, 'C' => 24, 'D' => 20, 'E' => 16, 'F' => 16] as $k => $w) {
            $ws->getColumnDimension($k)->setWidth($w);
        }
        $r = $this->kop($ws, $d, $meta['kode'], $kolAkhir);
        $ws->mergeCells("A{$r}:{$kolAkhir}{$r}")->setCellValue("A{$r}", mb_strtoupper($meta['nama']));
        $ws->getStyle("A{$r}")->applyFromArray(['font' => ['bold' => true, 'size' => 12], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]]);
        $r += 2;

        // Identitas penugasan (autofill sebisanya).
        $info = [
            ['Objek Penugasan', $d['objek']],
            ['Jenis Penugasan', $d['jenis']['nama'] ?? '-'],
            ['Nomor Surat Tugas', $d['nomor']['st'].($d['tanggal']['st'] ? ' tanggal '.$d['tanggal']['st'] : '')],
            ['Tim', collect($d['tim'])->map(fn ($m) => $m['nama'].' ('.$m['peran'].')')->join('; ')],
        ];
        if (! $meta['autofill']) {
            $info = [
                ['Unit / Objek', ''],
                ['Tahun', (string) ($d['rpp']['tahun'] ?? '')],
            ];
        }
        foreach ($info as [$l, $v]) {
            $ws->setCellValue("A{$r}", '');
            $ws->mergeCells("A{$r}:B{$r}")->setCellValue("A{$r}", $l);
            $ws->setCellValueExplicit("C{$r}", ': '.$v, DataType::TYPE_STRING);
            $ws->mergeCells("C{$r}:{$kolAkhir}{$r}");
            $ws->getStyle("A{$r}")->getFont()->setBold(true);
            $ws->getStyle("A{$r}:{$kolAkhir}{$r}")->getAlignment()->setVertical(Alignment::VERTICAL_TOP)->setWrapText(true);
            $r++;
        }
        $r++;

        // Grid kosong siap isi.
        $kol = range('A', $kolAkhir);
        foreach ($kol as $i => $c) {
            $ws->setCellValue("{$c}{$r}", $i === 0 ? 'No' : 'Uraian '.$i);
        }
        $ws->getStyle("A{$r}:{$kolAkhir}{$r}")->applyFromArray(['font' => ['bold' => true], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]] + $this->tepi);
        $r++;
        for ($i = 0; $i < 16; $i++) {
            $ws->getStyle("A{$r}:{$kolAkhir}{$r}")->applyFromArray($this->tepi);
            $ws->getRowDimension($r)->setRowHeight(20);
            $r++;
        }
        $r += 2;
        $ws->setCellValue("A{$r}", 'Mengetahui/Menyetujui,');
        $ws->setCellValue(($land ? 'F' : 'D')."{$r}", 'Disusun oleh,');
    }
}
