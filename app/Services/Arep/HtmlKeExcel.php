<?php

namespace App\Services\Arep;

use DOMDocument;
use DOMElement;
use DOMNode;
use DOMXPath;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

/**
 * Ubah HTML hasil suntingan pratinjau Kendali Mutu menjadi Excel: tiap
 * lembar (section.km-lembar) satu sheet; tabel dipertahankan (colspan/
 * rowspan), teks lain ditulis per baris. Isi mengikuti persis apa yang
 * diketik pengguna di mode sunting.
 */
class HtmlKeExcel
{
    private const KOLOM = 12;

    public function simpanKe(string $html, string $path): void
    {
        $dom = new DOMDocument;
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="utf-8"?><div id="akar">'.$html.'</div>', LIBXML_NONET);
        libxml_clear_errors();
        $xp = new DOMXPath($dom);
        $lembar = $xp->query("//section[contains(concat(' ', normalize-space(@class), ' '), ' km-lembar ')]");

        $ss = new Spreadsheet;
        $ss->removeSheetByIndex(0);
        $i = 0;
        foreach ($lembar ?: [] as $l) {
            /** @var DOMElement $l */
            $i++;
            $ws = $ss->createSheet();
            $judul = $this->kodeFormulir($l) ?? 'Formulir '.$i;
            $ws->setTitle(mb_substr(preg_replace('/[\\\\\/?*\[\]:]/', ' ', $judul), 0, 31));
            $landscape = str_contains((string) $l->getAttribute('class'), 'landscape');
            $ws->getPageSetup()->setOrientation($landscape ? 'landscape' : 'portrait')->setPaperSize(9)->setFitToWidth(1)->setFitToHeight(1);
            for ($c = 1; $c <= self::KOLOM; $c++) {
                $ws->getColumnDimension(Coordinate::stringFromColumnIndex($c))->setWidth(($landscape ? 150 : 96) / self::KOLOM);
            }
            $r = 1;
            $this->tulisNode($ws, $l, $r);
            $ws->getStyle('A1:'.Coordinate::stringFromColumnIndex(self::KOLOM).max(1, $r))->getFont()->setName('Bookman Old Style')->setSize(9);
        }
        if ($i === 0) {
            $ss->createSheet()->setTitle('Suntingan');
        }
        $ss->setActiveSheetIndex(0);
        (new Xlsx($ss))->save($path);
        $ss->disconnectWorksheets();
    }

    private function kodeFormulir(DOMElement $l): ?string
    {
        if (preg_match('/Formulir\s+KMA\s*(\d+)/u', $l->textContent, $m) || preg_match('/KMA?\s*(\d+)/u', $l->textContent, $m)) {
            return 'KM '.$m[1];
        }

        return null;
    }

    /** Tulis simpul: tabel → grid; blok berteks lain → turunkan; teks daun → satu baris. */
    private function tulisNode($ws, DOMNode $n, int &$r): void
    {
        foreach ($n->childNodes as $ch) {
            if ($ch instanceof DOMElement) {
                $tag = strtolower($ch->tagName);
                if ($tag === 'table') {
                    $this->tulisTabel($ws, $ch, $r);
                    $r++;

                    continue;
                }
                if (in_array($tag, ['style', 'script', 'img'], true)) {
                    continue;
                }
                // Blok daun (tanpa tabel/blok di dalamnya) → satu baris teks.
                if (! $this->punyaBlok($ch)) {
                    $this->tulisTeks($ws, $this->teks($ch), $r);

                    continue;
                }
                // Baris berkolom (flex/grid) tanpa tabel: satu baris Excel,
                // bagian-bagiannya dipisah spasi ("Label : Isi").
                $kelas = ' '.$ch->getAttribute('class').' ';
                if ($ch->getElementsByTagName('table')->length === 0 && (str_contains($kelas, ' flex ') || str_contains($kelas, ' grid '))) {
                    $bagian = [];
                    foreach ($ch->childNodes as $x) {
                        $t = $x instanceof DOMElement ? $this->teks($x) : trim($x->textContent);
                        if ($t !== '') {
                            $bagian[] = $t;
                        }
                    }
                    $this->tulisTeks($ws, implode('   ', $bagian), $r);

                    continue;
                }
                $this->tulisNode($ws, $ch, $r);
            } elseif (trim($ch->textContent) !== '') {
                $this->tulisTeks($ws, trim($ch->textContent), $r);
            }
        }
    }

    private function punyaBlok(DOMElement $e): bool
    {
        foreach ($e->getElementsByTagName('*') as $d) {
            if (in_array(strtolower($d->tagName), ['div', 'table', 'p', 'section', 'ol', 'ul', 'li'], true)) {
                return true;
            }
        }

        return false;
    }

    private function teks(DOMNode $e): string
    {
        $h = '';
        foreach ($e->childNodes as $c) {
            if ($c instanceof DOMElement && strtolower($c->tagName) === 'br') {
                $h .= "\n";
            } else {
                $h .= $c instanceof DOMElement ? $this->teks($c) : $c->textContent;
            }
        }

        return trim(preg_replace('/[ \t]+/', ' ', str_replace("\u{a0}", ' ', $h)));
    }

    private function tulisTeks($ws, string $t, int &$r): void
    {
        if ($t === '') {
            return;
        }
        $akhir = Coordinate::stringFromColumnIndex(self::KOLOM);
        $ws->mergeCells("A{$r}:{$akhir}{$r}");
        $ws->setCellValueExplicit("A{$r}", $t, DataType::TYPE_STRING);
        $ws->getStyle("A{$r}")->getAlignment()->setWrapText(true)->setVertical(Alignment::VERTICAL_TOP);
        $ws->getRowDimension($r)->setRowHeight(13.5 * max(1, substr_count($t, "\n") + (int) ceil(mb_strlen($t) / 110)));
        $r++;
    }

    private function tulisTabel($ws, DOMElement $t, int &$r): void
    {
        $baris = [];
        foreach ($t->getElementsByTagName('tr') as $tr) {
            $sel = [];
            foreach ($tr->childNodes as $td) {
                if ($td instanceof DOMElement && in_array(strtolower($td->tagName), ['td', 'th'], true)) {
                    $sel[] = [$this->teks($td), max(1, (int) $td->getAttribute('colspan')), max(1, (int) $td->getAttribute('rowspan')), strtolower($td->tagName) === 'th' || str_contains((string) $td->getAttribute('class'), 'font-bold')];
                }
            }
            $baris[] = $sel;
        }
        $lebar = max(1, ...array_map(fn ($s) => array_sum(array_column($s, 1)), $baris ?: [[]]));
        $skala = self::KOLOM / $lebar;
        $bergaris = str_contains($t->getElementsByTagName('td')->item(0)?->getAttribute('class') ?? '', 'border');
        $terisi = [];
        foreach ($baris as $sel) {
            $c = 1;
            foreach ($sel as [$isi, $cs, $rs, $tebal]) {
                while (isset($terisi[$r][$c])) {
                    $c++;
                }
                $a = (int) round(($c - 1) * $skala) + 1;
                $z = max($a, (int) round(($c - 1 + $cs) * $skala));
                $rentang = Coordinate::stringFromColumnIndex($a).$r.':'.Coordinate::stringFromColumnIndex($z).($r + $rs - 1);
                if ($z > $a || $rs > 1) {
                    $ws->mergeCells($rentang);
                }
                $ws->setCellValueExplicit(Coordinate::stringFromColumnIndex($a).$r, $isi, DataType::TYPE_STRING);
                $gaya = ['alignment' => ['wrapText' => true, 'vertical' => Alignment::VERTICAL_TOP], 'font' => ['bold' => $tebal]];
                if ($bergaris) {
                    $gaya['borders'] = ['allBorders' => ['borderStyle' => Border::BORDER_THIN]];
                }
                $ws->getStyle($rentang)->applyFromArray($gaya);
                for ($i = 0; $i < $rs; $i++) {
                    for ($j = $c; $j < $c + $cs; $j++) {
                        $terisi[$r + $i][$j] = true;
                    }
                }
                $c += $cs;
            }
            $maks = max(1, ...array_map(fn ($s) => substr_count($s[0], "\n") + 1 + (int) floor(mb_strlen($s[0]) / 40), $sel ?: [['']]));
            $ws->getRowDimension($r)->setRowHeight(13 * min($maks, 30));
            $r++;
        }
    }
}
