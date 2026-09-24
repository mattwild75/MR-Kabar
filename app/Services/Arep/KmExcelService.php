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

    /** Kepala KM bergaya berkas asli (kolom B), kode KM di kolom kanan. */
    private function kepalaAsli($ws, array $d, string $kode, string $kolKode): void
    {
        $ws->setCellValue('B1', 'INSPEKTORAT KABUPATEN ACEH BARAT')->setCellValue("{$kolKode}1", $kode);
        $ws->setCellValue('B2', 'Jln. Imam Bonjol Km. 4,5 Telp 0655 7015082');
        $ws->setCellValue('B3', 'MEULABOH');
        $ws->getStyle('B1')->getFont()->setBold(true);
        $ws->getStyle("{$kolKode}1")->getFont()->setBold(true);
    }

    /**
     * KM 6 — Kartu Penugasan. Tata letak sel dan rumus mengikuti berkas
     * "KM Rev RKA dan DAK Mei 2026.xlsx" (kolom B–R): tanggal mulai/selesai
     * merujuk sel tanggal ST, jam = hari × 6,5, realisasi = anggaran.
     */
    private function km6($ws, array $d): void
    {
        foreach (['A' => 2, 'B' => 4, 'C' => 4, 'D' => 22, 'E' => 2, 'F' => 14, 'G' => 2, 'H' => 6, 'I' => 14, 'J' => 5, 'K' => 6, 'L' => 6, 'M' => 5, 'N' => 2, 'O' => 5, 'P' => 6, 'Q' => 6, 'R' => 6] as $k => $w) {
            $ws->getColumnDimension($k)->setWidth($w);
        }
        $kk = $d['jenis']['kata_kerja'];
        $rangkap = ! empty($d['dalnis_rangkap']);
        $this->kepalaAsli($ws, $d, 'KM 6', 'R');
        $ws->mergeCells('B5:R5')->setCellValue('B5', 'KARTU PENUGASAN');
        $ws->mergeCells('B6:R6')->setCellValue('B6', 'NOMOR : '.$d['nomor']['kp']);
        $ws->getStyle('B5:B6')->applyFromArray(['font' => ['bold' => true], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]]);

        $r = 8;
        $baris = function (string $b, string $c, string $label, $isi, bool $labelDiC = false) use ($ws, &$r) {
            $ws->setCellValueExplicit("B{$r}", $b, DataType::TYPE_STRING);
            if ($labelDiC) {
                $ws->setCellValue("C{$r}", $label);
            } else {
                $ws->setCellValue("C{$r}", $c)->setCellValue("D{$r}", $label);
            }
            $ws->setCellValue("G{$r}", ':');
            if ($isi !== null) {
                $ws->mergeCells("H{$r}:R{$r}")->setCellValue("H{$r}", $isi);
                $ws->getStyle("H{$r}")->getAlignment()->setWrapText(true)->setVertical(Alignment::VERTICAL_TOP);
            }

            return $r++;
        };
        $rObjek = $baris('1.', 'a.', 'Nama objek penugasan', $d['objek']);
        $ws->getRowDimension($rObjek)->setRowHeight(28);
        $baris('', 'b.', 'Alamat dan Nomor Telepon', ' Kabupaten Aceh Barat');
        $ws->setCellValue("H{$r}", 'Telepon :');
        $r++;
        $baris('2.', '', "Rencana {$kk} Nomor", $d['nomor']['rpp'].' tanggal '.$d['rpp']['tanggal_rpp'], true);
        $baris('3.', 'a.', "Program yang di {$kk}", '............................');
        $baris('', 'b.', 'Sasaran Pemeriksaan', '............................');
        $baris('', 'c.', 'Tujuan Pemeriksaan', '............................');
        $baris('4.', '', 'Laporan dikirim kepada', $d['laporan_kepada'], true);
        if ($rangkap) {
            $baris('5.', 'a.', 'PPJ / Pengendali Teknis', $d['wpj']['nama'] ?: '-');
            $hKt = 'b.';
            $hAt = 'c.';
        } else {
            $baris('5.', 'a.', 'Wakil Penanggung Jawab', $d['wpj']['nama'] ?: '-');
            $baris('', 'b.', 'Pengendali Teknis', $d['dalnis']['nama'] ?: '-');
            $hKt = 'c.';
            $hAt = 'd.';
        }
        $baris('', $hKt, 'Ketua Tim', $d['kt']['nama'] ?: '-');
        $anggota = array_values(array_filter($d['anggota'], fn ($a) => $a['nama'] !== ''));
        $ws->setCellValue("C{$r}", $hAt)->setCellValue("D{$r}", 'Anggota Tim')->setCellValue("G{$r}", ':');
        foreach ($anggota ?: [['nama' => '-']] as $i => $a) {
            $ws->setCellValueExplicit("H{$r}", $anggota ? ($i + 1).'.' : '', DataType::TYPE_STRING);
            $ws->mergeCells("I{$r}:R{$r}")->setCellValue("I{$r}", $a['nama']);
            $r++;
        }
        $r++;
        $baris('6.', '', "{$kk} dilakukan dengan Surat Tugas", null, true);
        $baris('', 'a.', 'Nomor', $d['nomor']['st']);
        $rTglSt = $baris('', 'b.', 'Tanggal', $d['tanggal']['st']);
        $baris('', 'c.', 'Dimulai pada tanggal', "=H{$rTglSt}");
        $rRenc = $baris('', 'd.', 'Direncanakan selesai pada tanggal', $d['jangka']['selesai']);
        $baris('', 'e.', 'Selesai pada tanggal', "=H{$rRenc}");
        $baris('7.', '', 'Kunjungan PPJ ke lapangan dan reviu PPJ', null, true);
        $ws->setCellValue("C{$r}", 'Dilaksanakan pada :')->setCellValue("I{$r}", 'Direalisasikan pada tanggal :');
        $r++;
        $ws->setCellValue("C{$r}", '-')->setCellValue("D{$r}", 'Tanggal ....................')->setCellValue("I{$r}", '-')->setCellValue("J{$r}", "=D{$r}");
        $r += 2;

        // 8. Anggaran waktu per orang: HP dari RPP, Jam = HP × 6,5, Realisasi = Anggaran.
        $baris('8.', '', "Anggaran waktu hari produktif Tim {$kk}", null, true);
        $ws->setCellValue("C{$r}", 'Dilaksanakan oleh ')->setCellValue("E{$r}", ':')->setCellValue("J{$r}", 'Anggaran Waktu')->setCellValue("O{$r}", 'Realisasi');
        $r++;
        foreach ($d['anggaran_waktu']['orang'] as $o) {
            $ws->setCellValue("C{$r}", $o['label'])->setCellValue("E{$r}", ':')->setCellValue("F{$r}", $o['nama']);
            $ws->setCellValue("J{$r}", $o['hp'])->setCellValue("K{$r}", 'Hari/')->setCellValue("L{$r}", "=J{$r}*6.5")->setCellValue("M{$r}", 'Jam');
            $ws->setCellValue("O{$r}", "=J{$r}")->setCellValue("P{$r}", 'Hari/')->setCellValue("Q{$r}", "=O{$r}*6.5")->setCellValue("R{$r}", 'Jam');
            $r++;
        }
        $r += 2;

        // 9-10. RMP/RPL dan konsep laporan.
        $ws->setCellValue("B{$r}", '9')->setCellValue("C{$r}", 'Rencana Mulai Pemeriksaan (RMP)')->setCellValue("L{$r}", 'Rencana Penerbitan Laporan (RPL)');
        $r++;
        $rBln = $r;
        $ws->setCellValue("C{$r}", 'bulan ')->setCellValue("F{$r}", $d['jangka']['bulan_mulai'])->setCellValue("L{$r}", 'bulan ')->setCellValue("M{$r}", $d['jangka']['bulan_selesai']);
        $r++;
        $ws->setCellValue("C{$r}", 'Realisasi RMP bulan')->setCellValue("F{$r}", "=F{$rBln}")->setCellValue("L{$r}", 'Realisasi RPL bulan ')->setCellValue("P{$r}", "=M{$rBln}");
        $r++;
        $ws->setCellValueExplicit("B{$r}", '10.', DataType::TYPE_STRING);
        $ws->setCellValue("C{$r}", 'Konsep laporan direncanakan selesai selambat-lambatnya pada bulan '.$d['jangka']['bulan_selesai_tahun']);
        $r++;
        $ws->setCellValue("C{$r}", 'Realisasi konsep laporan diselesaikan pada tanggal : '.$d['jangka']['selesai']);
        $r += 2;

        // Tanda tangan: Inspektur · Pengendali Teknis · Wakil Penanggung Jawab.
        $ws->setCellValue("P{$r}", 'Meulaboh, '.$d['tanggal']['st']);
        $r++;
        $ws->setCellValue("D{$r}", ' Inspektur Kabupaten Aceh Barat');
        if (! $rangkap) {
            $ws->setCellValue("G{$r}", 'Pengendali Teknis');
        }
        $ws->setCellValue("P{$r}", $rangkap ? 'PPJ / Pengendali Teknis' : 'Wakil Penanggung Jawab');
        $r += 3;
        $ws->setCellValue("D{$r}", $d['inspektur']['nama']);
        if (! $rangkap) {
            $ws->setCellValue("G{$r}", $d['dalnis']['nama'] ?: '............');
        }
        $ws->setCellValue("P{$r}", $d['wpj']['nama'] ?: '............');
        $ws->getStyle("D{$r}:P{$r}")->getFont()->setBold(true)->setUnderline(true);
        $r++;
        $ws->setCellValue("D{$r}", 'NIP. '.$d['inspektur']['nip_spasi']);
        if (! $rangkap) {
            $ws->setCellValue("G{$r}", $d['dalnis']['nip_spasi'] ? 'NIP. '.$d['dalnis']['nip_spasi'] : '');
        }
        $ws->setCellValue("P{$r}", $d['wpj']['nip_spasi'] ? 'NIP. '.$d['wpj']['nip_spasi'] : '');
        $ws->getStyle("B1:R{$r}")->getFont()->setName('Bookman Old Style')->setSize(10);
        $ws->getStyle('B5')->getFont()->setSize(12);
    }

    /**
     * KM 7 — Anggaran Waktu Penugasan. Sel dan rumus mengikuti berkas
     * "KM Rev RKA dan DAK Mei 2026.xlsx" (kolom B–Q): Jam = 6,5 × HP; kolom AT
     * HP per orang, Jam = HP × 6,5 × jumlah anggota; Jumlah HP = WPJ+Dalnis+
     * KT+AT; Jumlah Jam = seluruh kolom Jam (di berkas asli baris I lupa
     * kolom Dalnis — diperbaiki); total = I + II + III.
     */
    private function km7($ws, array $d): void
    {
        foreach (['A' => 2, 'B' => 4, 'C' => 4, 'D' => 36, 'E' => 2, 'F' => 2, 'G' => 2, 'H' => 5, 'I' => 6, 'J' => 5, 'K' => 6, 'L' => 5, 'M' => 6, 'N' => 5, 'O' => 6, 'P' => 5, 'Q' => 7] as $k => $w) {
            $ws->getColumnDimension($k)->setWidth($w);
        }
        $aw = $d['anggaran_waktu'];
        $n = (int) $aw['jumlah_anggota'];
        $rangkap = ! empty($d['dalnis_rangkap']);
        $this->kepalaAsli($ws, $d, 'KM 7', 'Q');
        $ws->mergeCells('B5:Q5')->setCellValue('B5', 'ANGGARAN WAKTU PENUGASAN');
        $ws->getStyle('B5')->applyFromArray(['font' => ['bold' => true, 'size' => 12], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]]);
        $ws->setCellValue('B7', 'Nama Objek Penugasan')->setCellValue('F7', ':');
        $ws->mergeCells('G7:Q7')->setCellValue('G7', $d['objek']);
        $ws->getStyle('G7')->getAlignment()->setWrapText(true);
        $ws->getRowDimension(7)->setRowHeight(28);
        $ws->setCellValue('B8', 'Nomor Kartu Penugasan')->setCellValue('F8', ':')->setCellValue('G8', $d['nomor']['kp']);
        $ws->setCellValue('B10', 'Persiapan Penugasan dari')->setCellValue('F10', 'Pelaksanaan Penugasan dari')->setCellValue('N10', 'Penyelesaian Penugasan');
        $ws->setCellValue('B11', $aw['tahap']['persiapan'])->setCellValue('F11', $aw['tahap']['pelaksanaan'])->setCellValue('N11', $aw['tahap']['penyelesaian']);

        $ws->setCellValue('H12', $rangkap ? 'PPJ/Dalnis' : 'WPJ')->setCellValue('J12', 'Dalnis')->setCellValue('L12', 'KT')->setCellValue('N12', 'AT')->setCellValue('P12', 'Jumlah');
        foreach (['H', 'J', 'L', 'N', 'P'] as $c) {
            $ws->setCellValue("{$c}13", 'HP');
        }
        foreach (['I', 'K', 'M', 'O', 'Q'] as $c) {
            $ws->setCellValue("{$c}13", 'Jam');
        }
        $ws->getStyle('B12:Q13')->applyFromArray(['font' => ['bold' => true], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]] + $this->tepi);

        $pk = $d['jenis']['kata_kerja'] === 'Reviu' ? 'Menyusun PKR' : 'Menyusun PKA';
        $items = [
            'I' => ['Penyusunan rencana penugasan', 'Pembicaraan pendahuluan', 'Pengumpulan informasi umum', 'Penelaahan peraturan perUUan', $pk],
            'II' => ['Pemeriksaan (pengembangan) pemeriksaan bukti/dokumen tambahan)', 'Pembicaraan dengan pejabat obrik (interview dan penjelasan)', 'Pemeriksaan fisik/konfirmasi', 'Penyusunan kesimpulan'],
            'III' => ['Pembahasan intern tim dan PPJ', 'Menyusun konsep laporan/daftar lampiran', 'Pembahasan konsep LHP'],
        ];
        $r = 14;
        $barisJumlah = [];
        foreach ($aw['baris'] as $b) {
            $rf = $r;
            $ws->setCellValue("B{$r}", $b['rom'])->setCellValue("C{$r}", $b['judul']);
            foreach (['H' => 'wpj', 'J' => 'dalnis', 'L' => 'kt'] as $col => $peran) {
                if ($b[$peran]['hp'] !== null) {
                    $jamCol = chr(ord($col) + 1);
                    $ws->setCellValue("{$col}{$r}", $b[$peran]['hp'])->setCellValue("{$jamCol}{$r}", "=6.5*{$col}{$r}");
                }
            }
            if ($b['at']['hp'] !== null) {
                $ws->setCellValue("N{$r}", $b['at']['hp']);
                // Anggota seragam: rumus; bila hari anggota berbeda, nilai jam hasil jumlah per orang.
                $ws->setCellValue("O{$r}", is_int($b['at']['hp']) && abs($b['at']['hp'] * 6.5 * $n - (float) $b['at']['jam']) < 0.01 ? "=6.5*N{$r}*{$n}" : $b['at']['jam']);
            }
            $ws->setCellValue("P{$r}", "=H{$r}+J{$r}+L{$r}+N{$r}")->setCellValue("Q{$r}", "=I{$r}+K{$r}+M{$r}+O{$r}");
            $ws->getStyle("B{$r}:Q{$r}")->applyFromArray(['font' => ['bold' => true]] + $this->tepi);
            $r++;
            foreach ($items[$b['rom']] as $i => $it) {
                $ws->setCellValue("C{$r}", $i + 1)->setCellValue("D{$r}", $it);
                $ws->getStyle("B{$r}:Q{$r}")->applyFromArray($this->tepi);
                $r++;
            }
            $ws->setCellValue("B{$r}", 'Jumlah HP/Jam Penugasan '.$b['rom']);
            foreach (['H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'] as $c) {
                $ws->setCellValue("{$c}{$r}", "={$c}{$rf}");
            }
            $ws->getStyle("B{$r}:Q{$r}")->applyFromArray(['font' => ['bold' => true]] + $this->tepi);
            $barisJumlah[] = $r;
            $r++;
        }
        $ws->setCellValue("B{$r}", 'Jumlah HP/Jam Penugasan yang dianggarkan');
        foreach (['H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'] as $c) {
            $ws->setCellValue("{$c}{$r}", '='.implode('+', array_map(fn ($x) => "{$c}{$x}", $barisJumlah)));
        }
        $ws->getStyle("B{$r}:Q{$r}")->applyFromArray(['font' => ['bold' => true]] + $this->tepi);
        $ws->getStyle("H14:Q{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $r += 2;

        $ws->setCellValue("M{$r}", 'Meulaboh, '.$d['tanggal']['st']);
        $r++;
        $ws->setCellValue("D{$r}", 'Disetujui oleh,')->setCellValue("M{$r}", 'Disusun oleh,');
        $r++;
        $ws->setCellValue("D{$r}", $rangkap ? 'PPJ / Pengendali Teknis' : 'Wakil Penanggungjawab')->setCellValue("M{$r}", 'Ketua Tim,');
        if (! $rangkap) {
            $ws->setCellValue("J{$r}", 'Pengendali Teknis');
        }
        $r += 3;
        $ws->setCellValue("D{$r}", $d['wpj']['nama'] ?: '............')->setCellValue("M{$r}", $d['kt']['nama'] ?: '............');
        if (! $rangkap) {
            $ws->setCellValue("J{$r}", $d['dalnis']['nama'] ?: '............');
        }
        $ws->getStyle("D{$r}:M{$r}")->getFont()->setBold(true)->setUnderline(true);
        $r++;
        $ws->setCellValue("D{$r}", $d['wpj']['nip_spasi'] ? 'NIP. '.$d['wpj']['nip_spasi'] : '')->setCellValue("M{$r}", $d['kt']['nip_spasi'] ? 'NIP. '.$d['kt']['nip_spasi'] : '');
        if (! $rangkap) {
            $ws->setCellValue("J{$r}", $d['dalnis']['nip_spasi'] ? 'NIP. '.$d['dalnis']['nip_spasi'] : '');
        }
        $r += 2;
        $ws->setCellValue("G{$r}", 'Mengetahui/Menyetujui :');
        $r++;
        $ws->setCellValue("G{$r}", 'Inspektur Kabupaten Aceh Barat,');
        $r += 3;
        $ws->setCellValue("G{$r}", $d['inspektur']['nama']);
        $ws->getStyle("G{$r}")->getFont()->setBold(true)->setUnderline(true);
        $r++;
        $ws->setCellValue("G{$r}", 'NIP. '.$d['inspektur']['nip_spasi']);
        $ws->getStyle("B1:Q{$r}")->getFont()->setName('Bookman Old Style')->setSize(9);
        $ws->getStyle('B5')->getFont()->setSize(12);
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
