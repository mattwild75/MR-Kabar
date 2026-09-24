<?php

namespace App\Support\Arep;

use App\Models\RppPenugasan;

/**
 * Spesifikasi bentuk Formulir Kendali Mutu (KMA) menurut lampiran Pedoman
 * Kendali Mutu Audit (Keputusan Inspektur Aceh No. 700/2352/IA/2021, adopsi
 * Permenpan RB 19/2009). SATU sumber untuk tampilan cetak (React → PDF) dan
 * Excel, sehingga keduanya identik. KM 6 dan KM 7 memakai bentuk berkas KM
 * Inspektorat Aceh Barat (komponen khusus), KM 27 memakai Surat Tugas.
 *
 * Bentuk blok:
 *  - judul : ['jenis'=>'judul','baris'=>[..]]
 *  - info  : ['jenis'=>'info','isi'=>[[label, nilai], ..]] (nilai null = titik-titik);
 *            dua kolom: [[labelKiri, nilaiKiri, labelKanan, nilaiKanan], ..]
 *  - tabel : ['jenis'=>'tabel','kepala'=>[[sel..]..],'nomor'=>bool,'baris'=>[[sel..]..],'kosong'=>n,'kaki'=>[[sel..]..],'lebar'=>[..]]
 *            sel = teks atau ['t'=>teks,'c'=>colspan,'r'=>rowspan,'a'=>'l|c|r','b'=>bool]
 *  - teks  : ['jenis'=>'teks','isi'=>[..],'rata'=>'kiri|tengah|kanan|rata']
 *  - ttd   : ['jenis'=>'ttd','kolom'=>[[pra, jabatan, nama|null, nip|null], ..]]
 */
class KmFormulir
{
    private const TITIK = '..............................';

    /** @param array<string,mixed> $d @return array<string,mixed>|null */
    public static function untuk(int $no, array $d): ?array
    {
        $f = new self($d);

        return match ($no) {
            1 => $f->kma1(), 2 => $f->kma2(), 3 => $f->kma3(), 4 => $f->kma4(), 5 => $f->kma5(),
            8 => $f->kma8(), 9 => $f->kma9(), 10 => $f->kma10(), 11 => $f->kma11(), 12 => $f->kma12(),
            13 => $f->kma13(), 14 => $f->kma14(), 15 => $f->kma15(), 16 => $f->kma16(), 17 => $f->kma17(),
            18 => $f->kma18(), 19 => $f->kma19(), 20 => $f->kma20(), 21 => $f->kma21(), 22 => $f->kma22(),
            23 => $f->kma23(), 24 => $f->kma24(), 25 => $f->kma25(), 26 => $f->kma26(), 27 => $f->kma27(), 28 => $f->kma28(),
            29 => $f->kma29(), 30 => $f->kma30(),
            default => null,
        };
    }

    /** @param array<string,mixed> $d */
    private function __construct(private array $d) {}

    // ------------------------------------------------------------ bantu

    private function nama(string $peran): ?string
    {
        $n = $this->d[$peran]['nama'] ?? '';

        return $n !== '' ? $n : null;
    }

    private function nip(string $peran): ?string
    {
        $n = $this->d[$peran]['nip_spasi'] ?? '';

        return $n !== '' && ! str_starts_with($n, '...') ? $n : null;
    }

    /** Penanggung Jawab Teknis (= Pengendali Teknis; s.d. 2025 dirangkap PPJ). */
    private function pjt(): ?string
    {
        return $this->nama('dalnis');
    }

    private function tahun(): string
    {
        return (string) ($this->d['rpp']['tahun'] ?? '20..');
    }

    /** @return list<string> */
    private function namaTim(): array
    {
        return array_values(array_filter(array_map(fn ($m) => $m['nama'], $this->d['tim'])));
    }

    private function periode(): string
    {
        return $this->d['jangka']['rentang'];
    }

    private function h(string $t, int $c = 1, int $r = 1): array
    {
        return ['t' => $t, 'c' => $c, 'r' => $r, 'h' => true];
    }

    /** @param list<string> $l */
    private function kepalaSederhana(array $l): array
    {
        return [array_map(fn ($t) => $this->h($t), $l)];
    }

    private function judul(string ...$baris): array
    {
        return ['jenis' => 'judul', 'baris' => $baris];
    }

    private function angka(int|float $n): string
    {
        return $n ? number_format((float) $n, 0, ',', '.') : '';
    }

    private function rp(int|float $n): string
    {
        return $n ? 'Rp '.number_format((float) $n, 0, ',', '.') : '';
    }

    // ------------------------------------------------------------ formulir

    private function kma1(): array
    {
        return ['blok' => [
            $this->judul('TUJUAN, SASARAN DAN STRATEGI AUDIT'),
            ['jenis' => 'tabel', 'kepala' => $this->kepalaSederhana(['No', 'Tujuan, Sasaran dan Strategi', 'Penanggung Jawab Sasaran dan Strategi', 'Misi', 'Keterangan']), 'nomor' => true, 'kosong' => 8, 'lebar' => [4, 30, 26, 24, 16]],
        ]];
    }

    private function kma2(): array
    {
        $k = [
            [$this->h('Nama Auditi', 1, 2), $this->h('Besaran Resiko Audit', 1, 2), $this->h('Tenaga Auditor/ Pengawas Pemerintah yang dimiliki Inspektorat', 4), $this->h('Tenaga Tata Usaha Inspektorat', 3), $this->h('Sarana dan Prasarana Inspektorat', 3), $this->h('Dana', 2), $this->h('Lain-lain', 1, 2)],
            [$this->h('Penanggung Jawab'), $this->h('Penanggung Jawab Teknis'), $this->h('Ketua Tim'), $this->h('Anggota Tim'), $this->h('Gol IV'), $this->h('Gol III'), $this->h('Gol II'), $this->h('Komputer'), $this->h('Kendaraan'), $this->h('Lainnya'), $this->h('SPPD'), $this->h('Lainnya')],
        ];

        return ['blok' => [$this->judul('PETA AUDIT', 'TAHUN '.$this->tahun()), ['jenis' => 'tabel', 'kepala' => $k, 'nomor' => true, 'kosong' => 8]]];
    }

    private function kma3(): array
    {
        $t = (int) $this->tahun();
        $k = [
            [$this->h('No', 1, 2), $this->h('Auditi', 1, 2), $this->h('Tanggal LHP Terakhir', 1, 2), $this->h('Resiko', 1, 2), $this->h('Frekuensi Audit', 1, 2), $this->h('Jenis Audit', 1, 2), $this->h('Tahun', 5)],
            [$this->h('I'), $this->h('II'), $this->h('III'), $this->h('IV'), $this->h('V')],
        ];

        return ['blok' => [$this->judul('RENCANA AUDIT JANGKA MENENGAH 5 TAHUNAN', '( TAHUN '.($t ?: '20..').' s.d. TAHUN '.($t ? $t + 4 : '20..').' )'), ['jenis' => 'tabel', 'kepala' => $k, 'nomor' => true, 'kosong' => 8, 'lebar' => [4, 26, 11, 9, 9, 13, 6, 6, 6, 6, 6]]]];
    }

    /** Baris KMA 4/5 untuk penugasan ini: satu baris per anggota tim. */
    private function barisPkpt(bool $usulan): array
    {
        $mg = $this->d['minggu_tugas'];
        $baris = [];
        foreach ($this->d['tim'] as $i => $m) {
            $baris[] = [
                $i === 0 ? '1' : '', $i === 0 ? $this->d['objek'] : '', '',
                $i === 0 && $mg ? (string) min($mg) : '', $i === 0 && $mg ? (string) max($mg) : '',
                $m['nama'], $m['peran'],
                $i === 0 ? $this->rp($this->d['biaya_sppd']) : '', $i === 0 ? (string) $this->d['jumlah_laporan'] : '',
                $i === 0 ? ($usulan ? '' : 'Inspektorat Kabupaten Aceh Barat') : '',
            ];
        }

        return $baris;
    }

    private function kmaPkpt(string $judul, string $kolom10, bool $usulan): array
    {
        $k = [
            [$this->h('No', 1, 2), $this->h('Auditi', 1, 2), $this->h('Resiko', 1, 2), $this->h('Minggu Ke-', 2), $this->h('Nama Auditor/Pengawas Pemerintahan', 1, 2), $this->h('Jabatan', 1, 2), $this->h('Biaya (Rp)', 1, 2), $this->h('LHP', 1, 2), $this->h($kolom10, 1, 2)],
            [$this->h('Mulai'), $this->h('Selesai')],
        ];

        return ['blok' => [
            $this->judul($judul, 'TAHUN AUDIT '.$this->tahun()),
            ['jenis' => 'tabel', 'kepala' => $k, 'nomor' => true, 'baris' => $this->barisPkpt($usulan), 'kosong' => 3, 'lebar' => [4, 24, 7, 6, 6, 18, 12, 10, 5, 12]],
        ]];
    }

    private function kma4(): array
    {
        return $this->kmaPkpt('USULAN PROGRAM KERJA PEMERIKSAAN TAHUNAN', 'Keterangan', true);
    }

    private function kma5(): array
    {
        return $this->kmaPkpt('PROGRAM KERJA PEMERIKSAAN TAHUNAN', 'Unit yang Melaksanakan', false);
    }

    private function kma8(): array
    {
        return ['blok' => [
            $this->judul('LAPORAN MINGGUAN', 'KEGIATAN PERENCANAAN AUDIT PADA TINGKAT TIM AUDIT'),
            ['jenis' => 'info', 'isi' => [
                ['Nama Auditi', $this->d['objek'], 'Ketua Tim', $this->nama('kt')],
                ['Alamat', 'Kabupaten Aceh Barat', 'Penanggung Jawab Teknis', $this->pjt()],
                ['No. Surat Tugas', $this->d['nomor']['st'].' tanggal '.$this->d['tanggal']['st'], '', ''],
                ['Nama Auditor', implode(', ', $this->namaTim()), '', ''],
            ]],
            ['jenis' => 'tabel', 'kepala' => $this->kepalaSederhana(['Tgl', 'Prosedur', 'Realisasi Jam', 'Anggaran Jam', 'Realisasi Biaya', 'Anggaran Biaya']), 'nomor' => true, 'kosong' => 8,
                'kaki' => [[['t' => 'Total', 'c' => 2, 'a' => 'c', 'b' => true], '', '', '', '']], 'lebar' => [10, 40, 12, 12, 13, 13]],
            ['jenis' => 'teks', 'isi' => ['Catatan :']],
            ['jenis' => 'ttd', 'kolom' => [['', 'Ketua Tim', $this->nama('kt'), $this->nip('kt')], ['', 'Penanggung Jawab Teknis', $this->pjt(), $this->nip('dalnis')]]],
        ]];
    }

    private function kma9(): array
    {
        return ['blok' => [
            $this->judul('PROGRAM KERJA AUDIT'),
            ['jenis' => 'info', 'isi' => [
                ['Unit Organisasi/Program/Kegiatan', $this->d['objek']],
                ['Tahun', $this->tahun()],
                ['Dikerjakan Oleh', $this->nama('kt')],
            ]],
            ['jenis' => 'tabel', 'kepala' => $this->kepalaSederhana(['No', 'Tujuan Audit', 'Prosedur/ukuran sampel/metode pemilihan sampel dan waktu', 'Nama Auditor', 'Anggaran Waktu', 'Realisasi Waktu', 'No. KKP']), 'nomor' => true, 'kosong' => 10, 'lebar' => [4, 24, 30, 16, 9, 9, 8]],
            ['jenis' => 'ttd', 'kolom' => [['Disetujui oleh,', 'Penanggung Jawab Teknis', $this->pjt(), $this->nip('dalnis')], ['Disusun oleh,', 'Ketua Tim', $this->nama('kt'), $this->nip('kt')]]],
        ]];
    }

    /** @param list<string|array{0:string,1:list<string>}> $butir */
    private function checklist(array $butir): array
    {
        $baris = [];
        foreach ($butir as $i => $b) {
            $teks = is_array($b) ? $b[0]."\n".implode("\n", array_map(fn ($x) => '•  '.$x, $b[1])) : $b;
            $baris[] = [['t' => (string) ($i + 1), 'a' => 'c'], $teks, '', ''];
        }

        return $baris;
    }

    private function kma10(): array
    {
        $b = [
            'Sudahkah dibuat Kartu Penugasan',
            'Sudahkah dikembangkan Tujuan Audit, Lingkup Pekerjaan, Penaksian Resiko Segmen Kegiatan',
            ['Apakah sudah diperoleh :', ['Misi, tujuan dan rencana pelaksanaan', 'Informasi organisasi', 'KKP terakhir', 'File permanen', 'LHP auditor ekstern', 'Data pembanding', 'Anggaran', 'Literatur teknis']],
            'Adakah perubahan auditor dari rencana semula',
            'Jika ada perubahan apakah sudah dibuat Memo persetujuan dan sudah dilampirkan ke Kartu Penugasan di Penangung jawab',
            'Apakah sudah dibuat rapat koordinasi',
            'Apakah sudah dibuat ringkasannya dan telah didistribusikan',
            'Apakah sudah dibuat persiapan survei pendahuluan',
            'Apakah survei pendahuluan sudah dilaksanakan',
            'Apakah telah dibuat ikhtisar hasil survei',
            'Apakah telah ditulis program audit',
            'Apakah program audit telah mengacu pada program baku dan hasil pengumpulan informasi',
            'Apakah program audit telah mendapat persetujuan penanggung jawab teknis',
            ['Apakah tahapan pekerjaan telah sesuai dengan anggaran waktunya', ['Penetapan tujuan, lingkup dan penaksiran resiko', 'Pengumpulan informasi awal', 'Penetapan staf audit', 'Rapat pendahuluan', 'Survei pendahuluan', 'Penulisan program audit', 'Persetujuan program audit']],
            'Apakah Kertas Kerja Pemeriksaan perencanaan telah selesai dikerjakan',
        ];

        return ['blok' => [
            $this->judul('CHECK LIST', 'PENYELESAIAN PENUGASAN PERENCANAAN AUDIT'),
            ['jenis' => 'info', 'isi' => [['Nama Auditi', $this->d['objek']], ['Nomor Surat Tugas', $this->d['nomor']['st']]]],
            ['jenis' => 'tabel', 'kepala' => $this->kepalaSederhana(['No', 'Jenis Pekerjaan yang Harus Dilakukan', 'Sudah/Belum', '% Penyelesaian']), 'nomor' => true, 'baris' => $this->checklist($b), 'lebar' => [6, 64, 14, 16]],
            ['jenis' => 'ttd', 'kolom' => [['Diketahui :', 'Penanggung Jawab', $this->nama('pj'), $this->nip('pj')], ['Dibuat tanggal :', 'Penanggung Jawab Teknis', $this->pjt(), $this->nip('dalnis')]]],
        ]];
    }

    private function kma11(): array
    {
        $at = array_values(array_filter(array_map(fn ($a) => $a['nama'], $this->d['anggota'])));
        $tahap = $this->d['anggaran_waktu']['tahap'];
        $isi = [
            'Berdasarkan hasil rapat koordinasi antara tim audit dengan auditi '.$this->d['objek'].' pada :',
            '        Hari        : ..............................',
            '        Tanggal   : ..............................',
            '        Waktu      : ..............................',
            'Dihadiri oleh :',
        ];
        $tim = [];
        $maks = max(3, count($this->namaTim()));
        for ($i = 0; $i < $maks; $i++) {
            $tim[] = [($i + 1).'. ..............................', ($i + 1).'. '.($this->namaTim()[$i] ?? '..............................')];
        }
        $blok = [
            $this->judul('NOTULENSI KESEPAKATAN'),
            ['jenis' => 'teks', 'isi' => $isi],
            ['jenis' => 'tabel', 'tanpaGaris' => true, 'kepala' => [[['t' => 'Tim Auditi :', 'a' => 'l'], ['t' => 'Tim Auditor :', 'a' => 'l']]], 'baris' => $tim, 'lebar' => [50, 50]],
            ['jenis' => 'teks', 'isi' => [
                'Diperoleh kesepakatan sebagai berikut :',
                '1.  Tujuan audit : ..............................................................',
                '     Prosedur audit yang akan dilaksanakan adalah sebagai berikut :',
                '     •  ..............................................................',
                '     •  ..............................................................',
                '2.  Waktu pelaksanaan audit',
                '     •  Survei pendahuluan  : '.$tahap['persiapan'],
                '     •  Pelaksanaan audit      : '.$tahap['pelaksanaan'],
                '     •  Penyelesaian laporan : '.$tahap['penyelesaian'],
                '3.  Tim audit yang akan ditugaskan :',
                '     •  Penanggung Jawab           : '.($this->nama('pj') ?? self::TITIK),
                '     •  Penanggung Jawab Teknis : '.($this->pjt() ?? self::TITIK),
                '     •  Ketua Tim                       : '.($this->nama('kt') ?? self::TITIK),
                ...array_map(fn ($n) => '     •  Anggota Tim                   : '.$n, $at ?: [self::TITIK]),
                '4.  Dalam pelaksanaan survei dan audit, yang akan dihubungi adalah ...................., telepon ..................... Survei pendahuluan akan dilakukan oleh tim auditor seperti audit biasa, namun tidak mendalam dan tidak rinci. Pelaksanaan audit akan dilakukan terhadap area yang telah difokuskan berdasarkan hasil survei pendahuluan.',
                '5.  Prosedur pelaporan dan tindak lanjut akan mengacu pada standar audit APIP dan tindakan koreksi terhadap rekomendasi temuan audit paling lambat akan dilakukan dalam waktu 60 hari setelah tanggal kesepakatan ditetapkan.',
                '6.  Seluruh biaya yang terjadi selama audit ditanggung oleh kantor tim audit.',
            ], 'rata' => 'rata'],
            ['jenis' => 'ttd', 'tanggal' => 'Meulaboh, ....................', 'kolom' => [['', 'Perwakilan Auditi', null, null], ['', 'Perwakilan Auditor', $this->nama('kt'), $this->nip('kt')]]],
        ];

        return ['blok' => $blok];
    }

    private function kma12(): array
    {
        return ['blok' => [
            $this->judul('LEMBAR REVIU SUPERVISI'),
            ['jenis' => 'info', 'isi' => [['Nama Auditi', $this->d['objek']], ['Nomor Surat Tugas', $this->d['nomor']['st']], ['Periode Audit', $this->periode()], ['Ketua Tim', $this->nama('kt')]]],
            ['jenis' => 'tabel', 'kepala' => $this->kepalaSederhana(['No', 'Permasalahan/komentar', 'Indek/KKP', 'Penyelesaian', 'Persetujuan']), 'nomor' => true, 'kosong' => 12, 'lebar' => [6, 36, 12, 32, 14]],
            ['jenis' => 'info', 'isi' => [['Penanggung Jawab Teknis', $this->pjt()], ['Tanda Tangan', null], ['Nama', $this->pjt()], ['Tanggal', null]]],
        ]];
    }

    private function kma13(): array
    {
        return ['blok' => [
            $this->judul('LAPORAN MINGGUAN', 'PENGUJIAN DAN EVALUASI', 'Minggu Ke- ......'),
            ['jenis' => 'info', 'isi' => [
                ['Nama Auditi', $this->d['objek'], 'Penanggung Jawab Teknis', $this->pjt()],
                ['Alamat', 'Kabupaten Aceh Barat', 'Ketua Tim', $this->nama('kt')],
                ['Periode', $this->periode(), 'Tanggal', null],
                ['Auditor', implode(', ', $this->namaTim()), '', ''],
            ]],
            ['jenis' => 'tabel', 'kepala' => $this->kepalaSederhana(['No', 'Prosedur Audit', 'Realisasi Jam', 'Realisasi Jam s.d tanggal', 'Estimasi Jam untuk penyelesaian', 'Anggaran Jam', 'Anggaran Biaya', 'Realisasi Biaya s.d tanggal', 'Anggaran Biaya']), 'nomor' => true, 'kosong' => 7, 'lebar' => [4, 28, 9, 9, 10, 9, 10, 11, 10]],
            ['jenis' => 'info', 'isi' => [['Nama Auditor', null], ['Analisis Penyimpangan', null], ['Ketua Tim', $this->nama('kt')], ['Penanggung Jawab Teknis', $this->pjt()]]],
        ]];
    }

    private function kma14(): array
    {
        $b = [
            'Sudahkah dilakukan penjelasan penugasan kepada anggota tim',
            'Sudahkah dibuat perencanaan audit',
            'Sudahkan dilakukan audit sesuai program audit',
            'Sudahkah dilakukan reviu terhadap hasil kerja anggota tim',
            'Sudahkah hasil reviu ditindaklanjuti oleh anggota tim',
            'Sudahkah anggota tim membuat KKP dan disimpan pada tempat yang telah disiapkan untuknya',
            'Sudahkah KKP dikerjakan oleh Ketua Tim dan disimpan pada tempat yang telah disiapkan sebelumnya',
            ['Sudahkah direviu oleh Penanggung jawab teknis', ['Review I tanggal', 'Review II tanggal', 'Review III tanggal', 'Review IV tanggal']],
            'Sudahkah dibuat ringkasan arahan review dari Penanggung Jawab Teknis',
            'Sudahkah Hasil review Penanggung Jawab Teknis ditindaklanjuti oleh tim',
            'Sudahkah dikembangkan temuan hasil audit dan rekomendasi perbaikan',
            'Sudahkan dilakukan komunikasi temuan dan rekomendasi perbaikan dengan manajemen auditi',
            'Sudahkah diperoleh kata sepakat atas rekomendasi yang diberikan',
            ['Adakah Penanggung Jawab melakukan reviu', ['Reviu I tanggal', 'Reviu II tanggal', 'Reviu III tanggal']],
            'Sudahkah dibuat ringkasan hasil reviu penanggung jawab',
            'Sudahkah hasil reviu penanggung jawab ditindaklanjuti oleh Tim',
            'Sudahkah dilakukan penyusunan dokumentasi hasil audit',
            ['Sudahkah dokumentasi hasil audit dibahas', ['Di tim', 'Dengan Penanggung jawab teknis', 'Dengan Penanggung jawab']],
            ['Sudahkah dilakukan penelaahan kesesuaian KKP dan isinya dengan standar audit APIP', ['Oleh tim', 'Dengan Penanggung jawab teknis', 'Dengan Penanggung jawab']],
            ['Sudahkah dilakukan penelaahan kesesuaian KKP dengan tujuan audit', ['Dengan Penanggung jawab teknis', 'Dengan Penanggung jawab']],
            ['Sudahkah dilakukan penambahan simpulan hasil audit :', ['Di Tim Pemeriksa', 'Dengan Penanggung jawab teknis', 'Dengan Penanggung jawab']],
        ];
        $baris = array_map(fn ($r) => [...$r, ''], $this->checklist($b));

        return ['blok' => [
            $this->judul('CHECK LIST', 'PENYELESAIAN PENGUJIAN DAN EVALUASI'),
            ['jenis' => 'info', 'isi' => [['Nama Auditi', $this->d['objek']], ['Nomor Surat Tugas', $this->d['nomor']['st']]]],
            ['jenis' => 'tabel', 'kepala' => $this->kepalaSederhana(['No', 'Keterangan', 'Sudah/ Belum', 'Persentase Penyelesaian', 'Ket']), 'nomor' => true, 'baris' => $baris, 'lebar' => [5, 57, 11, 15, 12]],
            ['jenis' => 'ttd', 'kolom' => [['Direviu oleh     Tanggal ..........', 'Penanggung jawab teknis:', $this->pjt(), $this->nip('dalnis')], ['Diisi oleh     Tanggal ..........', 'Ketua Tim:', $this->nama('kt'), $this->nip('kt')]]],
        ]];
    }

    private function kma15(): array
    {
        $kt = $this->nama('kt') ?? '';
        $pjt = $this->pjt() ?? '';
        $baris = [
            ['a. Diserahkan oleh Ketua Tim kepada Penanggung Jawab Teknis', $kt, '', ''],
            ['b. Diserahkan oleh Penanggung Jawab Teknis kepada Penanggung Jawab', $pjt, '', ''],
            ['c. Diserahkan ke sekretariat untuk diketik', '', '', ''],
            ['d. Diserahkan ke petugas reviu', '', '', ''],
            ['e. Diperbaiki oleh sekretariat', '', '', ''],
            ['f. Dicopy dan dijilid', '', '', ''],
            ['g. Diserahkan ke Penanggung Jawab', $this->nama('pj') ?? '', '', ''],
            ['h. Diserahkan ke Inspektur', $this->d['inspektur']['nama'], '', ''],
            ['i. Diserahkan kepada Pimpinan Organisasi', '', '', ''],
            ["j. Didistribusikan kepada:\n   1. Auditi\n   2. Pimpinan Organisasi\n   3. BPK\n   4. Arsip", '', '', ''],
        ];

        return ['blok' => [
            $this->judul('PENGENDALIAN PENYUSUNAN LAPORAN'),
            ['jenis' => 'judul', 'kecil' => true, 'baris' => ['INFORMASI UMUM']],
            ['jenis' => 'info', 'isi' => [
                ['Nama Auditi', $this->d['objek'], 'Tanggal Kartu', $this->d['tanggal']['st']],
                ['Alamat', 'Kabupaten Aceh Barat', 'No. PKPT', null],
                ['Telepon', null, 'RMP', $this->d['jangka']['bulan_mulai']],
                ['Tujuan Audit', null, 'RML', $this->d['jangka']['bulan_selesai']],
                ['Periode yang Diaudit', null, 'Ketua Tim', $kt],
                ['Nomor Kartu Penugasan', $this->d['nomor']['kp'], 'Penanggung Jawab Teknis', $pjt],
                ['', '', 'Penanggung Jawab', $this->nama('pj')],
            ]],
            ['jenis' => 'judul', 'kecil' => true, 'baris' => ['TAHAPAN PENYELESAIAN']],
            ['jenis' => 'tabel', 'kepala' => [[$this->h('URAIAN', 1, 2), $this->h('NAMA', 1, 2), $this->h('TANGGAL', 2)], [$this->h('Mulai'), $this->h('Selesai')]], 'nomor' => true, 'baris' => $baris, 'lebar' => [52, 24, 12, 12]],
        ]];
    }

    private function kma16(): array
    {
        return ['blok' => [
            $this->judul('REVIU KONSEP LAPORAN', 'Penanggung Jawab Teknis/Penanggung Jawab'),
            ['jenis' => 'info', 'isi' => [['Nama Auditi', $this->d['objek']], ['Kartu Penugasan', $this->d['nomor']['kp']]]],
            ['jenis' => 'tabel', 'kepala' => $this->kepalaSederhana(['No. Urut', 'Halaman LHP', 'Masalah yang Dijumpai', 'Nomor KKP', 'Penyelesaian Masalah', 'Dilakukan Oleh', 'Keterangan']), 'nomor' => true, 'kosong' => 9, 'lebar' => [5, 7, 30, 8, 26, 12, 12]],
            ['jenis' => 'info', 'isi' => [['Pengendali Teknis', $this->pjt()], ['Tanggal', null]]],
        ]];
    }

    private function kma17(): array
    {
        $grup = [
            'RINGKASAN PIMPINAN' => ['Ringkasan pimpinan menyajikan overview ringkas atas auditi, tujuan audit, ruang lingkup, referensi atas kriteria audit, metodologi audit, dan simpulan hasil audit atas setiap tujuan audit.'],
            'BODI LAPORAN' => [
                'Kecukupan informasi latar belakang auditi.', 'Tujuan audit dan kriteria yang berkaitan.', 'Ruang lingkup audit sudah dinyatakan secara jelas.',
                'Jadual audit, metodologi, standar audit yang diacu. Jika ada standar', 'Hasil observasi yang mendalam yang berkaitan dengan tujuan dan kriteria audit telah diperoleh untuk mencapat simpulan audit.',
                'Setiap observasi berisi pernyataan kondisi, kriteria, penyebab, dampak', 'Bukti yang cukup dan persuasif telah dikumpulkah untuk mendukung setiap observasi.',
                'Temuan yang bisa dikuantifisir telah dihitung secara memadai.', 'Rekomendasi yang diberikan telah mengikuti alur logis dari hasil observasi dan penyebab, jelas dan cost-effective, ditujukan kepada pihak yang berkompeten.',
                'Simpulan telah disajikan untuk setiap tujuan audit dan telah didukung dengan bukti yang persuasif.', 'Lampiran-lampiran yang disajikan memang menambah nilai laporan.',
            ],
            'FORMAT LAPORAN' => [
                'Daftar isi yang menggambarkan struktur laporan dan judul yang sama', 'Judul dan huruf yang konsisten.', 'Bagan dan gambar telah dirujuk secara memadai dalam bodi laporan.',
                'Struktur kalimat dan paragraf yang mudah dipahami.', 'Singkatan-singkatan telah didefinisikan.', 'Bahasa dan terminologi yang mudah dipahami.',
                'Tata bahasa dan penulisan kata yang tepat.', 'Lampiran disajikan secara seragam dan dirujuk pada bodi laporan.', 'Secara keseluruhan, laporan sudah jelas dan tepat.',
            ],
            'LAIN-LAIN' => ["Penyusunan telah melalui proses reviu:\n•  Pengendali Teknis\n•  Pengendali Mutu/Wakil Penanggung Jawab", 'Distribusi laporan telah sesuai ketentuan'],
        ];
        $baris = [];
        $no = 1;
        foreach ($grup as $g => $items) {
            $baris[] = ['', ['t' => $g, 'b' => true], '', ''];
            foreach ($items as $it) {
                $baris[] = [['t' => $no++.'.', 'a' => 'c'], $it, '', ''];
            }
        }

        return ['blok' => [
            $this->judul('CHECKLIST', 'PENYELESAIAN LAPORAN'),
            ['jenis' => 'info', 'isi' => [['Nama Auditi', $this->d['objek']], ['Nomor Surat Tugas', $this->d['nomor']['st']]]],
            ['jenis' => 'tabel', 'kepala' => $this->kepalaSederhana(['No', 'Uraian', 'Sudah/ Belum', 'Keterangan']), 'nomor' => true, 'baris' => $baris, 'lebar' => [6, 66, 12, 16]],
            ['jenis' => 'ttd', 'kolom' => [['Direviu oleh,     Tanggal, ...', 'Pengendali teknis', $this->pjt(), $this->nip('dalnis')], ['Diisi oleh,     Tanggal, ...', 'Ketua Tim:', $this->nama('kt'), $this->nip('kt')]]],
        ]];
    }

    /** @return list<array<string,mixed>> */
    private function temuan(): array
    {
        return array_merge(...array_map(fn ($l) => array_map(fn ($t) => $t + ['lhp' => $l['nomor'], 'lhp_tgl' => $l['tanggal']], $l['temuan']), $this->d['lhp'] ?: [['temuan' => [], 'nomor' => '', 'tanggal' => '']]));
    }

    private function nomorLhp(): ?string
    {
        $l = $this->d['lhp'][0] ?? null;
        if ($l) {
            return $l['nomor'].' tanggal '.$l['tanggal'];
        }
        $r = $this->d['laporan'][0] ?? null;

        return $r && $r['nomor'] !== '' ? $r['nomor'].(str_starts_with($r['tanggal'], '.') ? '' : ' tanggal '.$r['tanggal']) : null;
    }

    private function kma18(): array
    {
        $baris = array_map(fn ($t, $i) => [['t' => (string) ($i + 1), 'a' => 'c'], $t['kondisi'], '', $t['sebab'], '', $t['rekomendasi'], '', '', '', ''], $this->temuan(), array_keys($this->temuan()));

        return ['blok' => [
            $this->judul('KONSEP TEMUAN DAN RENCANA TINDAK LANJUT'),
            ['jenis' => 'info', 'isi' => [
                ['Auditi', $this->d['objek']], ['Periode Audit', $this->periode()], ['Nomor Surat Tugas', $this->d['nomor']['st']],
                ['Nomor LHP', $this->nomorLhp()], ['Nomor Formulir Penyampaian', null], ['Disampaikan Tanggal', null], ['Rapat Penutupan Audit Tanggal', null],
            ]],
            ['jenis' => 'tabel', 'kepala' => $this->kepalaSederhana(['No', 'Kondisi', 'Kriteria', 'Sebab', 'Akibat', 'Rekomendasi', 'Rencana Tindak Lanjut', 'Komentar Auditi', 'Komentar Auditor', 'Keterangan']), 'nomor' => true, 'baris' => $baris, 'kosong' => $baris ? 0 : 5, 'lebar' => [3, 24, 8, 14, 7, 22, 7, 5, 5, 5]],
            ['jenis' => 'ttd', 'kolom' => [['', 'Penanggung Jawab Teknis', $this->pjt(), $this->nip('dalnis')], ['', 'Ketua Tim', $this->nama('kt'), $this->nip('kt')]]],
        ]];
    }

    private function kma19(): array
    {
        $tl = array_values(array_filter(array_map(fn ($t) => $t['tindak_lanjut'], $this->temuan())));

        return ['blok' => [
            $this->judul('LAPORAN TINDAK LANJUT TEMUAN AUDIT', 'Nomor Surat : ..............................'),
            ['jenis' => 'judul', 'kecil' => true, 'kiri' => true, 'baris' => ['INFORMASI UMUM']],
            ['jenis' => 'info', 'isi' => [
                ['Instansi/Unit', implode(', ', $this->d['auditi']) ?: $this->d['objek'], 'Tanggal', null],
                ['Bagian/Kegiatan yang diaudit', $this->d['objek'], 'Perihal', null],
                ['No/Tgl LHP', $this->nomorLhp(), 'Eksemplar', null],
                ['No. Formulir Penyampaian', null, '', ''],
                ['No. Temuan', null, '', ''],
                ['No. Rekomendasi', null, '', ''],
            ]],
            ['jenis' => 'tabel', 'kepala' => [[['t' => 'Tindak Lanjut yang telah dilakukan :', 'a' => 'l', 'b' => true]]], 'baris' => [[implode("\n\n", $tl) ?: "\n\n\n"]], 'lebar' => [100]],
            ['jenis' => 'tabel', 'kepala' => [[['t' => 'Tanggal Penyelesaian :', 'a' => 'l', 'b' => true]]], 'baris' => [["\n"]], 'lebar' => [100]],
            ['jenis' => 'ttd', 'kolom' => [['', 'Pimpinan Auditi', null, null], ['', 'Penanggung Jawab Teknis', $this->pjt(), $this->nip('dalnis')]]],
        ]];
    }

    private function kma20(): array
    {
        $baris = array_map(fn ($t, $i) => [['t' => (string) ($i + 1), 'a' => 'c'], $t['lhp'], $t['kondisi'], $t['rekomendasi'], $t['tindak_lanjut'] ?: 'Belum ditindaklanjuti', $t['tuntas'] ? 'Sudah ditindaklanjuti' : 'Belum ditindaklanjuti'], $this->temuan(), array_keys($this->temuan()));

        return ['blok' => [
            $this->judul('LAPORAN PEMANTAUAN TINDAK LANJUT TEMUAN AUDIT', 'Nomor Surat : ..............................'),
            ['jenis' => 'judul', 'kecil' => true, 'kiri' => true, 'baris' => ['INFORMASI UMUM']],
            ['jenis' => 'info', 'isi' => [['Nama Auditi', implode(', ', $this->d['auditi']) ?: $this->d['objek']], ['Alamat', 'Kabupaten Aceh Barat']]],
            ['jenis' => 'tabel', 'kepala' => $this->kepalaSederhana(['No', 'No. LHP', 'Uraian Temuan', 'Rekomendasi', 'Tindak Lanjut', 'Keterangan']), 'nomor' => true, 'baris' => $baris, 'kosong' => $baris ? 0 : 6, 'lebar' => [4, 12, 32, 30, 12, 10]],
            ['jenis' => 'ttd', 'kolom' => [['', '', null, null], ['', 'Tim Pemantau Tindak Lanjut', null, null]]],
        ]];
    }

    private function kma21(): array
    {
        $baris = [];
        foreach ($this->d['lhp'] as $i => $l) {
            $n = count($l['temuan']);
            $nilai = array_sum(array_column($l['temuan'], 'nilai'));
            $tl = array_filter($l['temuan'], fn ($t) => $t['tuntas']);
            $nilaiTl = array_sum(array_column($l['temuan'], 'nilai_tl'));
            $baris[] = [['t' => (string) ($i + 1), 'a' => 'c'], $l['nomor']."\n".$l['tanggal'], (string) $n, $this->rp($nilai), (string) count($tl), $this->rp($nilaiTl), (string) ($n - count($tl)), $this->rp(max(0, $nilai - $nilaiTl))];
        }
        $inst = implode(', ', $this->d['auditi']) ?: '....................';

        return ['blok' => [
            $this->judul('BERITA ACARA PEMUTAKHIRAN DATA', 'Temuan Audit yang Belum Ditindaklanjuti', 'Sampai Dengan Lebih dari 1 Bulan', 'pada instansi '.$inst),
            ['jenis' => 'teks', 'rata' => 'rata', 'isi' => [
                'Pada hari ini, .................., tanggal ........................ telah dilakukan pemutakhiran data temuan audit yang belum ditindaklanjuti bulan ........... s.d .................. oleh auditi '.$inst.' yang dihadiri oleh:',
                '     1.  ..............................', '     2.  ..............................', '     3.  ..............................',
                'Dalam proses pemutakhiran ini telah dilakukan rekonsiliasi dan pemutakhiran data atas temuan audit APIP dengan hasil sebagai berikut :',
            ]],
            ['jenis' => 'tabel', 'kepala' => [
                [$this->h('No', 1, 2), $this->h('No & Tgl LHP', 1, 2), $this->h('Temuan Sebelum Pemutakhiran', 2), $this->h('Tindak Lanjut', 2), $this->h('Temuan Setelah Pemutakhiran', 2)],
                [$this->h('Jml Temuan'), $this->h('Nilai (Rp)'), $this->h('Jml Temuan'), $this->h('Nilai (Rp)'), $this->h('Jml Temuan'), $this->h('Nilai (Rp)')],
            ], 'nomor' => true, 'baris' => $baris, 'kosong' => $baris ? 0 : 3, 'lebar' => [5, 23, 10, 12, 10, 12, 10, 12]],
            ['jenis' => 'teks', 'rata' => 'rata', 'isi' => [
                'Rincian temuan per LHP terdapat dalam lampiran berita acara ini dan merupakan satu kesatuan yang tidak dapat dipisahkan dengan Berita Acara ini.',
                'Demikian berita acara ini dibuat dengan sebenarnya untuk digunakan sebagaimana mestinya.',
            ]],
            ['jenis' => 'ttd', 'tanggal' => 'Meulaboh, ....................', 'kolom' => [['', 'Pimpinan Auditi', null, null], ['', 'Pimpinan APIP', $this->d['inspektur']['nama'], $this->d['inspektur']['nip_spasi']]]],
        ]];
    }

    private function kma22(): array
    {
        $bln = $this->d['bulan_tugas'];
        $kt = $this->nama('kt') ?? '';
        $kode = $kt !== '' ? mb_strtoupper(mb_substr($kt, 0, 3)) : 'v';
        $baris = [array_merge(['1', $this->d['objek'], $this->d['sifat'] ?: ''], array_map(fn ($b) => ['t' => in_array($b, $bln, true) ? $kode : '', 'a' => 'c'], range(1, 12)))];
        $k = [
            [$this->h('No', 1, 2), $this->h('Nama Auditi', 1, 2), $this->h('Sasaran Audit', 1, 2), $this->h('Bulan / Kode Nama Auditor', 12)],
            array_map(fn ($b) => $this->h((string) $b), range(1, 12)),
        ];

        return ['blok' => [
            $this->judul('RENCANA AUDIT DILIHAT DARI OBJEK AUDIT', 'TAHUN '.$this->tahun()),
            ['jenis' => 'tabel', 'kepala' => $k, 'nomor' => true, 'baris' => $baris, 'kosong' => 4, 'lebar' => [4, 30, 18, ...array_fill(0, 12, 4)]],
            ['jenis' => 'teks', 'isi' => $kt !== '' ? ['Kode '.$kode.' = '.$kt.' (Ketua Tim).'] : []],
        ]];
    }

    private function kma23(): array
    {
        $mg = $this->d['minggu_tugas'];
        $k = [
            [$this->h('No', 1, 3), $this->h('Nama Auditor/P2UPD', 1, 3), $this->h('Minggu / Auditor/P2UPD', 26)],
            array_map(fn ($w) => $this->h((string) $w), range(1, 26)),
            array_map(fn ($w) => $this->h((string) ($w + 26)), range(1, 26)),
        ];
        $baris = [];
        foreach ($this->d['tim'] as $i => $m) {
            $baris[] = array_merge([(string) ($i + 1), $m['nama']], array_map(function ($w) use ($mg) {
                $a = in_array($w, $mg, true);
                $b = in_array($w + 26, $mg, true);

                return ['t' => ($a || $b) ? trim(($a ? $w : '').' '.($b ? $w + 26 : '')) : '', 'a' => 'c'];
            }, range(1, 26)));
        }

        return ['blok' => [
            $this->judul('PERENCANAAN PETUGAS AUDIT (AUDITOR/P2UPD)', 'TAHUN '.$this->tahun()),
            ['jenis' => 'tabel', 'kepala' => $k, 'nomor' => true, 'baris' => $baris, 'kosong' => 2, 'lebar' => [3, 19, ...array_fill(0, 26, 3)]],
            ['jenis' => 'teks', 'isi' => ['Kolom minggu memuat nomor minggu (1-52) masa tugas '.$this->d['nomor']['st'].' ('.$this->periode().').']],
        ]];
    }

    private function kma24(): array
    {
        $tarif = (int) $this->d['tarif'];
        $baris = [];
        $total = 0;
        foreach ($this->d['tim'] as $i => $m) {
            $lk = (int) ($m['hari_lapangan'] ?? 0);
            $hari = (int) ($m['hari_kantor'] ?? 0) + $lk;
            $lump = $lk * $tarif;
            $total += $lump;
            $baris[] = [(string) ($i + 1), $i === 0 ? $this->d['objek'] : '', $i === 0 ? ($this->d['sifat'] ?: '') : '', $m['nama'], $m['peran'], ['t' => (string) $hari, 'a' => 'c'], '', ['t' => $this->angka($lump), 'a' => 'r'], ['t' => $this->angka($lump), 'a' => 'r']];
        }

        return ['blok' => [
            $this->judul('ANGGARAN BIAYA AUDIT', 'TAHUN '.$this->tahun()),
            ['jenis' => 'teks', 'isi' => ['BULAN : '.mb_strtoupper($this->d['jangka']['bulan_mulai'])]],
            ['jenis' => 'tabel', 'kepala' => $this->kepalaSederhana(['No', 'Nama Auditi', 'Tujuan', 'Petugas', 'Jabatan', 'Hari', 'Transpor (Rp)', 'Lumpsum (Rp)', 'Jumlah (Rp)']), 'nomor' => true, 'baris' => $baris, 'kosong' => 1, 'lebar' => [4, 17, 12, 17, 13, 6, 9, 11, 11],
                'kaki' => [[['t' => 'Jumlah', 'c' => 6, 'a' => 'c', 'b' => true], '', ['t' => $this->angka($total), 'a' => 'r', 'b' => true], ['t' => $this->angka($total), 'a' => 'r', 'b' => true]]]],
            ['jenis' => 'teks', 'isi' => ['Lumpsum = hari luar kantor (LK) × tarif SPPD Rp '.number_format($tarif, 0, ',', '.').' per hari, sesuai RPP.']],
        ]];
    }

    private function kma25(): array
    {
        $baris = array_map(fn ($b) => [$b, '', '', '', ''], array_values(RppPenugasan::BULAN));

        return ['blok' => [
            $this->judul('REKAPITULASI BIAYA AUDIT', 'TAHUN '.$this->tahun()),
            ['jenis' => 'tabel', 'kepala' => $this->kepalaSederhana(['BULAN', 'TRANSPORT', 'LUMPSUM', 'HOTEL, DLL', 'JUMLAH']), 'nomor' => true, 'baris' => $baris,
                'kaki' => [[['t' => 'Jumlah', 'a' => 'c', 'b' => true], '', '', '', '']], 'lebar' => [20, 20, 20, 20, 20]],
        ]];
    }

    private function kma26(): array
    {
        return ['blok' => [
            $this->judul('BON PEMINJAMAN BERKAS', 'Nomor : ..............................'),
            ['jenis' => 'info', 'isi' => [
                ['Nama Peminjam', $this->nama('kt')], ['NIP', $this->nip('kt')], ['Jabatan dalam Tim', 'Ketua Tim'],
                ['Untuk Keperluan', $this->d['frasa']], ['Surat Tugas', $this->d['nomor']['st'].' tanggal '.$this->d['tanggal']['st']],
                ['Tanggal Pinjam', null], ['Rencana Tanggal Kembali', $this->d['jangka']['selesai']],
            ]],
            ['jenis' => 'tabel', 'kepala' => $this->kepalaSederhana(['No', 'Nama/Jenis Berkas', 'Nomor Berkas/Indeks', 'Jumlah', 'Tanggal Kembali', 'Keterangan']), 'nomor' => true, 'kosong' => 8, 'lebar' => [5, 35, 18, 9, 15, 18]],
            ['jenis' => 'ttd', 'tanggal' => 'Meulaboh, ....................', 'kolom' => [['Yang Menyerahkan,', 'Petugas Arsip/Tata Usaha', null, null], ['Yang Meminjam,', 'Ketua Tim', $this->nama('kt'), $this->nip('kt')]]],
        ]];
    }

    private function kma27(): array
    {
        $baris = array_map(fn ($m) => [['t' => $m['no'].'.', 'a' => 'c'], $m['nama']."\nNIP. ".$m['nip_spasi'], $m['jabatan'], $m['peran']], $this->d['tim']);
        $j = $this->d['jangka'];

        return ['blok' => [
            $this->judul('SURAT TUGAS', 'Nomor : '.$this->d['nomor']['st']),
            ['jenis' => 'teks', 'isi' => ['Inspektur Kabupaten Aceh Barat dengan ini menugaskan kepada:']],
            ['jenis' => 'tabel', 'kepala' => $this->kepalaSederhana(['NO', 'NAMA / NIP', 'JABATAN', 'PERAN DALAM TIM']), 'nomor' => true, 'baris' => $baris, 'lebar' => [6, 44, 28, 22]],
            ['jenis' => 'teks', 'rata' => 'rata', 'isi' => [
                'Untuk melakukan penugasan '.$this->d['frasa'].'.',
                'Kegiatan tersebut akan dilaksanakan selama '.$j['hari_kerja'].' ('.$j['hari_kerja_terbilang'].') hari kerja, terhitung mulai tanggal '.$j['rentang'].'.',
                'Penugasan ini agar dilaksanakan dengan sebaik-baiknya dan penuh tanggung jawab.',
            ]],
            ['jenis' => 'ttd', 'tanggal' => 'Meulaboh, '.$this->d['tanggal']['surat'], 'kolom' => [['', '', null, null], ['', 'Inspektur Kabupaten Aceh Barat,', $this->d['inspektur']['nama'], $this->d['inspektur']['nip_spasi']]]],
        ]];
    }

    private function kma28(): array
    {
        $kepada = $this->d['kepada'] ?: [null];

        return ['blok' => [
            $this->judul('SURAT PENYAMPAIAN TEMUAN'),
            ['jenis' => 'info', 'isi' => [
                ['Kepada', implode("\n", array_filter($kepada)) ?: null],
                ['Dari', ($this->nama('kt') ?? self::TITIK).', Ketua Tim'],
                ['Perihal', 'Penyampaian Daftar Temuan '.$this->d['jenis']['kata_kerja'].' ('.$this->d['nomor']['st'].')'],
            ]],
            ['jenis' => 'teks', 'rata' => 'rata', 'isi' => [
                'Daftar temuan ini disampaikan untuk dibahas.',
                'Bersama ini kami sampaikan daftar temuan yang telah dibahas dengan Saudara .................................................... yang bertanggung jawab dalam bidang tugasnya masing-masing. Mereka telah menyetujui hal-hal yang dimuat dalam daftar temuan. Kami mengharapkan saudara dapat mempelajarinya dengan seksama dan apabila Saudara tidak berkeberatan, kami ingin membahasnya bersama pada tanggal ....................',
                'Atas perhatian Saudara kami ucapkan terima kasih.',
            ]],
            ['jenis' => 'ttd', 'kolom' => [['', '', null, null], ['', 'Ketua Tim Audit,', $this->nama('kt'), $this->nip('kt')]]],
        ]];
    }

    private function kma29(): array
    {
        return ['blok' => [
            $this->judul('FORMULIR PENILAIAN KINERJA AUDITOR/P2UPD ATAS PENUGASAN AUDIT'),
            ['jenis' => 'info', 'isi' => [
                ['Nama', null, 'Pangkat', null],
                ['Status dalam Tim', null, 'Fungsi yang diaudit', $this->d['jenis']['nama']],
                ['Nama Ketua Tim', $this->nama('kt'), 'Obyek yang diaudit', $this->d['objek']],
                ['Nama Penanggung Jawab Teknis', $this->pjt(), 'Periode', $this->periode()],
                ['Nama Penanggung Jawab', $this->nama('pj'), 'No. Surat Tugas', $this->d['nomor']['st']],
            ]],
            ['jenis' => 'tabel', 'kepala' => [
                [$this->h('No', 1, 2), $this->h('Uraian Tugas', 1, 2), $this->h('Kode', 1, 2), $this->h('Nilai Yang Diberikan', 4)],
                [$this->h('1'), $this->h('2'), $this->h('3'), $this->h('Jumlah')],
            ], 'nomor' => true, 'kosong' => 6, 'lebar' => [5, 40, 12, 10, 10, 10, 13],
                'kaki' => [[['t' => 'Total Penilaian', 'c' => 6, 'a' => 'c'], ''], [['t' => 'Nilai Rata-Rata', 'c' => 6, 'a' => 'c'], '']]],
            ['jenis' => 'teks', 'isi' => ['Penilai :', '1.  Nama Penilai : ....................     Paraf dan tanggal : ....................', '2.  Nama Penilai : ....................     Paraf dan tanggal : ....................', '3.  Nama Penilai : ....................     Paraf dan tanggal : ....................', 'Nilai tertinggi 10 dan terendah 1.']],
            ['jenis' => 'ttd', 'kolom' => [['', '', null, null], ['Mengetahui,', 'Inspektur', $this->d['inspektur']['nama'], $this->d['inspektur']['nip_spasi']]]],
        ]];
    }

    private function kma30(): array
    {
        $baris = [];
        foreach (['I' => 'Kegiatan Audit :', 'II' => 'Kegiatan Tindak Lanjut :', 'III' => 'Kegiatan Konsultasi :', 'IV' => 'Kegiatan Lainnya :'] as $r => $t) {
            $baris[] = [['t' => $r, 'a' => 'c'], $t."\n1. ..................\n2. ..................\n3. ..................", '', '', ''];
        }
        $baris[] = [['t' => 'V', 'a' => 'c'], 'Kompetensi Auditor/P2UPD', '', '', ''];

        return ['blok' => [
            $this->judul('KARTU PENILAIAN KINERJA AUDITOR/P2UPD'),
            ['jenis' => 'info', 'isi' => [['Nama', null], ['Jabatan/Pangkat', null], ['Periode Penilaian', 'Tahun '.$this->tahun()]]],
            ['jenis' => 'tabel', 'kepala' => $this->kepalaSederhana(['No', 'Kegiatan', 'No. Surat Tugas', 'Nilai', 'Keterangan']), 'nomor' => true, 'baris' => $baris, 'lebar' => [6, 44, 20, 10, 20],
                'kaki' => [[['t' => 'Total', 'c' => 3, 'a' => 'l'], '', ''], [['t' => 'Rata-rata', 'c' => 3, 'a' => 'l'], '', '']]],
            ['jenis' => 'info', 'isi' => [['Pejabat Tata Usaha', ''], ['Nama', null], ['Tanggal Administrasi', null], ['Komentar', null]]],
        ]];
    }
}
