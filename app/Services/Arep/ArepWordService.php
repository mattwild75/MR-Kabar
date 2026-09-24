<?php

namespace App\Services\Arep;

use App\Support\Arep\PedomanKendaliMutu;
use PhpOffice\PhpWord\Element\Section;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\SimpleType\Jc;
use PhpOffice\PhpWord\Style\Tab;

/**
 * Paket Surat Tugas (ST/SP/Pernyataan) dan Keputusan Inspektur ke Word
 * (.docx) supaya bisa diketik ulang di MS Word. Isi dibangun bagian demi
 * bagian mengikuti berkas asli Inspektorat (kop, blok nomor/hal, tabel tim,
 * blok tanda tangan). Huruf Bookman Old Style 12pt seperti berkas aslinya.
 */
class ArepWordService
{
    /** @param array<string,mixed> $d */
    public function paketSuratTugas(array $d, string $dok = 'semua'): string
    {
        $doc = $this->doc();
        $urut = $dok === 'semua' ? ['st', 'sp', 'pernyataan'] : [$dok];
        foreach ($urut as $bagian) {
            $sec = $this->section($doc);
            match ($bagian) {
                'st' => $this->tulisSt($sec, $d),
                'sp' => $this->tulisSp($sec, $d),
                'pernyataan' => $this->tulisPernyataan($sec, $d),
                default => null,
            };
        }

        return $this->simpan($doc);
    }

    /**
     * Draft Keputusan Inspektur tentang Pedoman Kendali Mutu Pengawasan Intern
     * beserta LAMPIRAN lengkapnya (Bab I–X dan daftar Formulir KM). Isi dari
     * App\Support\Arep\PedomanKendaliMutu — sumber yang sama dengan pratinjau.
     * Nomor dan tanggal dikosongkan untuk diisi saat penetapan.
     */
    public function keputusanInspektur(): string
    {
        $p = PedomanKendaliMutu::isi();
        $k = $p['keputusan'];
        $tahun = now()->year;
        $insp = \App\Models\RppSetting::inspektur();
        $nip = preg_replace('/\D/', '', (string) ($insp?->nip ?? ''));
        $nipS = strlen($nip) === 18 ? substr($nip, 0, 8).' '.substr($nip, 8, 6).' '.substr($nip, 14, 1).' '.substr($nip, 15) : '............';
        $namaInsp = mb_strtoupper((string) ($insp?->nama ?? '............'));

        $doc = $this->doc();
        $sec = $doc->addSection(['marginTop' => 900, 'marginBottom' => 1000, 'marginLeft' => 1500, 'marginRight' => 1100]);
        $this->kop($sec, ['kop' => [
            'kabupaten' => 'PEMERINTAH KABUPATEN ACEH BARAT', 'instansi' => 'INSPEKTORAT',
            'alamat' => 'Jalan Imam Bonjol Km. 4,5 Telp. 0655 – 7552672', 'email' => 'e-mail : inspektoratkab.acehbarat@gmail.com', 'kota' => 'MEULABOH',
        ]]);
        $c = ['alignment' => Jc::CENTER, 'spaceAfter' => 0];
        $sec->addText('KEPUTUSAN INSPEKTUR KABUPATEN ACEH BARAT', ['bold' => true], $c);
        $sec->addText('NOMOR : ......../......../INS/'.$tahun, [], $c);
        $sec->addTextBreak(1);
        $sec->addText('TENTANG', ['bold' => true], $c);
        $sec->addText($k['judul'], ['bold' => true], $c);
        $sec->addTextBreak(1);
        $sec->addText('INSPEKTUR KABUPATEN ACEH BARAT,', ['bold' => true], $c);
        $sec->addTextBreak(1);

        $blokDasar = function (string $label, array $butir, string $gaya) use ($sec) {
            $t = $sec->addTable(['cellMargin' => 30]);
            foreach ($butir as $i => $isi) {
                $t->addRow();
                $t->addCell(1700)->addText($i === 0 ? $label : '', [], ['spaceAfter' => 60]);
                $t->addCell(300)->addText($i === 0 ? ':' : '', [], ['spaceAfter' => 60]);
                $t->addCell(500)->addText($gaya === 'huruf' ? chr(97 + $i).'.' : ($i + 1).'.', [], ['spaceAfter' => 60]);
                $t->addCell(6800)->addText($isi, [], ['alignment' => Jc::BOTH, 'spaceAfter' => 60]);
            }
            $sec->addTextBreak(1);
        };
        $blokDasar('Menimbang', $k['menimbang'], 'huruf');
        $blokDasar('Mengingat', $k['mengingat'], 'angka');
        $blokDasar('Memperhatikan', $k['memperhatikan'], 'angka');

        $sec->addText('MEMUTUSKAN :', ['bold' => true], $c);
        $sec->addTextBreak(1);
        $t = $sec->addTable(['cellMargin' => 30]);
        $t->addRow();
        $t->addCell(1700)->addText('Menetapkan');
        $t->addCell(300)->addText(':');
        $t->addCell(7300)->addText('KEPUTUSAN INSPEKTUR TENTANG '.$k['judul'].'.', ['bold' => true], ['alignment' => Jc::BOTH]);
        foreach ($k['diktum'] as [$d, $isi]) {
            $t->addRow();
            $t->addCell(1700)->addText($d, ['bold' => true], ['spaceAfter' => 100]);
            $t->addCell(300)->addText(':', [], ['spaceAfter' => 100]);
            $t->addCell(7300)->addText($isi, [], ['alignment' => Jc::BOTH, 'spaceAfter' => 100]);
        }
        $this->ttdPenetapan($sec, $tahun, $namaInsp, $nipS);

        // ---------------- LAMPIRAN
        $lam = $doc->addSection(['marginTop' => 900, 'marginBottom' => 1000, 'marginLeft' => 1500, 'marginRight' => 1100, 'breakType' => 'nextPage']);
        $kanan = ['spaceAfter' => 0, 'indentation' => ['left' => 4800]];
        foreach (['LAMPIRAN', 'KEPUTUSAN INSPEKTUR KABUPATEN ACEH BARAT', 'NOMOR    : ......../......../INS/'.$tahun, 'TANGGAL : ....................'.$tahun, 'TENTANG  : '.$k['judul']] as $b) {
            $lam->addText($b, ['size' => 10], $kanan);
        }
        $lam->addTextBreak(1);
        $lam->addText($k['judul'], ['bold' => true, 'size' => 13], ['alignment' => Jc::CENTER, 'spaceAfter' => 200]);

        $par = ['alignment' => Jc::BOTH, 'spaceAfter' => 120, 'lineHeight' => 1.3, 'indentation' => ['firstLine' => 567]];
        foreach ($p['bab'] as $bab) {
            $lam->addTextBreak(1);
            $lam->addText($bab['nomor'], ['bold' => true], $c);
            $lam->addText($bab['judul'], ['bold' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 200]);
            foreach ($bab['bagian'] as $bg) {
                if ($bg['judul'] !== '') {
                    $lam->addText($bg['judul'], ['bold' => true], ['spaceBefore' => 120, 'spaceAfter' => 80]);
                }
                foreach ($bg['isi'] as $x) {
                    if (is_string($x)) {
                        $lam->addText($x, [], $par);
                    } else {
                        $this->daftarWord($lam, $x);
                    }
                }
            }
        }

        // Daftar formulir
        $lam->addTextBreak(1);
        $lam->addText('DAFTAR FORMULIR KENDALI MUTU', ['bold' => true], $c);
        $lam->addTextBreak(1);
        $tb = $lam->addTable(['borderSize' => 6, 'borderColor' => '000000', 'cellMargin' => 60]);
        $tb->addRow();
        foreach (['No' => 700, 'Kode' => 1100, 'Nama Formulir' => 4800, 'Tahapan' => 2700] as $h => $w) {
            $tb->addCell($w, ['bgColor' => 'EFEFEF'])->addText($h, ['bold' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
        }
        foreach ($p['formulir'] as $i => [$kode, $nama, $tahap]) {
            $tb->addRow();
            $tb->addCell(700)->addText(($i + 1).'.', [], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
            $tb->addCell(1100)->addText($kode, [], ['spaceAfter' => 0]);
            $tb->addCell(4800)->addText($nama, [], ['spaceAfter' => 0]);
            $tb->addCell(2700)->addText($tahap, [], ['spaceAfter' => 0]);
        }
        $lam->addTextBreak(1);
        $lam->addText('Bentuk setiap formulir diterbitkan melalui aplikasi ERPIKA menu AREP > Kendali Mutu (PDF dan Excel), satu lembar per formulir.', ['italic' => true, 'size' => 10], ['alignment' => Jc::BOTH]);
        $this->ttdPenetapan($lam, $tahun, $namaInsp, $nipS, false);

        return $this->simpan($doc);
    }

    /** @param array<string,mixed> $x */
    private function daftarWord(Section $sec, array $x): void
    {
        if (isset($x['tabel'])) {
            [$kepala, $baris] = $x['tabel'];
            $t = $sec->addTable(['borderSize' => 6, 'borderColor' => '000000', 'cellMargin' => 60]);
            $lebar = [2300, 2600, 4400];
            $t->addRow();
            foreach ($kepala as $i => $h) {
                $t->addCell($lebar[$i] ?? 2000, ['bgColor' => 'EFEFEF'])->addText($h, ['bold' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
            }
            foreach ($baris as $r) {
                $t->addRow();
                foreach ($r as $i => $v) {
                    $t->addCell($lebar[$i] ?? 2000)->addText($v, [], ['spaceAfter' => 0]);
                }
            }
            $sec->addTextBreak(1);

            return;
        }
        $jenis = isset($x['angka']) ? 'angka' : (isset($x['huruf']) ? 'huruf' : 'butir');
        foreach ($x[$jenis] as $i => $b) {
            [$teks, $sub] = is_array($b) ? [$b[0], $b[1] ?? []] : [$b, []];
            $pen = match ($jenis) { 'angka' => ($i + 1).'.', 'huruf' => chr(97 + $i).'.', default => '•' };
            $sec->addText($pen."\t".$teks, [], ['alignment' => Jc::BOTH, 'spaceAfter' => 60, 'indentation' => ['left' => 850, 'hanging' => 425], 'tabs' => [new Tab('left', 850)]]);
            foreach ($sub as $j => $s) {
                $sec->addText(chr(97 + $j).".\t".$s, [], ['alignment' => Jc::BOTH, 'spaceAfter' => 40, 'indentation' => ['left' => 1275, 'hanging' => 425], 'tabs' => [new Tab('left', 1275)]]);
            }
        }
    }

    private function ttdPenetapan(Section $sec, int $tahun, string $nama, string $nip, bool $lengkap = true): void
    {
        $sec->addTextBreak(1);
        $ttd = ['alignment' => Jc::CENTER, 'spaceAfter' => 0, 'indentation' => ['left' => 4800]];
        if ($lengkap) {
            $sec->addText('Ditetapkan di Meulaboh', [], $ttd);
            $sec->addText('pada tanggal .................... '.$tahun, [], $ttd);
            $sec->addTextBreak(1);
        }
        $sec->addText('INSPEKTUR KABUPATEN ACEH BARAT,', [], $ttd);
        $sec->addTextBreak(3);
        $sec->addText($nama, ['bold' => true, 'underline' => 'single'], $ttd);
        $sec->addText('NIP. '.$nip, [], $ttd);
    }

    /** @param array<string,mixed> $d */
    private function tulisSt(Section $sec, array $d): void
    {
        $this->kop($sec, $d);
        $ct = ['alignment' => Jc::CENTER, 'spaceAfter' => 0];
        $sec->addText('SURAT TUGAS', ['bold' => true, 'underline' => 'single', 'size' => 13], $ct);
        $sec->addText('Nomor : '.$d['nomor']['st'], [], $ct);
        $sec->addTextBreak(1);
        $sec->addText('Inspektur Kabupaten Aceh Barat dengan ini menugaskan kepada:', [], ['spaceAfter' => 120]);

        $this->tabelTim($sec, $d);

        $par = ['alignment' => Jc::BOTH, 'spaceAfter' => 120, 'lineHeight' => 1.4];
        $sec->addText('Untuk melakukan penugasan '.$d['frasa'].'.', [], $par);
        $sec->addText('Kegiatan tersebut akan dilaksanakan selama '.$d['jangka']['hari_kerja'].' ('.$d['jangka']['hari_kerja_terbilang'].') hari kerja, terhitung mulai tanggal '.$d['jangka']['rentang'].'.', [], $par);
        $sec->addText('Penugasan ini agar dilaksanakan dengan sebaik-baiknya dan penuh tanggung jawab.', [], $par);

        $this->ttdInspektur($sec, $d);
    }

    /** @param array<string,mixed> $d */
    private function tulisSp(Section $sec, array $d): void
    {
        $this->kop($sec, $d);
        $t = $sec->addTable(['cellMargin' => 0]);
        $t->addRow();
        $t->addCell(1400)->addText('Nomor');
        $t->addCell(250)->addText(':');
        $t->addCell(4200)->addText($d['nomor']['sp']);
        $t->addCell(3800)->addText('Meulaboh, '.$d['tanggal']['surat']);
        $t->addRow();
        $t->addCell(1400)->addText('Lampiran');
        $t->addCell(250)->addText(':');
        $t->addCell(4200)->addText('1 (satu) lembar');
        $sel = $t->addCell(3800);
        $sel->addText('Kepada Yth,', [], ['spaceAfter' => 0]);
        foreach ($d['kepada'] ?: ['Pimpinan Perangkat Daerah terkait'] as $k) {
            $sel->addText($k, ['bold' => true], ['spaceAfter' => 0]);
        }
        if (count($d['kepada']) > 1) {
            $sel->addText('Masing-masing', [], ['spaceAfter' => 0]);
        }
        $sel->addText('di -', [], ['spaceAfter' => 0]);
        $sel->addText('        Tempat', ['underline' => 'single'], ['spaceAfter' => 0]);
        $t->addRow();
        $t->addCell(1400)->addText('Hal');
        $t->addCell(250)->addText(':');
        $t->addCell(4200)->addText('Pelaksanaan '.$d['jenis']['sebutan'], ['underline' => 'single']);
        $t->addCell(3800);

        $sec->addTextBreak(1);
        $sec->addText('Berdasarkan :', [], ['spaceAfter' => 80]);
        $par = ['alignment' => Jc::BOTH, 'spaceAfter' => 80, 'indentation' => ['left' => 850, 'hanging' => 400], 'tabs' => [new Tab('left', 850)]];
        foreach ($d['dasar_hukum'] as $i => $t2) {
            $sec->addText(($i + 1).'.'."\t".$t2, [], $par);
        }
        $sec->addTextBreak(1);
        $isi = [
            'Kami akan melaksanakan penugasan '.$d['frasa'].', untuk itu kami menugaskan Tim sebagaimana Surat Tugas terlampir.',
            'Biaya terkait penugasan ini menjadi beban dalam Dokumen Pelaksanaan Anggaran Inspektorat Kabupaten Aceh Barat Tahun Anggaran '.($d['rpp']['tahun'] ?? '').'.',
            'Kami harap agar Saudara tidak memberikan gratifikasi dalam bentuk apapun kepada Tim.',
            'Atas perhatian dan kerjasama yang baik, kami ucapkan terima kasih.',
        ];
        foreach ($isi as $t2) {
            $sec->addText($t2, [], ['alignment' => Jc::BOTH, 'spaceAfter' => 120, 'lineHeight' => 1.4]);
        }
        $this->ttdInspektur($sec, $d);
        $sec->addTextBreak(1);
        $sec->addText('Tembusan :', [], ['spaceAfter' => 0]);
        foreach (['Bupati Aceh Barat di Meulaboh (sebagai laporan);', 'Kepala BPKD Kabupaten Aceh Barat;', 'Pertinggal.'] as $i => $tb) {
            $sec->addText(($i + 1).'. '.$tb, ['size' => 11], ['spaceAfter' => 0]);
        }
    }

    /** @param array<string,mixed> $d */
    private function tulisPernyataan(Section $sec, array $d): void
    {
        $this->kop($sec, $d);
        $ct = ['alignment' => Jc::CENTER, 'spaceAfter' => 0];
        $sec->addText('PERNYATAAN INDEPENDENSI DAN INTEGRITAS', ['bold' => true, 'underline' => 'single', 'size' => 13], $ct);
        $sec->addTextBreak(1);
        $par = ['alignment' => Jc::BOTH, 'spaceAfter' => 120, 'lineHeight' => 1.4];
        $sec->addText('Berdasarkan Surat Tugas Inspektur Kabupaten Aceh Barat Nomor: '.$d['nomor']['st'].' Tanggal '.$d['tanggal']['st'].' tentang '.$d['frasa'].', kami yang bertandatangan di bawah ini menyatakan bahwa kami tidak mempunyai hubungan kekerabatan, usaha, dan tidak terdapat benturan kepentingan dalam melaksanakan tugas tersebut.', [], $par);
        $sec->addText('Dalam melaksanakan tugas sebagaimana disebutkan di atas, kami menyatakan:', [], ['spaceAfter' => 80]);
        $pernyataan = [
            'Bekerja secara profesional, penuh semangat dan menjunjung tinggi integritas, konsisten serta bertanggung jawab.',
            'Mengutamakan kepentingan Negara di atas segala kepentingan lainnya.',
            'Tidak menyalahgunakan kewenangan jabatan baik langsung maupun tidak langsung untuk kepentingan pribadi, kelompok maupun golongan tertentu.',
            'Menjaga martabat dan menghindari diri dari perbuatan tercela.',
            'Tidak menerima segala pemberian dalam bentuk apapun baik langsung maupun tidak langsung yang menyebabkan kewajiban kami menjadi bertentangan dengan pelaksanaan tugas.',
            'Menjadi teladan dalam pemberantasan korupsi, kolusi dan nepotisme (KKN).',
            'Menjaga rahasia negara sesuai ketentuan yang berlaku.',
        ];
        $pp = ['alignment' => Jc::BOTH, 'spaceAfter' => 80, 'indentation' => ['left' => 850, 'hanging' => 400], 'tabs' => [new Tab('left', 850)]];
        foreach ($pernyataan as $i => $t2) {
            $sec->addText(($i + 1).'.'."\t".$t2, [], $pp);
        }
        $sec->addText('Demikian pernyataan ini kami buat untuk dapat dipergunakan seperlunya.', [], $par);
        $sec->addTextBreak(1);

        $tanda = ! empty($d['dalnis_rangkap'])
            ? ['pj' => 'Penanggung Jawab', 'wpj' => 'PPJ / Pengendali Teknis', 'kt' => 'Ketua Tim']
            : ['pj' => 'Penanggung Jawab', 'wpj' => 'Wakil Penanggung Jawab', 'dalnis' => 'Pengendali Teknis', 'kt' => 'Ketua Tim'];
        $tb = $sec->addTable(['cellMargin' => 40]);
        $i = 1;
        foreach ($tanda as $role => $label) {
            if (! empty($d[$role]['nama'])) {
                $this->barisTtd($tb, $i++, $label, $d[$role]['nama']);
            }
        }
        foreach ($d['anggota'] as $a) {
            $this->barisTtd($tb, $i++, 'Anggota Tim', $a['nama']);
        }
    }

    private function barisTtd($tabel, int $no, string $label, string $nama): void
    {
        $tabel->addRow();
        $tabel->addCell(600)->addText($no.'.');
        $tabel->addCell(3400)->addText($label);
        $tabel->addCell(250)->addText(':');
        $tabel->addCell(3800)->addText($nama);
        $tabel->addCell(2400)->addText('(............................)', [], ['alignment' => Jc::CENTER]);
    }

    /** @param array<string,mixed> $d */
    private function tabelTim(Section $sec, array $d): void
    {
        $t = $sec->addTable(['borderSize' => 6, 'borderColor' => '000000', 'cellMargin' => 60, 'alignment' => Jc::CENTER]);
        $t->addRow();
        $head = ['NO' => 600, 'NAMA / NIP' => 4200, 'JABATAN' => 3000, 'PERAN DALAM TIM' => 2400];
        foreach ($head as $h => $w) {
            $t->addCell($w, ['valign' => 'center'])->addText($h, ['bold' => true], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
        }
        foreach ($d['tim'] as $m) {
            $t->addRow();
            $t->addCell(600)->addText($m['no'].'.', [], ['alignment' => Jc::CENTER, 'spaceAfter' => 0]);
            $sel = $t->addCell(4200);
            $sel->addText($m['nama'], [], ['spaceAfter' => 0]);
            $sel->addText('NIP. '.$m['nip_spasi'], ['size' => 10], ['spaceAfter' => 0]);
            $t->addCell(3000)->addText($m['jabatan'], [], ['spaceAfter' => 0]);
            $t->addCell(2400)->addText($m['peran'], [], ['spaceAfter' => 0]);
        }
        $sec->addTextBreak(1);
    }

    /** @param array<string,mixed> $d */
    private function ttdInspektur(Section $sec, array $d): void
    {
        $sec->addTextBreak(1);
        $ttd = ['alignment' => Jc::CENTER, 'spaceAfter' => 0, 'indentation' => ['left' => 5200]];
        $sec->addText('Meulaboh, '.$d['tanggal']['surat'], [], $ttd);
        $sec->addText('Inspektur Kabupaten Aceh Barat,', [], $ttd);
        $sec->addTextBreak(3);
        $sec->addText($d['inspektur']['nama'], ['bold' => true, 'underline' => 'single'], $ttd);
        if (! empty($d['inspektur']['pangkat'])) {
            $sec->addText($d['inspektur']['pangkat'], [], $ttd);
        }
        $sec->addText('NIP. '.$d['inspektur']['nip_spasi'], [], $ttd);
    }

    /** @param array<string,mixed> $d */
    private function kop(Section $sec, array $d): void
    {
        $kop = public_path('images/erpika/kop-inspektorat.png');
        if (is_file($kop)) {
            $sec->addImage($kop, ['width' => 470, 'alignment' => Jc::CENTER]);
            $sec->addTextBreak(1);

            return;
        }
        $c = ['alignment' => Jc::CENTER, 'spaceAfter' => 0];
        $sec->addText($d['kop']['kabupaten'], ['bold' => true, 'size' => 14], $c);
        $sec->addText($d['kop']['instansi'], ['bold' => true, 'size' => 18], $c);
        $sec->addText($d['kop']['alamat'], ['size' => 10], $c);
        $sec->addText($d['kop']['email'], ['size' => 10], $c);
        $sec->addText($d['kop']['kota'], ['bold' => true, 'size' => 12], $c);
        $sec->addTextBreak(1);
    }

    private function doc(): PhpWord
    {
        $doc = new PhpWord;
        $doc->setDefaultFontName('Bookman Old Style');
        $doc->setDefaultFontSize(12);

        return $doc;
    }

    private function section(PhpWord $doc): Section
    {
        return $doc->addSection(['marginTop' => 680, 'marginBottom' => 1000, 'marginLeft' => 1360, 'marginRight' => 900, 'breakType' => 'nextPage']);
    }

    private function simpan(PhpWord $doc): string
    {
        $tmp = tempnam(sys_get_temp_dir(), 'arep').'.docx';
        IOFactory::createWriter($doc, 'Word2007')->save($tmp);
        $isi = file_get_contents($tmp);
        @unlink($tmp);

        return $isi;
    }
}
