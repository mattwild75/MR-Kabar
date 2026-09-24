<?php

namespace App\Services\Arep;

use App\Support\Arep\KmFormulir;
use App\Support\Arep\KmKatalog;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
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
                default => ($spek = KmFormulir::untuk($no, $d)) ? $this->spek($ws, $meta, $spek) : null,
            };
        }
        $ss->setActiveSheetIndex(0);
        (new Xlsx($ss))->save($path);
        $ss->disconnectWorksheets();
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

    /**
     * Tulis formulir KMA dari spesifikasi KmFormulir (satu sumber dengan
     * tampilan cetak): judul, info, tabel (kepala bertingkat, baris nomor
     * kolom), teks, dan tanda tangan.
     *
     * @param  array<string,mixed>  $meta
     * @param  array{blok: list<array<string,mixed>>}  $spek
     */
    private function spek($ws, array $meta, array $spek): void
    {
        $land = $meta['orientasi'] === 'landscape';
        // Lebar grid = tabel terlebar; lebar kolom mengikuti proporsi tabel itu.
        $tabel = array_values(array_filter($spek['blok'], fn ($b) => $b['jenis'] === 'tabel'));
        $lebarTabel = fn ($t) => array_sum(array_map(fn ($s) => is_array($s) ? ($s['c'] ?? 1) : 1, $t['kepala'][0] ?? []));
        $n = max(6, ...array_map($lebarTabel, $tabel ?: [['kepala' => [[]]]]));
        $acuan = collect($tabel)->first(fn ($t) => $lebarTabel($t) === $n && ! empty($t['lebar']));
        $proporsi = $acuan['lebar'] ?? array_fill(0, $n, 100 / $n);
        $total = $land ? 150 : 96;
        $kol = fn (int $i) => Coordinate::stringFromColumnIndex($i);
        foreach ($proporsi as $i => $p) {
            $ws->getColumnDimension($kol($i + 1))->setWidth(max(2.5, $total * $p / array_sum($proporsi)));
        }
        $akhir = $kol($n);
        $lebarKar = fn (int $a, int $b) => array_sum(array_map(fn ($i) => $ws->getColumnDimension($kol($i))->getWidth(), range($a, $b)));
        $tinggi = function (int $r, string $t, int $a, int $b) use ($ws, $lebarKar) {
            $baris = 0;
            foreach (explode("\n", $t) as $l) {
                $baris += max(1, (int) ceil(mb_strlen($l) / max(1, $lebarKar($a, $b) * 1.1)));
            }
            $sekarang = $ws->getRowDimension($r)->getRowHeight();
            $ws->getRowDimension($r)->setRowHeight(max($sekarang > 0 ? $sekarang : 0, 13.5 * $baris));
        };

        $ws->getStyle("A1:{$akhir}300")->getFont()->setName('Bookman Old Style')->setSize(9);
        $ws->setCellValue('A1', 'INSPEKTORAT KABUPATEN ACEH BARAT')->setCellValue("{$akhir}1", 'Formulir '.str_replace('KM ', 'KMA ', $meta['kode']));
        $ws->getStyle('A1')->getFont()->setBold(true);
        $ws->getStyle("{$akhir}1")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $r = 3;

        foreach ($spek['blok'] as $b) {
            switch ($b['jenis']) {
                case 'judul':
                    foreach ($b['baris'] as $j => $t) {
                        $ws->mergeCells("A{$r}:{$akhir}{$r}")->setCellValue("A{$r}", $t);
                        $ws->getStyle("A{$r}")->applyFromArray(['font' => ['bold' => $j === 0, 'size' => $j === 0 && empty($b['kecil']) ? 12 : 10], 'alignment' => ['horizontal' => empty($b['kiri']) ? Alignment::HORIZONTAL_CENTER : Alignment::HORIZONTAL_LEFT]]);
                        $r++;
                    }
                    $r++;
                    break;

                case 'info':
                    $dua = collect($b['isi'])->contains(fn ($x) => count($x) > 2);
                    $tengah = $dua ? intdiv($n, 2) : $n;
                    $lbl = max(1, (int) round($tengah * 0.35));
                    foreach ($b['isi'] as $x) {
                        $pasang = [[$x[0] ?? '', $x[1] ?? null, 1, $tengah]];
                        if ($dua) {
                            $pasang[] = [$x[2] ?? '', $x[3] ?? null, $tengah + 1, $n];
                        }
                        foreach ($pasang as [$l, $v, $a, $z]) {
                            if ($l === '') {
                                continue;
                            }
                            $l2 = min($z - 1, $a + $lbl - 1);
                            $ws->mergeCells($kol($a).$r.':'.$kol($l2).$r)->setCellValue($kol($a).$r, $l);
                            $isi = ': '.($v ?? '..............................');
                            $ws->mergeCells($kol($l2 + 1).$r.':'.$kol($z).$r);
                            $ws->setCellValueExplicit($kol($l2 + 1).$r, $isi, DataType::TYPE_STRING);
                            $ws->getStyle($kol($a).$r.':'.$kol($z).$r)->getAlignment()->setWrapText(true)->setVertical(Alignment::VERTICAL_TOP);
                            $tinggi($r, $isi, $l2 + 1, $z);
                        }
                        $r++;
                    }
                    $r++;
                    break;

                case 'tabel':
                    $m = $lebarTabel($b);
                    $garis = empty($b['tanpaGaris']);
                    $terisi = [];
                    $tulisBaris = function (array $sel, bool $kepala) use ($ws, $kol, $n, $m, &$r, &$terisi, $garis, $tinggi) {
                        $c = 1;
                        foreach ($sel as $s) {
                            while (isset($terisi[$r][$c])) {
                                $c++;
                            }
                            $s = is_array($s) ? $s : ['t' => (string) $s];
                            $cs = $s['c'] ?? 1;
                            $rs = $s['r'] ?? 1;
                            $akhirKol = $c + $cs - 1 === $m ? $n : $c + $cs - 1; // kolom terakhir tabel meluas ke tepi
                            $rentang = $kol($c).$r.':'.$kol($akhirKol).($r + $rs - 1);
                            if ($akhirKol > $c || $rs > 1) {
                                $ws->mergeCells($rentang);
                            }
                            $ws->setCellValueExplicit($kol($c).$r, (string) $s['t'], DataType::TYPE_STRING);
                            $gaya = ['alignment' => ['wrapText' => true, 'vertical' => $kepala ? Alignment::VERTICAL_CENTER : Alignment::VERTICAL_TOP,
                                'horizontal' => match ($s['a'] ?? ($kepala ? 'c' : 'l')) { 'c' => Alignment::HORIZONTAL_CENTER, 'r' => Alignment::HORIZONTAL_RIGHT, default => Alignment::HORIZONTAL_LEFT }],
                                'font' => ['bold' => ($kepala && $garis) || ! empty($s['b'])]];
                            if ($garis) {
                                $gaya += $this->tepi;
                            }
                            if ($kepala && $garis) {
                                $gaya['fill'] = ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'EFEFEF']];
                            }
                            $ws->getStyle($rentang)->applyFromArray($gaya);
                            for ($i = 0; $i < $rs; $i++) {
                                for ($j = $c; $j <= $c + $cs - 1; $j++) {
                                    $terisi[$r + $i][$j] = true;
                                }
                            }
                            if ($rs === 1) {
                                $tinggi($r, (string) $s['t'], $c, $akhirKol);
                            }
                            $c += $cs;
                        }
                        $r++;
                    };
                    foreach ($b['kepala'] as $k) {
                        $tulisBaris($k, true);
                    }
                    if (! empty($b['nomor'])) {
                        $tulisBaris(array_map(fn ($i) => ['t' => (string) $i, 'a' => 'c', 'b' => true], range(1, $m)), false);
                    }
                    foreach ($b['baris'] ?? [] as $x) {
                        $tulisBaris($x, false);
                    }
                    for ($i = 0; $i < ($b['kosong'] ?? 0); $i++) {
                        $tulisBaris(array_map(fn ($j) => $j === 1 && empty($b['baris']) ? (string) ($i + 1) : '', range(1, $m)), false);
                        $ws->getRowDimension($r - 1)->setRowHeight(18);
                    }
                    foreach ($b['kaki'] ?? [] as $x) {
                        $tulisBaris($x, false);
                    }
                    $r++;
                    break;

                case 'teks':
                    foreach ($b['isi'] as $t) {
                        $ws->mergeCells("A{$r}:{$akhir}{$r}")->setCellValueExplicit("A{$r}", $t, DataType::TYPE_STRING);
                        $ws->getStyle("A{$r}")->getAlignment()->setWrapText(true)->setVertical(Alignment::VERTICAL_TOP)
                            ->setHorizontal(($b['rata'] ?? '') === 'rata' ? Alignment::HORIZONTAL_JUSTIFY : Alignment::HORIZONTAL_LEFT);
                        $tinggi($r, $t, 1, $n);
                        $r++;
                    }
                    $r++;
                    break;

                case 'ttd':
                    if (! empty($b['tanggal'])) {
                        $ws->mergeCells($kol(max(1, $n - (int) floor($n / 2) + 1)).$r.':'.$akhir.$r)->setCellValue($kol(max(1, $n - (int) floor($n / 2) + 1)).$r, $b['tanggal']);
                        $r++;
                    }
                    $k = count($b['kolom']);
                    $blok = [];
                    for ($i = 0; $i < $k; $i++) {
                        $a = 1 + (int) floor($i * $n / $k);
                        $z = (int) floor(($i + 1) * $n / $k);
                        $blok[] = [$a, max($a, $z), $b['kolom'][$i]];
                    }
                    foreach ([0, 1, 'kosong', 2, 3] as $j => $idx) {
                        foreach ($blok as [$a, $z, $x]) {
                            $t = match ($idx) {
                                0 => (string) ($x[0] ?? ''),
                                1 => (string) ($x[1] ?? ''),
                                2 => ($x[1] ?? '') !== '' ? (string) ($x[2] ?? '(..............................)') : '',
                                3 => ($x[1] ?? '') !== '' && ($x[2] ?? null) ? 'NIP. '.($x[3] ?? '..............') : '',
                                default => '',
                            };
                            $ws->mergeCells($kol($a).$r.':'.$kol($z).$r)->setCellValueExplicit($kol($a).$r, $t, DataType::TYPE_STRING);
                            $ws->getStyle($kol($a).$r)->applyFromArray(['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER], 'font' => ['bold' => $idx === 2, 'underline' => $idx === 2]]);
                        }
                        if ($idx === 'kosong') {
                            $ws->getRowDimension($r)->setRowHeight(45);
                        }
                        $r++;
                    }
                    $r++;
                    break;
            }
        }
        $ws->getPageSetup()->setFitToWidth(1)->setFitToHeight(1);
    }
}
