<?php

namespace App\Support\Arep;

use App\Models\Rpp;
use App\Models\RppCategory;
use App\Models\RppLaporan;
use App\Models\RppObrik;
use App\Models\RppPenugasan;
use App\Models\RppTeamMember;
use App\Services\Arep\ArepData;

/**
 * Contoh pengisian 30 Formulir Kendali Mutu untuk tombol "Contoh" di
 * pratinjau. Satu penugasan rekaan (Audit Operasional pada Dinas Kesehatan,
 * Maret 2026) dibentuk sebagai model RPP yang TIDAK disimpan, lalu dilewatkan
 * ke ArepData + KmFormulir yang sama dengan cetakan sungguhan — sehingga
 * bentuk contoh selalu sama dengan formulir. Kolom yang pada cetakan kosong
 * (diisi tangan) diisi contoh isian yang lazim di lapangan.
 *
 * Petunjuk pengisian bersumber dari lampiran Pedoman Kendali Mutu Audit
 * (Permenpan RB 19/2009) sebagaimana dimuat Keputusan Inspektur Aceh 2024
 * dan Perbup Mamuju Utara (Pasangkayu) 15/2017; KMA 26 dari Keputusan
 * Inspektur Kota Yogyakarta 33/2018; KM 6/7 dari modul Pusdiklatwas BPKP
 * "Perencanaan Penugasan Audit" (contoh Kartu Penugasan & Anggaran Waktu).
 * Nama orang, nomor, dan angka pada contoh adalah rekaan.
 */
class KmContoh
{
    public const SUMBER = [
        'aceh' => ['Keputusan Inspektur Aceh tentang Pedoman Kendali Mutu Audit (2024), Lampiran I–XXVII', 'https://inspektorat.acehprov.go.id/media/2024.04/keputusan_inspektur_tentang_pedoman_kendali_mutu_3_pdf1.pdf'],
        'pasangkayu' => ['Perbup Mamuju Utara (Pasangkayu) No. 15 Tahun 2017 tentang Pedoman Kendali Mutu Audit', 'https://jdih.pasangkayukab.go.id/common/dokumen/peraturanbupatinomor15tahun2017.pdf'],
        'jogja' => ['Keputusan Inspektur Kota Yogyakarta No. 33 Tahun 2018 tentang Kendali Mutu', 'https://inspektorat.jogjakota.go.id/download/hit/9195/keputusan-inspektur-no-33-tahun-2018-tentang-kendali-mutu-pelaks-9195.pdf'],
        'badung' => ['Keputusan Inspektur Kabupaten Badung tentang Pedoman Kendali Mutu', 'https://inspektorat.badungkab.go.id/storage/files/SK%20Pedoman%20KM.pdf'],
        'bpkp' => ['Modul Diklat JFA Pengendali Teknis "Perencanaan Penugasan Audit", Pusdiklatwas BPKP 2010 (Tabel 5.1–5.4)', 'https://jabatanfungsionalauditor.wordpress.com/wp-content/uploads/2014/06/01-perencanaan-penugasan-audit.pdf'],
        'bkn' => ['Peraturan BKN No. 12 Tahun 2018 tentang Pedoman Kendali Mutu Audit APIP', 'https://www.bkn.go.id/wp-content/uploads/2018/11/PERATURAN-BKN-NOMOR-12-TAHUN-2018-PEDOMAN-KENDALI-MUTU-AUDIT-APIP.pdf'],
        'lamteng' => ['Pedoman Kendali Mutu Inspektorat Kabupaten Lampung Tengah', 'https://inspektorat.lampungtengahkab.go.id/upload/dokumen/7.%20Pedoman%20Kendali%20Mutu.pdf'],
        'pessel' => ['Pedoman Kendali Mutu Audit APIP Kabupaten Pesisir Selatan', 'https://inspekda.pesisirselatankab.go.id/transparasi/file/Pedoman_Kendali_Mutu.pdf'],
        'paser' => ['Perbup Paser No. 35 tentang Pedoman Kendali Mutu Audit APIP', 'https://jdih.paserkab.go.id/assets/library/document/perbup-nomor-35-tentang-pedoman-kendali-mutu-audit-aparat-pengawas-intern-pemerintah-inspektorat-kabupaten-paser.pdf'],
        'kemenhub' => ['Keputusan Irjen Kemenhub SK.86/KP.801/ITJEN/2016 tentang Pedoman Kendali Mutu Audit', 'https://itjen.dephub.go.id/wp-content/uploads/2018/07/KEPIRJEN-SK-86-KP-801-ITJEN-2016-pedoman-kendali-mutu-audit.pdf'],
    ];

    /** @return array{d: array<string,mixed>, spek: array<string,mixed>|null, petunjuk: list<string>, catatan: string, sumber: list<array{0:string,1:string}>}|null */
    public static function untuk(int $no): ?array
    {
        if (KmKatalog::cari($no) === null) {
            return null;
        }
        $d = self::data();
        $spek = KmFormulir::untuk($no, $d);
        if ($spek !== null) {
            $spek = (new self($d))->isi($no, $spek);
        }

        return [
            'd' => $d,
            'spek' => $spek,
            'petunjuk' => self::petunjuk($no),
            'catatan' => self::catatan($no),
            'sumber' => array_map(fn ($k) => self::SUMBER[$k], self::sumberUntuk($no)),
        ];
    }

    /** @param array<string,mixed> $d */
    private function __construct(private array $d) {}

    /**
     * Data contoh: penugasan rekaan dibentuk sebagai model RPP tak tersimpan
     * lalu dinormalkan ArepData — bentuknya persis data cetakan sungguhan.
     *
     * @return array<string,mixed>
     */
    public static function data(): array
    {
        $rpp = (new Rpp)->forceFill(['nomor_rpp' => '700/03/RPP-AO/INS/2026', 'year' => 2026, 'tanggal_rpp' => '2026-02-16']);
        $rpp->setRelation('category', (new RppCategory)->forceFill(['name' => 'Operasional SKPK', 'sebutan' => 'Audit Operasional', 'kode_nomor' => 'AO']));

        $p = (new RppPenugasan)->forceFill([
            'nomor_st' => 'ST-12/AO-INS/2026', 'tanggal_st' => '2026-03-02',
            'masa_tugas_mulai' => '2026-03-02', 'masa_tugas_selesai' => '2026-03-13',
            'uraian' => 'Audit Operasional pada Dinas Kesehatan', 'sifat' => 'Audit Operasional', 'lokasi' => 'dalam', 'jumlah_laporan' => 1,
        ]);
        $p->setRelation('rpp', $rpp);
        $tim = [
            ['pj', 'Drs. Teuku Iskandar, M.Si.', '196905121994031005', 'Pembina Tingkat I', 'IV/b', 2, 0],
            ['wpj', 'Cut Nurhayati, S.E., M.M.', '197203151998032004', 'Pembina', 'IV/a', 3, 2],
            ['dalnis', 'Muhammad Rizal, S.E., Ak.', '197808202005011003', 'Pembina', 'IV/a', 5, 5],
            ['kt', 'Rahmat Hidayat, S.E.', '198501102010011006', 'Penata Tingkat I', 'III/d', 5, 5],
            ['at', 'Nurul Fadhilah, S.Ak.', '199207252019032009', 'Penata Muda Tingkat I', 'III/b', 5, 5],
            ['at', 'Zulfikar, A.Md.', '199411032020121005', 'Pengatur Tingkat I', 'II/d', 5, 5],
        ];
        $p->setRelation('teamMembers', collect($tim)->map(fn ($m, $i) => (new RppTeamMember)->forceFill([
            'role' => $m[0], 'nama' => $m[1], 'nip' => $m[2], 'pangkat' => $m[3], 'golongan' => $m[4],
            'hari_kantor' => $m[5], 'hari_lapangan' => $m[6], 'order' => $i,
        ])));
        $p->setRelation('obriks', collect([(new RppObrik)->forceFill(['nama' => 'Dinas Kesehatan Kabupaten Aceh Barat'])]));
        $p->setRelation('laporans', collect([(new RppLaporan)->forceFill(['nomor_laporan' => '700/12/LHP-AO/INS/2026', 'tanggal_laporan' => '2026-03-27', 'jenis' => 'LHP'])]));

        $d = app(ArepData::class)->untukPenugasan($p);
        $d['penugasan_id'] = 0;
        $d['inspektur'] = ['nama' => 'Drs. Syarifuddin, M.Si.', 'nip_spasi' => '19680101 199303 1 012', 'pangkat' => 'Pembina Utama Muda', 'jabatan' => 'Inspektur Kabupaten Aceh Barat'];
        $d['lhp'] = [[
            'nomor' => '700/12/LHP-AO/INS/2026', 'tanggal' => '27 Maret 2026', 'status' => 'Final',
            'temuan' => [
                ['kondisi' => 'Pertanggungjawaban belanja perjalanan dinas pada 12 SPJ senilai Rp18.400.000 tidak dilengkapi bukti pengeluaran riil biaya penginapan.',
                    'sebab' => 'PPTK dan Bendahara Pengeluaran kurang cermat memverifikasi kelengkapan bukti SPJ.',
                    'rekomendasi' => 'Kepala Dinas Kesehatan agar memerintahkan PPTK melengkapi bukti pengeluaran riil atau menyetorkan kekurangannya ke Kas Daerah.',
                    'tindak_lanjut' => 'Bukti penginapan 9 SPJ (Rp13.600.000) telah dilengkapi; sisa Rp4.800.000 disetor ke Kas Daerah tanggal 20 April 2026 (STS No. 12/IV/2026).',
                    'nilai' => 18400000.0, 'nilai_tl' => 18400000.0, 'tuntas' => true],
                ['kondisi' => 'Penyetoran PPh Pasal 22 dan PPN atas 5 SP2D senilai Rp3.120.000 terlambat 14 s.d. 30 hari dari batas waktu.',
                    'sebab' => 'Bendahara Pengeluaran belum memiliki kartu kendali penyetoran pajak.',
                    'rekomendasi' => 'Kepala Dinas Kesehatan agar menginstruksikan Bendahara Pengeluaran menyusun kartu kendali pajak dan menyetor pajak tepat waktu.',
                    'tindak_lanjut' => '', 'nilai' => 3120000.0, 'nilai_tl' => 0.0, 'tuntas' => false],
                ['kondisi' => 'SOP pengelolaan persediaan obat dan bahan medis habis pakai pada gudang farmasi belum ditetapkan.',
                    'sebab' => 'Bidang Pelayanan Kesehatan belum menyusun rancangan SOP.',
                    'rekomendasi' => 'Kepala Dinas Kesehatan agar menetapkan SOP pengelolaan persediaan obat paling lambat 60 hari.',
                    'tindak_lanjut' => '', 'nilai' => 0.0, 'nilai_tl' => 0.0, 'tuntas' => false],
            ],
        ]];

        return $d;
    }

    // ------------------------------------------------------------ bantu isi

    /** @param array<string,mixed> $s @param list<list<mixed>> $baris */
    private function tabel(array &$s, array $baris, int $ke = 0): void
    {
        $n = 0;
        foreach ($s['blok'] as $i => $b) {
            if ($b['jenis'] === 'tabel' && $n++ === $ke) {
                $s['blok'][$i]['baris'] = $baris;
                $s['blok'][$i]['kosong'] = 0;

                return;
            }
        }
    }

    /** Isi nilai blok info menurut labelnya. @param array<string,mixed> $s @param array<string,string> $nilai */
    private function info(array &$s, array $nilai): void
    {
        foreach ($s['blok'] as $i => $b) {
            if ($b['jenis'] !== 'info') {
                continue;
            }
            foreach ($b['isi'] as $r => $row) {
                foreach ([0, 2] as $k) {
                    if (isset($row[$k]) && array_key_exists($row[$k], $nilai)) {
                        $s['blok'][$i]['isi'][$r][$k + 1] = $nilai[$row[$k]];
                    }
                }
            }
        }
    }

    /** Nama penanda tangan yang kosong pada blok ttd menurut jabatannya. @param array<string,mixed> $s @param array<string,array{0:string,1:?string}> $nama */
    private function ttd(array &$s, array $nama): void
    {
        foreach ($s['blok'] as $i => $b) {
            if ($b['jenis'] !== 'ttd') {
                continue;
            }
            foreach ($b['kolom'] as $k => $kol) {
                if (isset($nama[$kol[1]])) {
                    $s['blok'][$i]['kolom'][$k][2] = $nama[$kol[1]][0];
                    $s['blok'][$i]['kolom'][$k][3] = $nama[$kol[1]][1];
                }
            }
            if (isset($b['tanggal'])) {
                $s['blok'][$i]['tanggal'] = (string) preg_replace('/\.{5,}/', $nama['_tanggal'][0] ?? '....................', $b['tanggal']);
            }
        }
    }

    private function n(string $peran): string
    {
        return $this->d[$peran]['nama'];
    }

    /** Anggota tim ke-$i (0 = pertama). */
    private function at(int $i): string
    {
        return $this->d['anggota'][$i]['nama'] ?? '';
    }

    private static function c(string $t): array
    {
        return ['t' => $t, 'a' => 'c'];
    }

    private static function r(string $t): array
    {
        return ['t' => $t, 'a' => 'r'];
    }

    // ------------------------------------------------------------ contoh isian

    /** @param array<string,mixed> $s @return array<string,mixed> */
    private function isi(int $no, array $s): array
    {
        $c = fn (string $t) => self::c($t);
        $r = fn (string $t) => self::r($t);
        $kt = $this->n('kt');
        $dal = $this->n('dalnis');
        $pj = $this->n('pj');
        $at1 = $this->at(0);
        $at2 = $this->at(1);

        switch ($no) {
            case 1:
                $this->tabel($s, [
                    [$c('1'), 'Tujuan: Meningkatnya kualitas tata kelola keuangan dan kinerja Perangkat Daerah', 'Inspektur', 'Misi 1: Mewujudkan pengawasan intern yang profesional, independen dan berintegritas', 'Renstra Inspektorat 2025–2029'],
                    [$c('2'), 'Sasaran: Meningkatnya kapabilitas APIP (IACM Level 3)', 'Sekretaris', 'Misi 1', 'Indikator: Level IACM'],
                    [$c('3'), 'Sasaran: Menurunnya temuan berulang pada Perangkat Daerah', 'Inspektur Pembantu I–IV', 'Misi 2: Mendorong perbaikan tata kelola Perangkat Daerah', 'Target turun 10% per tahun'],
                    [$c('4'), 'Strategi: Audit berbasis risiko atas Perangkat Daerah dengan skor risiko tinggi', 'Inspektur Pembantu I–IV', 'Misi 2', 'Dasar PKPT'],
                    [$c('5'), 'Strategi: Pemantauan tindak lanjut hasil pengawasan per triwulan', 'Inspektur Pembantu Khusus', 'Misi 2', 'Rekonsiliasi TL dengan BPK'],
                    [$c('6'), 'Strategi: Pengembangan kompetensi auditor melalui diklat dan PKB', 'Sekretaris', 'Misi 1', 'Min. 120 JP per 3 tahun'],
                ]);
                break;

            case 2:
                $this->tabel($s, [
                    ['Dinas Kesehatan', $c('Tinggi (20)'), $pj, $dal, $kt, "$at1\n$at2", $c('1'), $c('2'), $c('1'), $c('3 laptop'), $c('1 roda 4'), 'Printer', $r('3.000.000'), '-', ''],
                    ['Dinas PUPR', $c('Tinggi (18)'), $pj, $dal, $at1, $at2, $c('1'), $c('1'), $c('-'), $c('2 laptop'), $c('1 roda 4'), '-', $r('2.400.000'), 'Tenaga ahli teknik', ''],
                    ['Badan Pengelolaan Keuangan Kabupaten', $c('Sedang (12)'), $pj, $dal, $kt, $at2, $c('-'), $c('1'), $c('1'), $c('2 laptop'), $c('-'), '-', $r('1.500.000'), '-', ''],
                    ['Kecamatan Johan Pahlawan', $c('Rendah (6)'), $pj, $dal, $at1, $at2, $c('-'), $c('1'), $c('-'), $c('1 laptop'), $c('1 roda 2'), '-', $r('800.000'), '-', ''],
                ]);
                break;

            case 3:
                $v = '✓';
                $this->tabel($s, [
                    [$c('1'), 'Dinas Kesehatan', $c('12 Mei 2023'), $c('Tinggi'), $c('1 tahun sekali'), 'Audit Operasional', $c($v), $c($v), $c($v), $c($v), $c($v)],
                    [$c('2'), 'Dinas PUPR', $c('20 Juni 2024'), $c('Tinggi'), $c('1 tahun sekali'), 'Audit Kinerja', $c($v), $c($v), $c($v), $c($v), $c($v)],
                    [$c('3'), 'Badan Pengelolaan Keuangan Kabupaten', $c('14 Juli 2024'), $c('Sedang'), $c('2 tahun sekali'), 'Audit Operasional', $c(''), $c($v), $c(''), $c($v), $c('')],
                    [$c('4'), 'Kecamatan Johan Pahlawan', $c('3 Oktober 2022'), $c('Rendah'), $c('3 tahun sekali'), 'Audit dengan Tujuan Tertentu', $c($v), $c(''), $c(''), $c($v), $c('')],
                ]);
                break;

            case 4:
            case 5:
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'tabel') {
                        $s['blok'][$i]['baris'][0][2] = self::c('Tinggi');
                        $s['blok'][$i]['baris'][0][9] = $no === 4 ? 'PKPT' : 'Inspektur Pembantu II';
                        $s['blok'][$i]['kosong'] = 1;
                    }
                }
                break;

            case 8:
                $this->info($s, ['Alamat' => 'Jl. Imam Bonjol, Meulaboh']);
                $this->tabel($s, [
                    [$c('02-03-2026'), 'Pembicaraan pendahuluan dengan Kepala Dinas dan Sekretaris', $c('19,5'), $c('19,5'), $c('-'), $c('-')],
                    [$c('03-03-2026'), 'Pengumpulan informasi umum (DPA, SOP, struktur organisasi, BKU)', $c('19,5'), $c('19,5'), $c('-'), $c('-')],
                    [$c('04-03-2026'), 'Penelaahan LHP BPK dan LHP Inspektorat tahun sebelumnya', $c('19,5'), $c('13'), $c('-'), $c('-')],
                    [$c('05-03-2026'), 'Penilaian risiko dan penetapan area fokus audit', $c('13'), $c('19,5'), $c('-'), $c('-')],
                    [$c('06-03-2026'), 'Penyusunan dan persetujuan Program Kerja Audit (PKA)', $c('19,5'), $c('19,5'), $c('-'), $c('-')],
                ]);
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'tabel') {
                        $s['blok'][$i]['kaki'] = [[['t' => 'Total', 'c' => 2, 'a' => 'c', 'b' => true], $c('91'), $c('91'), $c('-'), $c('-')]];
                    }
                    if ($b['jenis'] === 'teks') {
                        $s['blok'][$i]['isi'] = ['Catatan : Persiapan dilakukan di kantor (DK) sehingga tidak ada biaya SPPD. Penilaian risiko selesai lebih cepat 6,5 jam, dialihkan ke penelaahan LHP.'];
                    }
                }
                break;

            case 9:
                $this->tabel($s, [
                    [$c('1'), 'Menilai kecukupan pengendalian intern atas belanja barang dan jasa', "a. Dapatkan SOP pengadaan dan DPA TA 2025.\nb. Wawancarai PPK dan PPTK tentang alur pengadaan.\nc. Uji 25 sampel SP2D LS dari 312 transaksi (acak sistematis, interval 12).", $kt, $c('19,5 jam'), $c('19,5 jam'), $c('B.1')],
                    [$c('2'), 'Menilai kepatuhan pertanggungjawaban belanja perjalanan dinas', "a. Susun daftar SPJ perjalanan dinas TA 2025.\nb. Uji petik 30 SPJ bernilai terbesar atas bukti riil.\nc. Konfirmasi ke 3 hotel secara tertulis.", $at1, $c('26 jam'), $c('32,5 jam'), $c('B.2')],
                    [$c('3'), 'Menilai ketepatan penyetoran pajak oleh Bendahara Pengeluaran', "a. Cocokkan SP2D dengan bukti setor (NTPN).\nb. Hitung keterlambatan per SP2D.", $at2, $c('13 jam'), $c('13 jam'), $c('B.3')],
                    [$c('4'), 'Menilai pengelolaan persediaan obat di gudang farmasi', "a. Stock opname 20 item obat dengan nilai terbesar.\nb. Bandingkan dengan kartu stok dan laporan persediaan.", "$at1\n$at2", $c('19,5 jam'), $c('19,5 jam'), $c('C.1')],
                    [$c('5'), 'Menyusun simpulan dan konsep temuan', 'Rangkum hasil pengujian, susun konsep temuan (kondisi, kriteria, sebab, akibat, rekomendasi).', $kt, $c('13 jam'), $c('13 jam'), $c('D.1')],
                ]);
                break;

            case 10:
                $baris = [];
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'tabel') {
                        foreach ($b['baris'] as $k => $row) {
                            [$sb, $ps] = match ($k) {
                                3 => ['Tidak ada', '-'], 4 => ['Tidak perlu', '-'], default => ['Sudah', '100%']
                            };
                            $row[2] = self::c($sb);
                            $row[3] = self::c($ps);
                            $baris[] = $row;
                        }
                        $s['blok'][$i]['baris'] = $baris;
                    }
                }
                break;

            case 11:
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'teks' && str_starts_with($b['isi'][0] ?? '', 'Berdasarkan')) {
                        $s['blok'][$i]['isi'][1] = '        Hari        : Senin';
                        $s['blok'][$i]['isi'][2] = '        Tanggal   : 2 Maret 2026';
                        $s['blok'][$i]['isi'][3] = '        Waktu      : 09.00 – 10.30 WIB';
                    }
                    if ($b['jenis'] === 'tabel') {
                        $auditi = ['dr. Hj. Fitriani, M.Kes. (Sekretaris)', 'Safrizal, S.E. (Kasubbag Keuangan)', 'Ns. Maulidar, S.Kep. (PPTK)'];
                        foreach ($b['baris'] as $k => $row) {
                            $s['blok'][$i]['baris'][$k][0] = ($k + 1).'. '.($auditi[$k] ?? '..............................');
                        }
                    }
                    if ($b['jenis'] === 'teks' && str_starts_with($b['isi'][0] ?? '', 'Diperoleh')) {
                        $isi = $b['isi'];
                        $isi[1] = '1.  Tujuan audit : menilai kecukupan pengendalian intern dan kepatuhan pengelolaan belanja barang dan jasa, perjalanan dinas, pajak, dan persediaan obat TA 2025.';
                        $isi[3] = '     •  Pengujian 25 sampel SP2D LS barang/jasa dan 30 SPJ perjalanan dinas;';
                        $isi[4] = '     •  Stock opname 20 item obat dan pencocokan bukti setor pajak (NTPN).';
                        foreach ($isi as $k => $t) {
                            if (str_starts_with($t, '4.  ')) {
                                $isi[$k] = (string) preg_replace('/adalah \.+, telepon \.+/', 'adalah Safrizal, S.E. (Kasubbag Keuangan), telepon 0812-6900-1122.', $t);
                            }
                        }
                        $s['blok'][$i]['isi'] = $isi;
                    }
                }
                $this->ttd($s, ['Perwakilan Auditi' => ['dr. Hj. Fitriani, M.Kes.', null], '_tanggal' => ['2 Maret 2026', null]]);
                break;

            case 12:
                $this->info($s, ['Tanda Tangan' => '(ttd)', 'Tanggal' => '11 Maret 2026']);
                $this->tabel($s, [
                    [$c('1'), 'KKA B.1 belum mencantumkan dasar dan metode pemilihan sampel.', $c('B.1'), 'Telah ditambahkan: sampling acak sistematis, populasi 312, interval 12, 25 sampel.', $c('Paraf MR')],
                    [$c('2'), 'Nilai SPJ tanpa bukti penginapan di KKA B.2 belum dicocokkan dengan BKU.', $c('B.2'), 'Sudah direkonsiliasi dengan BKU; nilai Rp18.400.000 sesuai.', $c('Paraf MR')],
                    [$c('3'), 'Konfirmasi hotel belum dilampirkan jawabannya.', $c('B.2-3'), 'Jawaban konfirmasi 2 hotel dilampirkan; 1 hotel belum menjawab, diganti prosedur alternatif.', $c('Paraf MR')],
                    [$c('4'), 'Simpulan KKA C.1 belum menjawab tujuan audit ke-4.', $c('C.1'), 'Simpulan diperbaiki: selisih stok 3 item dijelaskan penyebabnya.', $c('Paraf MR')],
                ]);
                break;

            case 13:
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'judul') {
                        $s['blok'][$i]['baris'][2] = 'Minggu Ke- 2';
                        break;
                    }
                }
                $this->info($s, ['Alamat' => 'Jl. Imam Bonjol, Meulaboh', 'Tanggal' => '13 Maret 2026', 'Nama Auditor' => "$kt, $at1, $at2", 'Analisis Penyimpangan' => 'Uji SPJ perjalanan dinas melampaui anggaran 6,5 jam karena dokumen diserahkan bertahap; dikompensasi dari alokasi penyusunan simpulan. Biaya sesuai anggaran.']);
                $this->tabel($s, [
                    [$c('09-03-2026'), 'Uji sampel SP2D LS barang/jasa (B.1)', $c('19,5'), $c('19,5'), $c('-'), $c('19,5'), $r('300.000'), $r('300.000'), $r('1.500.000')],
                    [$c('10-03-2026'), 'Uji petik SPJ perjalanan dinas (B.2)', $c('19,5'), $c('39'), $c('6,5'), $c('26'), $r('300.000'), $r('600.000'), $r('1.500.000')],
                    [$c('11-03-2026'), 'Konfirmasi hotel dan pencocokan NTPN pajak (B.2, B.3)', $c('19,5'), $c('58,5'), $c('-'), $c('26'), $r('300.000'), $r('900.000'), $r('1.500.000')],
                    [$c('12-03-2026'), 'Stock opname obat di gudang farmasi (C.1)', $c('19,5'), $c('78'), $c('-'), $c('19,5'), $r('300.000'), $r('1.200.000'), $r('1.500.000')],
                    [$c('13-03-2026'), 'Penyusunan simpulan dan konsep temuan (D.1)', $c('13'), $c('91'), $c('-'), $c('13'), $r('300.000'), $r('1.500.000'), $r('1.500.000')],
                ]);
                break;

            case 14:
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'tabel') {
                        foreach ($b['baris'] as $k => $row) {
                            $ket = match ($k) {
                                7 => 'R-I 10/3, R-II 12/3', 13 => 'R-I 13/3', default => ''
                            };
                            $s['blok'][$i]['baris'][$k][2] = self::c('Sudah');
                            $s['blok'][$i]['baris'][$k][3] = self::c('100%');
                            $s['blok'][$i]['baris'][$k][4] = $ket;
                        }
                    }
                }
                break;

            case 15:
                $this->info($s, ['Telepon' => '(0655) 7551234', 'Tujuan Audit' => 'Menilai pengendalian intern dan kepatuhan pengelolaan belanja TA 2025', 'Periode yang Diaudit' => 'TA 2025', 'No. PKPT' => 'PKPT 2026 Nomor Urut 12']);
                $tgl = [['16-03-2026', '17-03-2026'], ['18-03-2026', '19-03-2026'], ['20-03-2026', '20-03-2026'], ['23-03-2026', '23-03-2026'], ['24-03-2026', '24-03-2026'], ['25-03-2026', '25-03-2026'], ['26-03-2026', '26-03-2026'], ['27-03-2026', '27-03-2026'], ['27-03-2026', '27-03-2026'], ['30-03-2026', '30-03-2026']];
                $nama = [$kt, $dal, 'Subbag Umum', 'Tim Reviu Mutu', 'Subbag Umum', 'Subbag Umum', $pj, $this->d['inspektur']['nama'], 'Bupati Aceh Barat', 'Subbag Umum'];
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'tabel') {
                        foreach ($b['baris'] as $k => $row) {
                            $s['blok'][$i]['baris'][$k][1] = $nama[$k];
                            $s['blok'][$i]['baris'][$k][2] = self::c($tgl[$k][0]);
                            $s['blok'][$i]['baris'][$k][3] = self::c($tgl[$k][1]);
                        }
                    }
                }
                break;

            case 16:
                $this->info($s, ['Tanggal' => '19 Maret 2026']);
                $this->tabel($s, [
                    [$c('1'), $c('3'), 'Simpulan belum menyatakan tingkat keyakinan atas tujuan audit ke-1.', $c('D.1'), 'Ditambahkan simpulan: pengendalian intern belanja barang/jasa memadai kecuali verifikasi SPJ.', $kt, ''],
                    [$c('2'), $c('7'), 'Kriteria temuan 1 belum menyebut pasal peraturan perjalanan dinas.', $c('B.2'), 'Kriteria dilengkapi pasal yang dilanggar.', $at1, ''],
                    [$c('3'), $c('9'), 'Nilai temuan 2 berbeda dengan KKA (Rp3.210.000 vs Rp3.120.000).', $c('B.3'), 'Dikoreksi menjadi Rp3.120.000 sesuai KKA.', $at2, 'Salah ketik'],
                    [$c('4'), $c('11'), 'Rekomendasi temuan 3 belum menyebut batas waktu.', $c('C.1'), 'Ditambahkan "paling lambat 60 hari".', $kt, ''],
                ]);
                break;

            case 17:
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'tabel') {
                        foreach ($b['baris'] as $k => $row) {
                            if ((is_array($row[0]) ? $row[0]['t'] : $row[0]) !== '') {
                                $s['blok'][$i]['baris'][$k][2] = self::c('Sudah');
                            }
                        }
                    }
                }
                break;

            case 18:
                $this->info($s, ['Nomor Formulir Penyampaian' => '01/KT/AO-DINKES/2026', 'Disampaikan Tanggal' => '16 Maret 2026', 'Rapat Penutupan Audit Tanggal' => '13 Maret 2026']);
                $this->tabel($s, [
                    [$c('1'), $this->d['lhp'][0]['temuan'][0]['kondisi'], 'Perbup Aceh Barat tentang Perjalanan Dinas; Permendagri 77/2020', $this->d['lhp'][0]['temuan'][0]['sebab'], 'Belanja Rp18.400.000 tidak dapat diyakini kewajarannya', $this->d['lhp'][0]['temuan'][0]['rekomendasi'], 'Lengkapi bukti dalam 30 hari', 'Sependapat', 'Dapat diterima', ''],
                    [$c('2'), $this->d['lhp'][0]['temuan'][1]['kondisi'], 'UU KUP dan PMK tentang batas waktu penyetoran pajak', $this->d['lhp'][0]['temuan'][1]['sebab'], 'Potensi sanksi administrasi perpajakan', $this->d['lhp'][0]['temuan'][1]['rekomendasi'], 'Kartu kendali pajak mulai April 2026', 'Sependapat', 'Dapat diterima', ''],
                    [$c('3'), $this->d['lhp'][0]['temuan'][2]['kondisi'], 'PP 60/2008 tentang SPIP (kegiatan pengendalian)', $this->d['lhp'][0]['temuan'][2]['sebab'], 'Risiko obat kedaluwarsa dan selisih stok', $this->d['lhp'][0]['temuan'][2]['rekomendasi'], 'SOP ditetapkan Mei 2026', 'Sependapat', 'Dapat diterima', ''],
                ]);
                break;

            case 19:
                $this->info($s, ['Tanggal' => '22 April 2026', 'Perihal' => 'Tindak Lanjut LHP Inspektorat', 'Eksemplar' => '1 (satu) berkas', 'No. Formulir Penyampaian' => '01/KT/AO-DINKES/2026', 'No. Temuan' => '1', 'No. Rekomendasi' => '1']);
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'judul' && str_starts_with($b['baris'][0], 'LAPORAN')) {
                        $s['blok'][$i]['baris'][1] = 'Nomor Surat : 440/215/2026';
                    }
                }
                $this->tabel($s, [[$this->d['lhp'][0]['temuan'][0]['tindak_lanjut']]], 0);
                $this->tabel($s, [['20 April 2026']], 1);
                $this->ttd($s, ['Pimpinan Auditi' => ['dr. H. Ramli, M.Kes.', '19700815 199803 1 006']]);
                break;

            case 20:
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'judul' && str_starts_with($b['baris'][0], 'LAPORAN')) {
                        $s['blok'][$i]['baris'][1] = 'Nomor Surat : 700/88/INS/2026';
                    }
                    if ($b['jenis'] === 'tabel') {
                        $s['blok'][$i]['baris'][1][4] = 'Belum ditindaklanjuti; telah diingatkan melalui surat 700/80/INS/2026';
                        $s['blok'][$i]['baris'][2][4] = 'Dalam proses: rancangan SOP disusun';
                        $s['blok'][$i]['baris'][2][5] = 'Dalam proses';
                    }
                }
                $this->info($s, ['Alamat' => 'Jl. Imam Bonjol, Meulaboh']);
                $this->ttd($s, ['Tim Pemantau Tindak Lanjut' => [$dal, $this->d['dalnis']['nip_spasi']]]);
                break;

            case 21:
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'teks' && str_starts_with($b['isi'][0] ?? '', 'Pada hari')) {
                        $s['blok'][$i]['isi'][0] = 'Pada hari ini, Selasa, tanggal 30 Juni 2026 telah dilakukan pemutakhiran data temuan audit yang belum ditindaklanjuti bulan April s.d. Juni 2026 oleh auditi Dinas Kesehatan Kabupaten Aceh Barat yang dihadiri oleh:';
                        $s['blok'][$i]['isi'][1] = '     1.  dr. H. Ramli, M.Kes. (Kepala Dinas Kesehatan)';
                        $s['blok'][$i]['isi'][2] = '     2.  Safrizal, S.E. (Kasubbag Keuangan)';
                        $s['blok'][$i]['isi'][3] = '     3.  '.$dal.' (Inspektorat)';
                    }
                }
                $this->ttd($s, ['Pimpinan Auditi' => ['dr. H. Ramli, M.Kes.', '19700815 199803 1 006'], '_tanggal' => ['30 Juni 2026', null]]);
                break;

            case 22:
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'tabel') {
                        $bulan = fn (array $isi, string $kode) => array_map(fn ($m) => self::c(in_array($m, $isi, true) ? $kode : ''), range(1, 12));
                        $s['blok'][$i]['baris'][] = array_merge(['2', 'Dinas PUPR', 'Audit Kinerja'], $bulan([5], 'NUR'));
                        $s['blok'][$i]['baris'][] = array_merge(['3', 'Badan Pengelolaan Keuangan Kabupaten', 'Audit Operasional'], $bulan([8], 'RAH'));
                        $s['blok'][$i]['baris'][] = array_merge(['4', 'Kecamatan Johan Pahlawan', 'Audit dengan Tujuan Tertentu'], $bulan([10, 11], 'ZUL'));
                        $s['blok'][$i]['kosong'] = 0;
                    }
                    if ($b['jenis'] === 'teks') {
                        $s['blok'][$i]['isi'] = ['Kode: RAH = '.$kt.'; NUR = '.$at1.'; ZUL = '.$at2.' (Ketua Tim masing-masing penugasan).'];
                    }
                }
                break;

            case 25:
                $bulan = [1 => [0, 0, 0], 2 => [0, 1200000, 0], 3 => [0, 3000000, 0], 4 => [0, 2400000, 0], 5 => [450000, 4200000, 1350000], 6 => [0, 1800000, 0]];
                $tot = [0, 0, 0];
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'tabel') {
                        foreach ($b['baris'] as $k => $row) {
                            $v = $bulan[$k + 1] ?? null;
                            if ($v) {
                                foreach ($v as $j => $x) {
                                    $tot[$j] += $x;
                                }
                                $f = fn ($x) => self::r($x ? number_format($x, 0, ',', '.') : '-');
                                $s['blok'][$i]['baris'][$k] = [$row[0], $f($v[0]), $f($v[1]), $f($v[2]), $f(array_sum($v))];
                            }
                        }
                        $f = fn ($x) => ['t' => number_format($x, 0, ',', '.'), 'a' => 'r', 'b' => true];
                        $s['blok'][$i]['kaki'] = [[['t' => 'Jumlah (s.d. Juni)', 'a' => 'c', 'b' => true], $f($tot[0]), $f($tot[1]), $f($tot[2]), $f(array_sum($tot))]];
                    }
                }
                break;

            case 26:
                $this->info($s, ['Bagian/Bidang' => 'Inspektur Pembantu II', 'Tanggal' => '3 Maret 2026', 'File Tentang' => 'KKA dan LHP Audit Operasional Dinas Kesehatan TA 2023 (arsip permanen)']);
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'judul') {
                        $s['blok'][$i]['baris'][1] = 'Nomor : 07/BPB/INS/2026';
                        break;
                    }
                }
                $this->tabel($s, [
                    [$c('1'), 'LHP Audit Operasional Dinas Kesehatan TA 2023', $c('700/09/LHP-AO/INS/2023'), $c('1 buku'), $c('13-03-2026'), 'Kembali lengkap'],
                    [$c('2'), 'Kertas Kerja Audit (KKA) TA 2023', $c('Map AO-DINKES-23'), $c('1 map'), $c('13-03-2026'), 'Kembali lengkap'],
                    [$c('3'), 'File permanen Dinas Kesehatan (SOTK, SOP)', $c('FP-DINKES'), $c('1 ordner'), $c('13-03-2026'), 'Kembali lengkap'],
                ]);
                $this->ttd($s, ['Disetujui oleh' => [$dal, $this->d['dalnis']['nip_spasi']], 'Pengembalian' => [$kt, $this->d['kt']['nip_spasi']], 'Petugas Arsip' => ['Yusnidar', null]]);
                break;

            case 28:
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'teks') {
                        $s['blok'][$i]['isi'][1] = (string) preg_replace(
                            ['/Saudara \.+/', '/tanggal \.+/'],
                            ['Saudara Sekretaris Dinas, Kasubbag Keuangan, dan PPTK', 'tanggal 18 Maret 2026.'],
                            $b['isi'][1],
                        );
                    }
                }
                break;

            case 29:
                $this->info($s, ['Nama' => $at1, 'Pangkat' => 'Penata Muda Tingkat I (III/b)', 'Status dalam Tim' => 'Anggota Tim']);
                $this->tabel($s, [
                    [$c('1'), 'Menguji petik SPJ perjalanan dinas dan menyusun KKA', $c('B.2'), $c('8'), $c('8'), $c('-'), $c('16')],
                    [$c('2'), 'Melaksanakan konfirmasi pihak ketiga (hotel)', $c('B.2-3'), $c('7'), $c('8'), $c('-'), $c('15')],
                    [$c('3'), 'Melaksanakan stock opname obat', $c('C.1'), $c('9'), $c('8'), $c('-'), $c('17')],
                    [$c('4'), 'Menindaklanjuti catatan reviu Ketua Tim/Pengendali Teknis', $c('KMA 12'), $c('8'), $c('9'), $c('-'), $c('17')],
                    [$c('5'), 'Ketepatan waktu penyelesaian penugasan', $c('KMA 13'), $c('7'), $c('7'), $c('-'), $c('14')],
                ]);
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'tabel') {
                        $s['blok'][$i]['kaki'] = [[['t' => 'Total Penilaian', 'c' => 6, 'a' => 'c'], $c('79')], [['t' => 'Nilai Rata-Rata (79 : 10)', 'c' => 6, 'a' => 'c'], $c('7,9')]];
                    }
                    if ($b['jenis'] === 'teks' && ($b['isi'][0] ?? '') === 'Penilai :') {
                        $s['blok'][$i]['isi'][1] = '1.  Nama Penilai : '.$kt.' (Ketua Tim)     Paraf dan tanggal : ttd, 20-03-2026';
                        $s['blok'][$i]['isi'][2] = '2.  Nama Penilai : '.$dal.' (Pengendali Teknis)     Paraf dan tanggal : ttd, 20-03-2026';
                        $s['blok'][$i]['isi'][3] = '3.  Nama Penilai : -     Paraf dan tanggal : -';
                    }
                }
                break;

            case 30:
                $this->info($s, ['Nama' => $at1, 'Jabatan/Pangkat' => 'Auditor Ahli Pertama / Penata Muda Tingkat I (III/b)', 'Periode Penilaian' => 'Januari s.d. Juni 2026']);
                $this->tabel($s, [
                    [$c('I'), "Kegiatan Audit :\n1. Audit Operasional Dinas Kesehatan\n2. Audit Kinerja Dinas PUPR", "\n".$this->d['nomor']['st']."\nST-19/AKJ-INS/2026", $c("\n7,9\n8,2"), ''],
                    [$c('II'), "Kegiatan Tindak Lanjut :\n1. Pemantauan TL Semester I 2026", "\nST-31/Mon-INS/2026", $c("\n8,0"), ''],
                    [$c('III'), "Kegiatan Konsultasi :\n1. Pendampingan penyusunan SOP persediaan obat", "\nST-27/Mon-INS/2026", $c("\n8,5"), ''],
                    [$c('IV'), "Kegiatan Lainnya :\n1. Reviu LKPD TA 2025", "\nST-05/Rev-INS/2026", $c("\n8,0"), ''],
                    [$c('V'), 'Kompetensi Auditor/P2UPD (PKB 40 JP semester I)', '-', $c('8,0'), 'Diklat Audit Kinerja'],
                ]);
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'tabel') {
                        $s['blok'][$i]['kaki'] = [[['t' => 'Total', 'c' => 3, 'a' => 'l'], $c('48,6'), ''], [['t' => 'Rata-rata (48,6 : 6)', 'c' => 3, 'a' => 'l'], $c('8,1'), '']];
                    }
                }
                foreach ($s['blok'] as $i => $b) {
                    if ($b['jenis'] === 'info' && ($b['isi'][0][0] ?? '') === 'Pejabat Tata Usaha') {
                        $s['blok'][$i]['isi'] = [['Pejabat Tata Usaha', 'Kasubbag Umum dan Kepegawaian'], ['Nama', 'Yusnidar'], ['Tanggal Administrasi', '3 Juli 2026'], ['Komentar', 'Kinerja baik; perlu peningkatan ketepatan waktu.']];
                    }
                }
                break;
        }

        return $s;
    }

    // ------------------------------------------------------------ petunjuk

    /** @return list<string> */
    public static function petunjuk(int $no): array
    {
        return match ($no) {
            1 => ['Kolom 1 diisi nomor urut.', 'Kolom 2 diisi tujuan, sasaran dan strategi audit Inspektorat (dari Renstra).', 'Kolom 3 diisi pejabat penanggung jawab tiap sasaran/strategi.', 'Kolom 4 diisi misi Inspektorat yang didukung.', 'Kolom 5 diisi keterangan (indikator, target, atau rujukan dokumen).'],
            2 => ['Kolom 1 diisi nama auditi (instansi, kegiatan, program, kontrak).', 'Kolom 2 diisi besaran risiko hasil pengukuran risiko tiap auditi.', 'Kolom 3–6 diisi nama Penanggung Jawab, Penanggung Jawab Teknis, Ketua Tim dan Anggota Tim.', 'Kolom 7–9 diisi tenaga tata usaha golongan IV, III dan II.', 'Kolom 10–12 diisi sarana: komputer (laptop/PC), kendaraan, sarana lain.', 'Kolom 13 diisi total dana perjalanan dinas; kolom 14 dana lain (tenaga ahli/laboratorium).', 'Kolom 15 diisi hal lain yang belum tertampung.'],
            3 => ['Kolom 1 diisi nomor urut; kolom 2 nama auditi.', 'Kolom 3 diisi tanggal terbit LHP terakhir atas auditi tersebut.', 'Kolom 4 diisi peringkat risiko dari Peta Audit (KMA 2).', 'Kolom 5 diisi frekuensi audit (6 bulan, 1 tahun, 2 tahun sekali, dst.) sesuai besaran risiko.', 'Kolom 6 diisi jenis audit (kinerja atau tujuan tertentu).', 'Kolom 7–11 diberi tanda pada tahun audit akan dilaksanakan.'],
            4 => ['Kolom 1–2 diisi nomor urut dan nama auditi oleh fungsi perencanaan.', 'Kolom 3 diisi peringkat risiko yang telah diukur.', 'Kolom 4–5 diisi pekan mulai dan pekan selesai audit oleh bidang teknis.', 'Kolom 6–7 diisi nama auditor (PJ, PJ Teknis, Ketua Tim, Anggota) dan jenjang jabatannya.', 'Kolom 8 diisi biaya yang disediakan; kolom 9 jumlah LHP yang akan terbit.', 'Kolom 10 diisi "limpahan" bila penugasan dilimpahkan ke bidang lain (kolom 4–9 dikosongkan).', 'Di aplikasi: satu baris per anggota tim RPP; minggu dari masa tugas; biaya = SPPD RPP.'],
            5 => ['Sama dengan KMA 4, setelah usulan ditetapkan menjadi PKPT.', 'Kolom 10 diisi unit (Inspektur Pembantu) yang melaksanakan audit.'],
            6 => ['Nomor kartu mengikuti nomor Surat Tugas (KP-..). Butir 1–2: nama, alamat/telepon objek dan nomor RPP.', 'Butir 3 (program, sasaran, tujuan) diisi Ketua Tim dari hasil survei pendahuluan/PKA.', 'Butir 4: pihak penerima laporan. Butir 5: susunan tim sesuai Surat Tugas.', 'Butir 6: nomor/tanggal ST, tanggal mulai, rencana dan realisasi selesai.', 'Butir 7: rencana dan realisasi kunjungan/reviu PPJ ke lapangan.', 'Butir 8: anggaran dan realisasi hari pengawasan (HP) per peran; 1 HP = 6,5 jam.', 'Butir 9–10: bulan RMP/RPL dan target konsep laporan.', 'Di aplikasi semua butir kecuali 3 dan 7 terisi otomatis dari RPP; bentuk mengikuti berkas KM Inspektorat dan contoh Kartu Penugasan modul BPKP.'],
            7 => ['Baris I Persiapan, II Pelaksanaan, III Penyelesaian; kolom HP dan Jam per peran (WPJ, Dalnis, KT, AT).', 'HP Pelaksanaan (II) = hari luar kantor (LK) di RPP; Persiapan (I) = separuh hari dalam kantor (DK); Penyelesaian (III) = sisa DK.', 'Jam = HP × 6,5. Kolom AT: HP per orang, Jam = jumlah jam seluruh anggota.', 'Jumlah = penjumlahan kolom peran; total = I + II + III.', 'Rincian pekerjaan per butir boleh diisi tangan; angka total terisi otomatis dari RPP.'],
            8 => ['Isian identitas: nama dan alamat auditi, nomor ST perencanaan, nama auditor; ditandatangani Ketua Tim dan PJ Teknis.', 'Kolom 1 tanggal sejak mulai perencanaan; kolom 2 jenis pekerjaan.', 'Kolom 3–4 realisasi dan anggaran jam; kolom 5–6 realisasi dan anggaran biaya.', 'Catatan diisi hal yang perlu diketahui (penyimpangan jam/biaya dan alasannya).'],
            9 => ['Isian atas: unit organisasi/program/kegiatan, tahun audit, penyusun PKA.', 'Kolom 2 tujuan audit; kolom 3 prosedur, ukuran sampel, metode pemilihan sampel dan waktu.', 'Kolom nama auditor, anggaran waktu, realisasi waktu, dan nomor KKA/KKP sebagai pengendali arsip.', 'PKA disetujui PJ Teknis sebelum pekerjaan lapangan.'],
            10 => ['Kolom 2 memuat daftar pekerjaan perencanaan yang harus dilakukan (baku).', 'Kolom 3 diisi Sudah/Belum; kolom 4 persentase penyelesaian.', 'Dibuat Ketua Tim, ditandatangani PJ Teknis dan diketahui Penanggung Jawab.'],
            11 => ['Kolom auditi, hari, tanggal, waktu diisi sesuai rapat kesepakatan.', 'Tim auditi dan tim auditor diisi nama yang hadir.', 'Butir 1 tujuan utama dan prosedur pokok audit; butir 2 tanggal mulai s.d. selesai tiap tahap.', 'Butir 3 susunan tim; butir 4 pejabat auditi yang menjadi narahubung.', 'Ditandatangani perwakilan auditi dan perwakilan auditor.'],
            12 => ['Isian atas: auditi, nomor ST, periode audit, Ketua Tim.', 'Kolom 2 permasalahan/komentar PJ Teknis atau PJ; kolom 3 nomor indeks KKA.', 'Kolom 4 penyelesaian oleh Ketua/Anggota Tim; kolom 5 paraf persetujuan PJ Teknis/PJ.', 'Ditutup tanda tangan, nama, dan tanggal reviu PJ Teknis.'],
            13 => ['Minggu ke- diisi minggu keberapa laporan disusun.', 'Kolom 1 tanggal dalam minggu itu; kolom 2 prosedur audit yang dilaksanakan.', 'Kolom 3 realisasi jam minggu ini; kolom 4 kumulatif s.d. tanggal; kolom 5 estimasi jam untuk menyelesaikan; kolom 6 anggaran jam PKA.', 'Kolom 7 realisasi biaya minggu ini; kolom 8 kumulatif; kolom 9 anggaran biaya.', 'Analisis penyimpangan diisi Ketua Tim dan PJ Teknis sesuai kejadian lapangan.', 'Kepala kolom mengikuti petunjuk pengisian lampiran (kepala cetakan lampiran mengulang "Anggaran Biaya").'],
            14 => ['Kolom 2 prosedur kerja yang harus dilakukan (baku).', 'Kolom 3 Sudah/Belum; kolom 4 persentase penyelesaian; kolom 5 catatan (mis. tanggal reviu).', 'Diisi Ketua Tim, direviu PJ Teknis (nama dan tanggal).'],
            15 => ['Informasi umum: data audit (auditi, alamat, telepon, tujuan, periode, nomor kartu, tanggal kartu, No. PKPT, RMP/RML, susunan tim).', 'Kolom 1 langkah pelaporan (a–j); kolom 2 nama penanggung jawab langkah; kolom 3–4 tanggal mulai dan selesai.'],
            16 => ['Isian atas: nama auditi dan nomor kartu penugasan.', 'Kolom 2 halaman LHP; kolom 3 masalah yang dijumpai; kolom 4 nomor KKA.', 'Kolom 5 penyelesaian; kolom 6 nama pelaksana penyelesaian; kolom 7 catatan.', 'Ditutup nama Pengendali Teknis/PJ dan tanggal reviu.'],
            17 => ['Kolom 2 uraian syarat laporan (ringkasan pimpinan, bodi, format, lain-lain).', 'Kolom 3 Sudah/Belum; kolom 4 keterangan.', 'Diisi Ketua Tim, direviu Pengendali Teknis.'],
            18 => ['Informasi umum: auditi, periode, ST, LHP, nomor formulir penyampaian, tanggal penyampaian dan rapat penutupan.', 'Kolom 2–6: kondisi, kriteria, sebab, akibat, rekomendasi.', 'Kolom 7 rencana tindak lanjut; kolom 8 komentar auditi; kolom 9 komentar auditor atas komentar auditi.', 'Di aplikasi kondisi, sebab, rekomendasi ditarik dari Database LHP bila nomor ST sama.'],
            19 => ['Informasi umum diisi data audit (instansi, LHP, formulir penyampaian, nomor temuan/rekomendasi).', 'Tindak lanjut diisi uraian tindakan koreksi yang telah dilakukan, beserta tanggal penyelesaian.', 'Ditandatangani pimpinan auditi dan PJ Teknis.'],
            20 => ['Nomor surat laporan pemantauan; informasi umum nama dan alamat auditi.', 'Kolom 2 nomor LHP; 3 uraian temuan; 4 rekomendasi; 5 tindak lanjut; 6 status tindak lanjut.', 'Ditandatangani Tim Pemantau Tindak Lanjut.'],
            21 => ['Hari/tanggal pemutakhiran, bulan cakupan, nama auditi dan yang hadir.', 'Kolom 2 nomor dan tanggal LHP; kolom 3–4 temuan sebelum pemutakhiran; 5–6 tindak lanjut; 7–8 temuan setelah pemutakhiran (jumlah dan nilai).', 'Rincian temuan per LHP dilampirkan; ditandatangani pimpinan auditi dan pimpinan APIP.'],
            22 => ['Kolom 1 nomor urut; kolom 2 nama auditi; kolom 3 sasaran audit.', 'Kolom 4–15 (bulan 1–12) diberi tanda/kode nama auditor pada bulan pelaksanaan.'],
            23 => ['Kolom 2 nama Auditor/P2UPD yang akan ditugaskan.', 'Kolom minggu 1–52 diberi tanda pada minggu pelaksanaan tugas.'],
            24 => ['Kolom 2 auditi; 3 tujuan audit; 4 petugas; 5 jabatan; 6 jumlah hari.', 'Kolom 7 uang transpor; 8 uang lumpsum; 9 jumlah (7 + 8).', 'Di aplikasi lumpsum = hari luar kantor × tarif SPPD pada pengaturan RPP.'],
            25 => ['Kolom 1 nama bulan; 2 transpor; 3 lumpsum; 4 hotel dan lain-lain; 5 jumlah (2 + 3 + 4).'],
            26 => ['Nomor bon dari Sekretariat; nama peminjam, jabatan, bagian/bidang, tanggal pinjam.', '"File tentang" diisi berkas/KKA/LHP yang dipinjam; rincian per berkas dicatat pada tabel.', 'Paraf: peminjam, pejabat yang menyetujui, saat pengembalian, dan petugas arsip.', 'Lampiran Permenpan 19/2009 tidak memuat bentuk KMA 26; bentuk ini dari Keputusan Inspektur Kota Yogyakarta 33/2018.'],
            27 => ['Surat Tugas memuat dasar, susunan tim (nama, NIP, jabatan, peran), tujuan penugasan, jangka waktu dan tanggal.', 'Diterbitkan dan ditandatangani Inspektur; di aplikasi seluruhnya terisi dari RPP.'],
            28 => ['Kepada: pimpinan tertinggi auditi; Dari: Ketua Tim; Perihal: penyampaian daftar temuan.', 'Tanggal diisi tanggal pembahasan yang diinginkan; ditandatangani Ketua Tim.'],
            29 => ['Identitas auditor yang dinilai, status dalam tim, pangkat, objek, periode, nomor ST.', 'Kolom 2 uraian tugas; 3 kode (mis. nomor KKA); 4–6 nilai tiap penilai (1–10); 7 jumlah; total dan rata-rata.', 'Anggota tim dinilai Ketua Tim dan PJ Teknis; Ketua Tim dinilai PJ Teknis dan PJ; PJ Teknis dinilai PJ dan pimpinan APIP.'],
            30 => ['Rekap tahunan/semesteran per auditor dari KMA 29.', 'Kolom 2 kegiatan (audit, tindak lanjut, konsultasi, lainnya, kompetensi); 3 nomor ST; 4 nilai; total dan rata-rata.', 'Diadministrasikan pejabat tata usaha (nama, tanggal, komentar).'],
            default => [],
        };
    }

    public static function catatan(int $no): string
    {
        return match (true) {
            in_array($no, [6, 7], true) => 'Bentuk KM 6 dan KM 7 mengikuti berkas KM Inspektorat Kabupaten Aceh Barat, yang sama dengan contoh Kartu Penugasan dan Anggaran Waktu Audit dalam modul Pusdiklatwas BPKP.',
            $no === 26 => 'Bentuk mengikuti Keputusan Inspektur Kota Yogyakarta 33/2018; lampiran Permenpan 19/2009 hanya mencantumkan nama formulir.',
            $no === 13 => 'Kepala kolom disesuaikan dengan petunjuk pengisian lampiran; kepala cetakan lampiran (Aceh 2024, Pasangkayu 2017) mengulang "Anggaran Biaya" dan memberi "No" pada kolom tanggal.',
            default => 'Bentuk sama dengan lampiran Pedoman Kendali Mutu Audit (adopsi Permenpan RB 19/2009) yang dipakai Inspektorat Aceh dan kabupaten/kota lain.',
        };
    }

    /** @return list<string> */
    private static function sumberUntuk(int $no): array
    {
        return match (true) {
            in_array($no, [6, 7], true) => ['bpkp', 'aceh', 'pasangkayu', 'jogja', 'badung'],
            $no === 26 => ['jogja', 'aceh', 'pasangkayu'],
            $no === 27 => ['bpkp', 'aceh', 'pasangkayu'],
            in_array($no, [11, 12, 16, 17, 18], true) => ['aceh', 'pasangkayu', 'jogja', 'badung', 'bkn'],
            default => ['aceh', 'pasangkayu', 'jogja', 'bkn'],
        };
    }
}
