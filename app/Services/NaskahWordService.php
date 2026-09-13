<?php

namespace App\Services;

use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Shared\Html;
use PhpOffice\PhpWord\SimpleType\Jc;
use PhpOffice\PhpWord\Style\Tab;

/**
 * Surat pengantar RPP ke Word (.docx) supaya bisa diketik ulang di MS Word.
 * Dua jalur: dari data (surat dibangun bagian demi bagian mengikuti berkas
 * "2__Pengantar RPP ....doc": kop, blok nomor/lampiran/hal, alamat, dua
 * paragraf bernomor, blok tanda tangan Inspektur), atau dari HTML hasil
 * suntingan pratinjau (dikonversi PhpWord).
 */
class NaskahWordService
{
    /**
     * @param  array{nomor_rpp:string, tanggal:string, hal:string, tujuan:string, dasar:string, sebutan:string, dengan_penutup:bool}  $s
     * @param  array{nama:string, nip_spasi:string}  $inspektur
     */
    public function pengantarDariData(array $s, array $inspektur): string
    {
        $doc = new PhpWord;
        $doc->setDefaultFontName('Bookman Old Style');
        $doc->setDefaultFontSize(12);
        $sec = $doc->addSection(['marginTop' => 680, 'marginBottom' => 1134, 'marginLeft' => 1360, 'marginRight' => 708]);

        $kop = public_path('images/erpika/kop-inspektorat.png');
        if (is_file($kop)) {
            $sec->addImage($kop, ['width' => 470, 'alignment' => Jc::CENTER]);
        }

        $tabel = $sec->addTable(['cellMargin' => 0]);
        $tabel->addRow();
        $tabel->addCell(1250)->addText('Nomor');
        $tabel->addCell(250)->addText(':');
        $tabel->addCell(3500)->addText($s['nomor_rpp']);
        $tabel->addCell(4000)->addText('Meulaboh, '.$s['tanggal']);
        $tabel->addRow();
        $tabel->addCell(1250)->addText('Lampiran');
        $tabel->addCell(250)->addText(':');
        $tabel->addCell(3500)->addText('1 (satu) Berkas');
        $tabel->addCell(4000)->addText('Yang Terhormat');
        $tabel->addRow();
        $tabel->addCell(1250)->addText('Hal');
        $tabel->addCell(250)->addText(':');
        $halSisa = preg_replace('/^Penyampaian Rencana\s*/i', '', $s['hal']);
        $selHal = $tabel->addCell(3500);
        $selHal->addText('Penyampaian Rencana', [], ['spaceAfter' => 0]);
        $selHal->addText($halSisa.'.', ['underline' => 'single'], ['spaceAfter' => 0]);
        $selTujuan = $tabel->addCell(4000);
        $selTujuan->addText($s['tujuan'], ['bold' => true], ['spaceAfter' => 0]);
        $selTujuan->addText('  di -', [], ['spaceAfter' => 0]);
        $selTujuan->addText('       Tempat', ['underline' => 'single'], ['spaceAfter' => 0]);

        $sec->addTextBreak(1);
        $par = ['alignment' => Jc::BOTH, 'lineHeight' => 1.5, 'spaceAfter' => 160, 'indentation' => ['left' => 850, 'hanging' => 400]];
        $isi = [
            $s['dasar'],
            'Berkaitan hal tersebut diatas, disampaikan kepada Saudara tentang Rencana Penugasan '.$s['sebutan'].' (terlampir), dan untuk memenuhi hal tersebut di atas diminta kepada Saudara untuk segera membuat dan menyampaikan Surat Tugas (ST) kepada kami, dengan mempedomani PERMENPAN-RB Nomor 19 Tahun 2009 tentang Pedoman Kendali Mutu Audit Aparat Pengawasan Intern Pemerintah.',
        ];
        if ($s['dengan_penutup']) {
            $isi[] = 'Demikian untuk dilaksanakan sebagaimana mestinya, terima kasih.';
        }
        foreach ($isi as $i => $t) {
            $sec->addText(($i + 1).'.'."\t".$t, [], $par + ['tabs' => [new Tab('left', 850)]]);
        }

        $sec->addTextBreak(1);
        $ttd = ['alignment' => Jc::CENTER, 'spaceAfter' => 0, 'indentation' => ['left' => 5400]];
        $sec->addText('INSPEKTUR', [], $ttd);
        $sec->addText('KABUPATEN ACEH BARAT,', [], $ttd);
        $sec->addTextBreak(3);
        $sec->addText(mb_strtoupper(preg_replace('/\s+/', ' ', $inspektur['nama'])), ['bold' => true, 'underline' => 'single'], $ttd);
        $sec->addText('NIP.'.$inspektur['nip_spasi'], [], $ttd);

        return $this->simpan($doc);
    }

    /** Dari HTML hasil suntingan pratinjau (isi yang sudah diketik ulang pengguna). */
    public function dariHtml(string $html): string
    {
        $doc = new PhpWord;
        $doc->setDefaultFontName('Bookman Old Style');
        $doc->setDefaultFontSize(12);
        $sec = $doc->addSection(['marginTop' => 680, 'marginBottom' => 1134, 'marginLeft' => 1360, 'marginRight' => 708]);
        // Hanya elemen yang dipahami PhpWord; kelas Tailwind dibuang, gambar
        // kop diarahkan ke berkas lokal supaya ikut tersemat.
        $bersih = preg_replace('/<(script|style)\b[^>]*>.*?<\/\1>/is', '', $html);
        $bersih = preg_replace('/\s(class|style|data-[a-z-]+|contenteditable)="[^"]*"/i', '', $bersih);
        $bersih = preg_replace_callback('/<img[^>]*src="([^"]+)"[^>]*>/i', function ($m) {
            $lokal = public_path(ltrim(parse_url($m[1], PHP_URL_PATH) ?? '', '/'));

            return is_file($lokal) ? '<img src="'.$lokal.'" width="470" />' : '';
        }, $bersih);
        Html::addHtml($sec, $bersih, false, false);

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
