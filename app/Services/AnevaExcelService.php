<?php

namespace App\Services;

use App\Models\RppPenugasan;
use App\Models\RppTeamMember;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

/**
 * REKAP LAPORAN RPP dalam Excel — disalin dari REKAP LAPORAN RPP <tahun>.xlsx
 * Bagian Analisis dan Evaluasi (diukur dengan openpyxl):
 *
 *   A No | B RPP (nomor, lalu tanggal di baris ke-3) | C ST (idem) | D OBRIK
 *   (uraian, lalu tiap objek satu baris) | E SIFAT AUDIT | F peran G ":" H nama |
 *   I DK J LK | K T.M.T | L LAPORAN nomor/tanggal per baris objek |
 *   M N O STATUS (hijau / kuning / merah — satu sel diwarnai) | P CAPAIAN Q KET
 *
 * Judul dua baris Bookman 14; seksi per jenis (A.REVIU, ...) satu baris
 * merentang A:Q; tiap ST satu blok: A, E, K, M-O, P, Q merentang seluruh
 * blok; tinggi baris 32,25 (isi) mengikuti berkas asli.
 */
class AnevaExcelService
{
    private const LEBAR = [
        'A' => 3.5, 'B' => 16.8, 'C' => 14.5, 'D' => 44.5, 'E' => 13.9, 'F' => 5.1, 'G' => 1.5, 'H' => 29.5,
        'I' => 6.6, 'J' => 7.8, 'K' => 13.2, 'L' => 32.0, 'M' => 3.1, 'N' => 3.1, 'O' => 3.1, 'P' => 7.9, 'Q' => 12.2,
    ];

    private const WARNA = ['lhp_terbit' => ['M', 'FF00B050'], 'nomor_diminta' => ['N', 'FFFFFF00'], 'st_terbit' => ['O', 'FFFF0000'], 'draft' => ['O', 'FFFF0000'], 'selesai' => ['O', 'FFFF0000']];

    /**
     * @param  Collection<int, RppPenugasan>  $penugasan  sudah dimuat rpp.category, teamMembers, obriks, laporans
     */
    public function buat(int|string $tahun, Collection $penugasan, string $perTanggal): Spreadsheet
    {
        $ss = new Spreadsheet;
        $ws = $ss->getActiveSheet();
        $ws->setTitle('REKAPITULASI PENUGASAN');
        foreach (self::LEBAR as $k => $l) {
            $ws->getColumnDimension($k)->setWidth($l);
        }

        $bookman = ['name' => 'Bookman Old Style', 'size' => 11];
        $tengah = ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true];
        $tipis = ['borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]];

        $judul = $tahun === 'semua'
            ? 'REKAPITULASI LAPORAN HASIL AUDIT/REVIU/MONITORING/EVALUASI TERBIT BERDASARKAN RPP SELURUH TAHUN'
            : "REKAPITULASI LAPORAN HASIL AUDIT/REVIU/MONITORING/EVALUASI TERBIT BERDASARKAN RPP TAHUN ANGGARAN {$tahun}";
        $ws->mergeCells('A1:Q1')->setCellValue('A1', $judul);
        $ws->mergeCells('A2:Q2')->setCellValue('A2', 'PER TANGGAL '.$perTanggal);
        $ws->getStyle('A1:A2')->applyFromArray(['font' => $bookman + ['size' => 14, 'bold' => true], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]]);
        $ws->getRowDimension(1)->setRowHeight(18);
        $ws->getRowDimension(2)->setRowHeight(15.75);

        // kepala kolom baris 4-5 + baris nomor kolom 6
        $kepala = ['A' => 'No', 'B' => 'RPP', 'C' => 'ST', 'D' => 'OBRIK', 'E' => 'SIFAT AUDIT', 'K' => 'T.M.T', 'L' => 'LAPORAN'];
        foreach ($kepala as $k => $v) {
            $ws->mergeCells("{$k}4:{$k}5")->setCellValue("{$k}4", $v);
        }
        $ws->mergeCells('F4:H5')->setCellValue('F4', 'TIM');
        $ws->mergeCells('I4:J4')->setCellValue('I4', 'MASA TUGAS');
        $ws->setCellValue('I5', 'DK')->setCellValue('J5', 'LK');
        $ws->mergeCells('M4:O5')->setCellValue('M4', 'STATUS');
        $ws->mergeCells('P4:Q5')->setCellValue('P4', 'CAPAIAN OUTPUT');
        $ws->getStyle('L4')->getAlignment()->setWrapText(true);
        $ws->setCellValue('L4', "LAPORAN\nNOMOR/TANGGAL");
        $ws->getStyle('A4:Q5')->applyFromArray(['font' => $bookman + ['bold' => true], 'alignment' => $tengah] + $tipis);
        $ws->getRowDimension(4)->setRowHeight(29.25);
        $nomorKolom = ['A' => 1, 'B' => 2, 'C' => 3, 'D' => 4, 'E' => 5, 'F' => 6, 'I' => 7, 'K' => 8, 'L' => 9, 'M' => 10, 'P' => 11];
        foreach ($nomorKolom as $k => $n) {
            $ws->setCellValue("{$k}6", $n);
        }
        foreach (['F6:H6', 'I6:J6', 'M6:O6', 'P6:Q6'] as $g) {
            $ws->mergeCells($g);
        }
        $ws->getStyle('A6:Q6')->applyFromArray(['font' => $bookman + ['size' => 9], 'alignment' => $tengah] + $tipis);

        $r = 7;
        $kelompok = $penugasan->groupBy(fn (RppPenugasan $p) => $p->rpp->category?->code ?? 'Z')->sortKeys();
        foreach ($kelompok as $kode => $daftar) {
            $kat = $daftar->first()->rpp->category;
            $ws->mergeCells("A{$r}:Q{$r}")->setCellValue("A{$r}", $kode.'.'.strtoupper($kat?->name ?? 'LAIN-LAIN'));
            $ws->getStyle("A{$r}")->applyFromArray(['font' => $bookman + ['bold' => true], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER]] + $tipis);
            $ws->getRowDimension($r)->setRowHeight(18);
            $r++;

            foreach ($daftar->values() as $i => $p) {
                $r = $this->blok($ws, $r, $i + 1, $p, $bookman, $tengah, $tipis);
            }
        }

        $ws->mergeCells("A{$r}:Q{$r}")->setCellValue("A{$r}", 'JUMLAH: '.$penugasan->count().' penugasan, '.$penugasan->where('status', 'lhp_terbit')->count().' LHP terbit, '.$penugasan->sum(fn ($p) => $p->laporans->count()).' laporan');
        $ws->getStyle("A{$r}")->applyFromArray(['font' => $bookman + ['bold' => true]] + $tipis);

        $ps = $ws->getPageSetup();
        $ps->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)->setPaperSize(PageSetup::PAPERSIZE_A4)->setFitToWidth(1)->setFitToHeight(0);
        $ps->setPrintArea("A1:Q{$r}")->setRowsToRepeatAtTop([4, 6]);
        $ws->getPageMargins()->setTop(0.75)->setBottom(0.75)->setLeft(0.75)->setRight(0.75);
        $ws->freezePane('A7');

        return $ss;
    }

    private function blok($ws, int $r, int $no, RppPenugasan $p, array $bookman, array $tengah, array $tipis): int
    {
        $laporanObrik = $p->laporans->whereNotNull('rpp_obrik_id')->keyBy('rpp_obrik_id');
        $barisObrik = [];
        foreach ($p->obriks as $o) {
            $l = $laporanObrik->get($o->id);
            $barisObrik[] = ['teks' => $o->nama, 'laporan' => $l];
        }
        foreach ($p->laporans->whereNull('rpp_obrik_id') as $l) {
            $barisObrik[] = ['teks' => '', 'laporan' => $l];
        }
        $tim = $p->teamMembers->values();
        $n = max(count($barisObrik) + 1, $tim->count(), 3);
        $awal = $r;
        $akhir = $r + $n - 1;

        $ws->mergeCells("A{$awal}:A{$akhir}")->setCellValue("A{$awal}", $no);
        $ws->mergeCells("B{$awal}:B".($awal + 1))->setCellValue("B{$awal}", $p->rpp->nomor_rpp);
        $ws->mergeCells("C{$awal}:C".($awal + 1))->setCellValue("C{$awal}", $p->nomor_st ?? '');
        $ws->setCellValue('B'.($awal + 2), $this->tanggal($p->rpp->tanggal_rpp));
        $ws->setCellValue('C'.($awal + 2), $this->tanggal($p->tanggal_st));
        $ws->setCellValue("D{$awal}", $p->uraian ?? '');
        $ws->mergeCells("E{$awal}:E{$akhir}")->setCellValue("E{$awal}", $p->sifat ?? '');
        $ws->mergeCells("K{$awal}:K{$akhir}")->setCellValue("K{$awal}", $p->tmtTampil() ?? '');
        foreach (['M', 'N', 'O', 'P', 'Q'] as $k) {
            $ws->mergeCells("{$k}{$awal}:{$k}{$akhir}");
        }
        $ws->setCellValue("P{$awal}", $p->capaian_output ?? '');
        $ws->setCellValue("Q{$awal}", $p->status === 'batal' ? 'Batal' : ($p->keterangan ?? ''));

        foreach ($barisObrik as $j => $b) {
            $baris = $awal + 1 + $j;
            $ws->setCellValue("D{$baris}", $b['teks'] !== '' ? ($j + 1).'. '.$b['teks'] : '');
            if ($b['laporan']) {
                $ws->setCellValueExplicit("L{$baris}", $b['laporan']->nomor_laporan.($b['laporan']->tanggal_laporan ? "\n".$this->tanggal($b['laporan']->tanggal_laporan) : ''), DataType::TYPE_STRING);
            }
        }
        foreach ($tim as $j => $m) {
            $baris = $awal + $j;
            $ws->setCellValue("F{$baris}", RppTeamMember::PERAN_SINGKAT[$m->role] ?? '');
            $ws->setCellValue("G{$baris}", ':');
            $ws->setCellValue("H{$baris}", $m->nama);
            $ws->setCellValue("I{$baris}", (int) $m->hari_kantor);
            $ws->setCellValue("J{$baris}", (int) $m->hari_lapangan);
        }

        // warna status seperti rekap asli: M hijau, N kuning, O merah
        if (isset(self::WARNA[$p->status])) {
            [$kolom, $rgb] = self::WARNA[$p->status];
            $ws->getStyle("{$kolom}{$awal}:{$kolom}{$akhir}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($rgb);
        }

        $ws->getStyle("A{$awal}:Q{$akhir}")->applyFromArray(['font' => $bookman, 'alignment' => ['vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true]] + $tipis);
        $ws->getStyle("A{$awal}:A{$akhir}")->applyFromArray(['alignment' => $tengah]);
        $ws->getStyle("B{$awal}:C{$akhir}")->applyFromArray(['alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_TOP, 'wrapText' => true]]);
        $ws->getStyle("E{$awal}:E{$akhir}")->applyFromArray(['alignment' => $tengah]);
        $ws->getStyle("F{$awal}:G{$akhir}")->applyFromArray(['font' => $bookman + ['size' => 10]]);
        $ws->getStyle("I{$awal}:J{$akhir}")->applyFromArray(['font' => ['name' => 'Arial', 'size' => 11], 'alignment' => $tengah]);
        $ws->getStyle("K{$awal}:K{$akhir}")->applyFromArray(['alignment' => $tengah]);
        $ws->getStyle("P{$awal}:Q{$akhir}")->applyFromArray(['alignment' => $tengah]);
        // sel-sel di dalam blok tidak berbatas dalam (satu blok tampak satu kotak per kolom)
        foreach (['B', 'C', 'D', 'F', 'G', 'H', 'L'] as $k) {
            $ws->getStyle("{$k}{$awal}:{$k}{$akhir}")->applyFromArray(['borders' => ['horizontal' => ['borderStyle' => Border::BORDER_NONE]]]);
        }
        for ($b = $awal; $b <= $akhir; $b++) {
            $ws->getRowDimension($b)->setRowHeight(32.25);
        }

        return $akhir + 1;
    }

    public function simpanKe(int|string $tahun, Collection $penugasan, string $perTanggal, string $jalur): void
    {
        (new Xlsx($this->buat($tahun, $penugasan, $perTanggal)))->save($jalur);
    }

    private function tanggal($t): string
    {
        return $t ? $t->day.' '.RppPenugasan::BULAN[$t->month].' '.$t->year : '';
    }
}
