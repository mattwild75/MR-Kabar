<?php

namespace App\Services;

use App\Models\Lhp;
use App\Support\KodeLhp;
use Illuminate\Support\Carbon;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

/**
 * Matriks LHP dalam Excel — setara berkas "matriks LHP ... .XLS" SimHPPemda
 * (kolom Temuan → Penyebab → Rekomendasi → Tindak Lanjut per temuan), tetapi
 * DILENGKAPI: identitas LHP, susunan tim pemeriksa, dan KETERANGAN tiap kode
 * (bukan sekadar <0810>, melainkan "08 … · 0810 …"). Proper dan ringkas.
 */
class LhpMatriksExcelService
{
    private array $tepi = ['borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '999999']]]];

    private array $atasKiri = ['alignment' => ['vertical' => Alignment::VERTICAL_TOP, 'wrapText' => true]];

    public function simpanKe(Lhp $lhp, string $path): void
    {
        $ss = new Spreadsheet;
        $ws = $ss->getActiveSheet();
        $ws->setTitle('Matriks LHP');
        foreach (['A' => 5, 'B' => 52, 'C' => 52, 'D' => 52, 'E' => 46] as $k => $w) {
            $ws->getColumnDimension($k)->setWidth($w);
        }
        $ws->getDefaultRowDimension()->setRowHeight(-1);

        $r = 1;
        $ws->mergeCells("A{$r}:E{$r}")->setCellValue("A{$r}", 'MATRIKS LAPORAN HASIL PEMERIKSAAN');
        $ws->getStyle("A{$r}")->applyFromArray(['font' => ['bold' => true, 'size' => 14], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]]);
        $r++;
        $ws->mergeCells("A{$r}:E{$r}")->setCellValue("A{$r}", $lhp->nama_obrik);
        $ws->getStyle("A{$r}")->applyFromArray(['font' => ['bold' => true], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'wrapText' => true]]);
        $r += 2;

        // --- Identitas ---
        $ket = fn (string $g, string $d, ?string $kg, ?string $k) => $this->kodeKet($g, $d, $kg, $k);
        $ident = [
            ['Nomor LHP', $lhp->nomor_lhp, 'Tanggal LHP', $this->tgl($lhp->tanggal_lhp)],
            ['Nomor Surat Tugas', $lhp->nomor_st ?: '-', 'Tanggal ST', $this->tgl($lhp->tanggal_st)],
            ['Tahun PKPT', $lhp->tahun_pkpt ?: '-', 'Tahun Anggaran', $lhp->tahun_anggaran ?: '-'],
            ['Inspektorat', $lhp->inspektorat ?: '-', 'Bidang/Unit', $lhp->bidang_unit ?: '-'],
            ['Lingkup Audit', $this->gabung($lhp->kode_group_jenis_periksa, KodeLhp::label('group_jenis', $lhp->kode_group_jenis_periksa)), 'Jenis Audit', $this->gabung($lhp->kode_jenis_periksa, KodeLhp::label('jenis', $lhp->kode_jenis_periksa))],
            ['Penanggung Jawab', $lhp->nama_pj ? $lhp->nama_pj.($lhp->nip_pj ? ' (NIP '.$lhp->nip_pj.')' : '') : '-', 'Status', Lhp::STATUS[$lhp->status_lhp] ?? $lhp->status_lhp],
            ['Nilai Anggaran', $this->rp($lhp->nilai_anggaran), 'Anggaran Diaudit', $this->rp($lhp->anggaran_diaudit)],
        ];
        foreach ($ident as [$l1, $v1, $l2, $v2]) {
            $ws->setCellValue("A{$r}", $l1)->setCellValue("B{$r}", $v1)->setCellValue("C{$r}", $l2);
            $ws->mergeCells("D{$r}:E{$r}")->setCellValue("D{$r}", $v2);
            $ws->getStyle("A{$r}")->getFont()->setBold(true);
            $ws->getStyle("C{$r}")->getFont()->setBold(true);
            $ws->getStyle("A{$r}:E{$r}")->getAlignment()->setVertical(Alignment::VERTICAL_TOP)->setWrapText(true);
            $r++;
        }
        $r++;

        // --- Tim pemeriksa ---
        if ($lhp->tim->isNotEmpty()) {
            $ws->mergeCells("A{$r}:E{$r}")->setCellValue("A{$r}", 'TIM PEMERIKSA');
            $ws->getStyle("A{$r}")->getFont()->setBold(true);
            $r++;
            $ws->setCellValue("A{$r}", 'No')->setCellValue("B{$r}", 'Nama')->setCellValue("C{$r}", 'NIP');
            $ws->mergeCells("D{$r}:E{$r}")->setCellValue("D{$r}", 'Jabatan dalam Pemeriksaan');
            $ws->getStyle("A{$r}:E{$r}")->applyFromArray(['font' => ['bold' => true], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]] + $this->tepi);
            $r++;
            foreach ($lhp->tim as $i => $m) {
                $ws->setCellValue("A{$r}", $i + 1);
                $ws->setCellValueExplicit("B{$r}", (string) $m->nama, DataType::TYPE_STRING);
                $ws->setCellValueExplicit("C{$r}", (string) ($m->nip ?? ''), DataType::TYPE_STRING);
                $ws->mergeCells("D{$r}:E{$r}")->setCellValue("D{$r}", $m->jabatan ?? '');
                $ws->getStyle("A{$r}:E{$r}")->applyFromArray($this->tepi + ['alignment' => ['vertical' => Alignment::VERTICAL_TOP]]);
                $ws->getStyle("A{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $r++;
            }
            $r++;
        }

        // --- Matriks temuan ---
        $ws->setCellValue("A{$r}", 'No')->setCellValue("B{$r}", 'TEMUAN')->setCellValue("C{$r}", 'PENYEBAB')->setCellValue("D{$r}", 'REKOMENDASI')->setCellValue("E{$r}", 'TINDAK LANJUT');
        $ws->getStyle("A{$r}:E{$r}")->applyFromArray(['font' => ['bold' => true], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER], 'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'EFEFEF']]] + $this->tepi);
        $r++;

        foreach ($lhp->temuan as $t) {
            $temuan = $this->sel($t->memo, $ket('group_temuan', 'temuan', $t->kode_group, $t->kode), $this->rp($t->nilai));
            $sebabTxt = [];
            $rekomTxt = [];
            $tlTxt = [];
            foreach ($t->sebab as $si => $s) {
                $sebabTxt[] = $this->sel(($t->sebab->count() > 1 ? ($si + 1).'. ' : '').$s->memo, $ket('group_sebab', 'sebab', $s->kode_group, $s->kode), null);
                foreach ($s->rekomendasi as $r2) {
                    $rekomTxt[] = $this->sel($r2->memo, $ket('group_rekomendasi', 'rekomendasi', $r2->kode_group, $r2->kode), $this->rp($r2->nilai));
                    foreach ($r2->tindakLanjut as $tl) {
                        $tlTxt[] = $this->sel(
                            trim(($tl->tanggal ? '('.$this->tgl($tl->tanggal).') ' : '').($tl->memo ?? '')),
                            $ket('group_tl', 'tl', $tl->kode_group, $tl->kode),
                            $this->rp($tl->nilai)
                        );
                    }
                }
            }
            $ws->setCellValue("A{$r}", $t->no);
            $ws->setCellValueExplicit("B{$r}", $temuan, DataType::TYPE_STRING);
            $ws->setCellValueExplicit("C{$r}", implode("\n\n", $sebabTxt), DataType::TYPE_STRING);
            $ws->setCellValueExplicit("D{$r}", implode("\n\n", $rekomTxt), DataType::TYPE_STRING);
            $ws->setCellValueExplicit("E{$r}", $tlTxt ? implode("\n\n", $tlTxt) : '-', DataType::TYPE_STRING);
            $ws->getStyle("A{$r}:E{$r}")->applyFromArray($this->atasKiri + $this->tepi);
            $ws->getStyle("A{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $r++;
        }

        // Rekap nilai temuan di kaki.
        $ws->setCellValue("A{$r}", '')->setCellValue("B{$r}", 'JUMLAH NILAI TEMUAN');
        $ws->mergeCells("C{$r}:E{$r}")->setCellValue("C{$r}", $this->rp((float) $lhp->temuan->sum(fn ($t) => (float) $t->nilai)));
        $ws->getStyle("A{$r}:E{$r}")->applyFromArray(['font' => ['bold' => true]] + $this->tepi);

        (new Xlsx($ss))->save($path);
        $ss->disconnectWorksheets();
    }

    private function sel(?string $memo, string $kodeKet, ?string $nilai): string
    {
        $out = trim((string) $memo);
        if ($kodeKet !== '') {
            $out .= ($out !== '' ? "\n" : '').$kodeKet;
        }
        if ($nilai !== null && $nilai !== '-') {
            $out .= "\nNilai: ".$nilai;
        }

        return $out === '' ? '-' : $out;
    }

    private function kodeKet(string $grpJenis, string $detJenis, ?string $kg, ?string $k): string
    {
        $bag = [];
        if ($kg) {
            $bag[] = trim($kg.' '.(KodeLhp::label($grpJenis, $kg) ?? ''));
        }
        if ($k) {
            $bag[] = trim($k.' '.(KodeLhp::label($detJenis, $k) ?? ''));
        }
        $bag = array_values(array_filter($bag));

        return $bag ? 'Kode: '.implode(' · ', $bag) : '';
    }

    private function gabung(?string $kode, ?string $label): string
    {
        if (! $kode && ! $label) {
            return '-';
        }

        return trim(($kode ?? '').($kode && $label ? ' — ' : '').($label ?? ''));
    }

    private function rp(mixed $n): ?string
    {
        if ($n === null || (float) $n == 0.0) {
            return null;
        }

        return 'Rp '.number_format((float) $n, 0, ',', '.');
    }

    private function tgl(mixed $t): string
    {
        return $t ? Carbon::parse($t)->translatedFormat('d M Y') : '-';
    }
}
