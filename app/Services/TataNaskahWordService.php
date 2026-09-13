<?php

namespace App\Services;

use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Shared\Html;
use PhpOffice\PhpWord\SimpleType\Jc;

/**
 * Tata naskah penugasan ke Word (.docx) supaya bisa diketik ulang di MS
 * Word. Dua jalur: dari data (tabel dibangun sel demi sel, tiga baris per
 * penugasan seperti berkas "0__no agenda penugasan"), atau dari HTML hasil
 * suntingan pratinjau (dikonversi PhpWord).
 */
class TataNaskahWordService
{
    /** @param  array{judul:string, tahun:int, kolomTim:string, baris:list<array<string,mixed>>}  $d */
    public function dariData(array $d): string
    {
        $doc = new PhpWord;
        $doc->setDefaultFontName('Times New Roman');
        $doc->setDefaultFontSize(10);
        $s = $doc->addSection(['orientation' => 'landscape', 'marginLeft' => 900, 'marginRight' => 900, 'marginTop' => 900, 'marginBottom' => 900]);
        $s->addText($d['judul'], ['bold' => true, 'size' => 12], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
        $s->addText((string) $d['tahun'], ['bold' => true, 'size' => 12], ['alignment' => Jc::CENTER, 'spaceAfter' => 200]);

        $garis = ['borderSize' => 6, 'borderColor' => '000000'];
        $tabel = $s->addTable(['borderSize' => 6, 'borderColor' => '000000', 'cellMargin' => 40, 'alignment' => Jc::CENTER]);
        $lebar = [700, 2300, 2300, 2000, 2000, 2600, 1800];
        $tengah = ['alignment' => Jc::CENTER, 'spaceAfter' => 0];
        $kepala = ['bold' => true];

        $tabel->addRow();
        foreach (['No', 'RPP', 'SP', 'ST', 'KP', $d['kolomTim'], "LHP\nNomor / Tanggal"] as $i => $judul) {
            $sel = $tabel->addCell($lebar[$i], ['valign' => 'center'] + $garis);
            foreach (explode("\n", $judul) as $b) {
                $sel->addText($b, $kepala, $tengah);
            }
        }
        $tabel->addRow();
        foreach (range(1, 7) as $i => $n) {
            $tabel->addCell($lebar[$i], $garis)->addText((string) $n, ['size' => 8], $tengah);
        }

        $tgl = fn (?string $iso) => $iso ? substr($iso, 8, 2).'/'.substr($iso, 5, 2).'/'.substr($iso, 0, 4) : '';
        $tanpaBawah = ['borderBottomSize' => 0, 'borderBottomColor' => 'FFFFFF'];
        $tanpaAtas = ['borderTopSize' => 0, 'borderTopColor' => 'FFFFFF'];
        foreach ($d['baris'] as $b) {
            $tabel->addRow();
            $isi1 = [(string) $b['no'], $b['nomor_rpp'], $b['nomor_sp'] ?? '', $b['nomor_st'] ?? '', $b['nomor_kp'] ?? '', '', $b['lhp']['nomor'] ?? ''];
            foreach ($isi1 as $i => $t) {
                $tabel->addCell($lebar[$i], $garis + $tanpaBawah)->addText($t, [], $tengah);
            }
            $tabel->addRow();
            foreach (['', '', '', '', '', $b['ketua_tim'] ?? '', ''] as $i => $t) {
                $tabel->addCell($lebar[$i], $garis + $tanpaAtas + $tanpaBawah)->addText($t, [], $i === 5 ? ['spaceAfter' => 0] : $tengah);
            }
            $tabel->addRow();
            $isi3 = ['', $tgl($b['tanggal_rpp']), $tgl($b['tanggal_st']), $tgl($b['tanggal_st']), $tgl($b['tanggal_st']), '', $tgl($b['lhp']['tanggal'] ?? null)];
            foreach ($isi3 as $i => $t) {
                $tabel->addCell($lebar[$i], $garis + $tanpaAtas)->addText($t, [], $tengah);
            }
        }

        return $this->simpan($doc);
    }

    /** Dari HTML hasil suntingan pratinjau (isi tabel yang sudah diketik ulang pengguna). */
    public function dariHtml(string $html): string
    {
        $doc = new PhpWord;
        $doc->setDefaultFontName('Times New Roman');
        $doc->setDefaultFontSize(10);
        $s = $doc->addSection(['orientation' => 'landscape', 'marginLeft' => 900, 'marginRight' => 900, 'marginTop' => 900, 'marginBottom' => 900]);
        // Hanya elemen yang dipahami PhpWord; atribut gaya/kelas dibuang dan
        // tabel diberi garis sendiri supaya hasilnya rapi di Word.
        $bersih = preg_replace('/<(script|style)\b[^>]*>.*?<\/\1>/is', '', $html);
        $bersih = preg_replace('/\s(class|style|data-[a-z-]+|contenteditable)="[^"]*"/i', '', $bersih);
        $bersih = str_replace('<table', '<table border="1" cellpadding="3" style="border-collapse:collapse;width:100%"', $bersih);
        Html::addHtml($s, $bersih, false, false);

        return $this->simpan($doc);
    }

    private function simpan(PhpWord $doc): string
    {
        $tmp = tempnam(sys_get_temp_dir(), 'naskah').'.docx';
        IOFactory::createWriter($doc, 'Word2007')->save($tmp);
        $isi = file_get_contents($tmp);
        @unlink($tmp);

        return $isi;
    }
}
