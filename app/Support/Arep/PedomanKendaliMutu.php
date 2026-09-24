<?php

namespace App\Support\Arep;

/**
 * Isi draft Keputusan Inspektur Kabupaten Aceh Barat tentang Pedoman Kendali
 * Mutu Audit Intern beserta lampirannya. Disusun dengan acuan Pedoman
 * Kendali Mutu Audit Inspektorat Aceh (Keputusan Inspektur Aceh
 * No. 700/2352/IA/2021) dan Permenpan RB 19/2009, disesuaikan dengan
 * struktur dan praktik Inspektorat Kabupaten Aceh Barat (penugasan AREP,
 * lima peran tim, formulir diterbitkan lewat ERPIKA > AREP). SATU sumber
 * untuk Word (ArepWordService) dan pratinjau/PDF (Keputusan.tsx).
 *
 * Bentuk isi bagian: teks paragraf, atau ['angka'|'huruf'|'butir' => [..]]
 * untuk daftar (butir boleh ['teks', [sub..]]), atau ['tabel' => [kepala, baris]].
 */
class PedomanKendaliMutu
{
    /** @return array<string, mixed> */
    public static function isi(): array
    {
        return [
            'keputusan' => self::keputusan(),
            'bab' => self::bab(),
            'formulir' => array_map(fn ($f) => [$f['kode'], $f['nama'], $f['tahapan']], KmKatalog::semua()),
        ];
    }

    /** @return array<string, mixed> */
    private static function keputusan(): array
    {
        return [
            'judul' => 'PEDOMAN KENDALI MUTU PENGAWASAN INTERN INSPEKTORAT KABUPATEN ACEH BARAT',
            'menimbang' => [
                'bahwa pengawasan intern atas penyelenggaraan Pemerintahan Kabupaten Aceh Barat merupakan unsur manajemen pemerintahan daerah yang penting dalam rangka mewujudkan tata kelola pemerintahan yang baik, bersih, dan akuntabel;',
                'bahwa untuk menjamin mutu hasil audit, reviu, evaluasi, dan pemantauan yang dilaksanakan oleh Inspektorat Kabupaten Aceh Barat sesuai dengan Kode Etik dan Standar Audit Intern Pemerintah Indonesia, diperlukan sistem pengendalian mutu yang terstruktur, terdokumentasi, dan diterapkan secara konsisten pada setiap penugasan;',
                'bahwa berdasarkan pertimbangan sebagaimana dimaksud dalam huruf a dan huruf b, perlu menetapkan Keputusan Inspektur tentang Pedoman Kendali Mutu Pengawasan Intern Inspektorat Kabupaten Aceh Barat;',
            ],
            'mengingat' => [
                'Undang-Undang Nomor 28 Tahun 1999 tentang Penyelenggaraan Negara yang Bersih dan Bebas dari Korupsi, Kolusi, dan Nepotisme;',
                'Undang-Undang Nomor 17 Tahun 2003 tentang Keuangan Negara;',
                'Undang-Undang Nomor 1 Tahun 2004 tentang Perbendaharaan Negara;',
                'Undang-Undang Nomor 15 Tahun 2004 tentang Pemeriksaan Pengelolaan dan Tanggung Jawab Keuangan Negara;',
                'Undang-Undang Nomor 11 Tahun 2006 tentang Pemerintahan Aceh;',
                'Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah sebagaimana telah beberapa kali diubah, terakhir dengan Undang-Undang Nomor 6 Tahun 2023 tentang Penetapan Peraturan Pemerintah Pengganti Undang-Undang Nomor 2 Tahun 2022 tentang Cipta Kerja menjadi Undang-Undang;',
                'Peraturan Pemerintah Nomor 60 Tahun 2008 tentang Sistem Pengendalian Intern Pemerintah;',
                'Peraturan Pemerintah Nomor 12 Tahun 2017 tentang Pembinaan dan Pengawasan Penyelenggaraan Pemerintahan Daerah;',
                'Peraturan Menteri Negara Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 19 Tahun 2009 tentang Pedoman Kendali Mutu Audit Aparat Pengawasan Intern Pemerintah;',
                'Qanun Kabupaten Aceh Barat Nomor 2 Tahun 2020 tentang Perubahan Kedua Atas Qanun Kabupaten Aceh Barat Nomor 3 Tahun 2016 tentang Pembentukan dan Susunan Perangkat Daerah Kabupaten Aceh Barat;',
                'Peraturan Bupati Aceh Barat Nomor 17 Tahun 2024 tentang Kedudukan, Susunan Organisasi, Tugas, Fungsi dan Tata Kerja Inspektorat Kabupaten Aceh Barat;',
                'Piagam Audit Intern Inspektorat Kabupaten Aceh Barat;',
            ],
            'memperhatikan' => [
                'Kode Etik Auditor Intern Pemerintah Indonesia dan Standar Audit Intern Pemerintah Indonesia yang ditetapkan oleh Asosiasi Auditor Intern Pemerintah Indonesia (AAIPI);',
                'Pedoman Kendali Mutu Audit Inspektorat Aceh yang ditetapkan dengan Keputusan Inspektur Aceh Nomor 700/2352/IA/2021;',
            ],
            'diktum' => [
                ['KESATU', 'Menetapkan Pedoman Kendali Mutu Pengawasan Intern Inspektorat Kabupaten Aceh Barat sebagaimana tercantum dalam Lampiran yang merupakan bagian tidak terpisahkan dari Keputusan ini.'],
                ['KEDUA', 'Pedoman sebagaimana dimaksud dalam Diktum KESATU wajib dipedomani oleh seluruh Auditor, Pejabat Pengawas Penyelenggaraan Urusan Pemerintahan di Daerah (P2UPD), pejabat struktural, dan pegawai yang ditugaskan dalam kegiatan pengawasan intern di lingkungan Inspektorat Kabupaten Aceh Barat, pada setiap penugasan audit, reviu, evaluasi, pemantauan, dan kegiatan pengawasan lainnya.'],
                ['KETIGA', 'Formulir Kendali Mutu sebagaimana tercantum dalam Lampiran Keputusan ini diterbitkan dan didokumentasikan untuk setiap penugasan, dan dapat diterbitkan secara elektronik melalui aplikasi ERPIKA menu AREP dengan data yang bersumber dari Rencana Penugasan Pengawasan (RPP).'],
                ['KEEMPAT', 'Pelaksanaan Pedoman ini dievaluasi paling sedikit 1 (satu) kali dalam 1 (satu) tahun oleh Sekretaris Inspektorat bersama para Inspektur Pembantu, dan hasilnya dilaporkan kepada Inspektur sebagai bahan penyempurnaan.'],
                ['KELIMA', 'Keputusan ini mulai berlaku pada tanggal ditetapkan, dengan ketentuan apabila di kemudian hari terdapat kekeliruan dalam penetapannya akan diadakan perbaikan sebagaimana mestinya.'],
            ],
        ];
    }

    /** @return list<array{nomor:string, judul:string, bagian:list<array{judul:string, isi:list<mixed>}>}> */
    private static function bab(): array
    {
        return [
            ['nomor' => 'BAB I', 'judul' => 'PENDAHULUAN', 'bagian' => [
                ['judul' => 'A. Latar Belakang', 'isi' => [
                    'Pengawasan intern merupakan unsur manajemen pemerintahan yang penting dalam mewujudkan tata kelola pemerintahan yang baik. Sebagai Aparat Pengawasan Intern Pemerintah (APIP) di Kabupaten Aceh Barat, Inspektorat melaksanakan fungsi pengawasan melalui audit, reviu, evaluasi, pemantauan, dan kegiatan pengawasan lainnya berupa asistensi, sosialisasi, dan konsultasi (consulting) terhadap penyelenggaraan urusan pemerintahan daerah.',
                    'Agar hasil pengawasan dapat diandalkan, setiap penugasan harus dilaksanakan sesuai dengan Kode Etik dan Standar Audit Intern Pemerintah Indonesia, sehingga siapa pun auditor yang melaksanakannya menghasilkan mutu yang setara. Untuk itu diperlukan sistem pengendalian mutu berupa kebijakan, prosedur, dan formulir kendali yang diterapkan secara berjenjang mulai dari perencanaan sampai dengan pemantauan tindak lanjut.',
                    'Pedoman ini disusun dengan mengacu pada Peraturan Menteri Negara Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 19 Tahun 2009 dan Pedoman Kendali Mutu Audit Inspektorat Aceh, disesuaikan dengan struktur organisasi, susunan tim penugasan, dan tata naskah Inspektorat Kabupaten Aceh Barat.',
                ]],
                ['judul' => 'B. Pengertian', 'isi' => [
                    'Dalam Pedoman ini yang dimaksud dengan:',
                    ['angka' => [
                        'Kendali Mutu adalah metode, kebijakan, dan prosedur yang digunakan untuk memastikan bahwa Inspektorat dan auditornya telah memenuhi kewajiban profesionalnya kepada auditi maupun pihak lain.',
                        'Pengawasan Intern adalah seluruh proses kegiatan audit, reviu, evaluasi, pemantauan, dan kegiatan pengawasan lain terhadap penyelenggaraan tugas dan fungsi organisasi dalam rangka memberikan keyakinan yang memadai bahwa kegiatan telah dilaksanakan sesuai dengan tolok ukur yang ditetapkan secara efektif dan efisien.',
                        'Audit adalah proses identifikasi masalah, analisis, dan evaluasi bukti yang dilakukan secara independen, objektif, dan profesional berdasarkan standar audit, untuk menilai kebenaran, kecermatan, kredibilitas, efektivitas, efisiensi, dan keandalan informasi pelaksanaan tugas dan fungsi instansi pemerintah.',
                        'Reviu adalah penelaahan ulang bukti-bukti suatu kegiatan untuk memastikan bahwa kegiatan tersebut telah dilaksanakan sesuai dengan ketentuan, standar, rencana, atau norma yang telah ditetapkan.',
                        'Evaluasi adalah rangkaian kegiatan membandingkan hasil atau prestasi suatu kegiatan dengan standar, rencana, atau norma yang telah ditetapkan, dan menentukan faktor-faktor yang mempengaruhi keberhasilan atau kegagalan suatu kegiatan dalam mencapai tujuan.',
                        'Pemantauan adalah proses penilaian kemajuan suatu program atau kegiatan dalam mencapai tujuan yang telah ditetapkan.',
                        'Penugasan adalah satu kegiatan audit, reviu, evaluasi, atau pemantauan (AREP) yang dilaksanakan berdasarkan Surat Tugas Inspektur.',
                        'Rencana Penugasan Pengawasan (RPP) adalah dokumen penjabaran Program Kerja Pengawasan Tahunan (PKPT) yang memuat objek, susunan tim, peran, jumlah hari kantor dan hari lapangan, serta waktu pelaksanaan setiap penugasan.',
                        'Auditor adalah pegawai yang menduduki Jabatan Fungsional Auditor (JFA) atau Jabatan Fungsional Pejabat Pengawas Penyelenggaraan Urusan Pemerintahan di Daerah (P2UPD), serta pegawai lain yang diberi tugas pengawasan oleh Inspektur.',
                        'Auditi adalah perangkat daerah, unit kerja, pemerintah gampong, atau pihak lain yang menjadi objek pengawasan Inspektorat.',
                        'Kertas Kerja Pemeriksaan (KKP) adalah dokumentasi bukti dan catatan yang disusun auditor untuk mendukung temuan, simpulan, dan rekomendasi.',
                        'Formulir Kendali Mutu (KM) adalah formulir standar sebagaimana tercantum dalam Lampiran Pedoman ini yang digunakan untuk mengendalikan dan mendokumentasikan mutu setiap tahapan pengawasan.',
                    ]],
                ]],
                ['judul' => 'C. Maksud dan Tujuan', 'isi' => [
                    'Pedoman ini dimaksudkan sebagai acuan bagi seluruh jajaran Inspektorat Kabupaten Aceh Barat dalam mengendalikan mutu pengawasan intern, untuk mengatasi:',
                    ['huruf' => [
                        'ketidakefektifan pengawasan intern;',
                        'proses penugasan yang tidak transparan dan tidak terdokumentasi;',
                        'kualitas dan integritas auditor yang belum memadai;',
                        'hasil pengawasan yang tidak terjamin mutunya sehingga tidak mencapai tujuan penugasan.',
                    ]],
                    'Tujuan Pedoman ini adalah memastikan bahwa setiap penugasan pengawasan yang dilaksanakan Inspektorat Kabupaten Aceh Barat sesuai dengan Kode Etik dan Standar Audit Intern Pemerintah Indonesia, terdokumentasi lengkap, dan hasilnya dapat dipertanggungjawabkan.',
                ]],
                ['judul' => 'D. Ruang Lingkup', 'isi' => [
                    'Pedoman ini mengatur pengendalian mutu atas seluruh tahapan pengawasan, yaitu:',
                    ['angka' => [
                        'penyusunan rencana strategis dan perencanaan pengawasan;',
                        'penyusunan rencana dan program kerja pada tingkat tim;',
                        'supervisi penugasan;',
                        'pelaksanaan penugasan;',
                        'pelaporan hasil pengawasan;',
                        'pemantauan tindak lanjut hasil pengawasan;',
                        'tata usaha dan pengelolaan sumber daya manusia.',
                    ]],
                    'Ketentuan dalam Pedoman ini yang disusun untuk audit berlaku pula, dengan penyesuaian seperlunya (mutatis mutandis), bagi penugasan reviu, evaluasi, dan pemantauan. Penyebutan "audit" dan "auditor" dalam formulir dibaca sesuai jenis penugasannya.',
                ]],
                ['judul' => 'E. Susunan Tim Penugasan', 'isi' => [
                    'Setiap penugasan dilaksanakan oleh tim dengan susunan peran sebagai berikut:',
                    ['tabel' => [['Peran', 'Dijabat oleh', 'Tanggung jawab pokok'], [
                        ['Penanggung Jawab (PJ)', 'Inspektur', 'Menetapkan penugasan, menandatangani Surat Tugas dan Laporan Hasil Pengawasan, serta bertanggung jawab akhir atas mutu hasil pengawasan.'],
                        ['Wakil Penanggung Jawab (WPJ)', 'Sekretaris atau Inspektur Pembantu', 'Mengendalikan mutu seluruh tim di bidangnya, mereviu konsep laporan, dan menyetujui anggaran waktu.'],
                        ['Pengendali Teknis (Dalnis)', 'Auditor/P2UPD Ahli Madya atau yang ditunjuk', 'Mereviu program kerja dan KKP ketua tim, melakukan supervisi lapangan, dan mereviu konsep laporan.'],
                        ['Ketua Tim (KT)', 'Auditor/P2UPD Ahli Muda atau yang ditunjuk', 'Memimpin tim di lapangan, menyusun program kerja, mereviu KKP anggota, dan menyusun konsep laporan.'],
                        ['Anggota Tim (AT)', 'Auditor/P2UPD atau pegawai yang ditunjuk', 'Melaksanakan langkah kerja, mengumpulkan dan menguji bukti, serta menyusun KKP.'],
                    ]]],
                    'Dalam hal tidak ditunjuk Pengendali Teknis tersendiri, tugas Pengendali Teknis dirangkap oleh Wakil Penanggung Jawab dan dicantumkan sebagai "PPJ/Pengendali Teknis".',
                ]],
            ]],
            ['nomor' => 'BAB II', 'judul' => 'PENGENDALIAN MUTU PENYUSUNAN RENCANA STRATEGIS', 'bagian' => [
                ['judul' => 'A. Standar Terkait', 'isi' => [['butir' => [
                    'Inspektorat wajib menyusun rencana strategis lima tahunan sesuai dengan peraturan perundang-undangan.',
                    'Inspektorat menyusun rencana pengawasan tahunan dengan prioritas pada kegiatan yang berisiko terbesar dan selaras dengan tujuan organisasi.',
                    'Visi, misi, tujuan, kewenangan, dan tanggung jawab Inspektorat dinyatakan secara tertulis, disetujui, dan ditandatangani oleh pimpinan organisasi.',
                ]]]],
                ['judul' => 'B. Prosedur', 'isi' => [
                    'Rencana strategis Inspektorat mencakup visi, misi, tujuan, sasaran, strategi, program, dan kegiatan, disusun dengan langkah:',
                    ['angka' => [
                        'menetapkan visi yang selaras dengan visi dan misi Pemerintah Kabupaten Aceh Barat, dirumuskan oleh pimpinan dengan masukan pejabat struktural dan fungsional;',
                        'menetapkan misi sebagai penjabaran visi;',
                        'menetapkan tujuan dan sasaran pengawasan beserta indikator yang terukur;',
                        'menetapkan strategi pengawasan, mengomunikasikannya kepada auditi untuk memperoleh masukan, lalu membagi habis strategi kepada unit pelaksana pengawasan (Inspektur Pembantu Wilayah I sampai dengan IV dan Inspektur Pembantu Khusus);',
                        'menetapkan program dan kegiatan pengawasan berdasarkan strategi.',
                    ]],
                    'Hubungan tujuan, sasaran, strategi, penanggung jawab, dan misi dituangkan dalam Formulir KM 1.',
                    'Pernyataan visi, misi, tujuan, kewenangan, dan tanggung jawab Inspektorat ditandatangani oleh Inspektur, disahkan oleh Bupati Aceh Barat, dan disampaikan kepada seluruh auditi.',
                ]],
            ]],
            ['nomor' => 'BAB III', 'judul' => 'PENGENDALIAN MUTU PERENCANAAN PENGAWASAN', 'bagian' => [
                ['judul' => 'A. Standar Terkait', 'isi' => [['butir' => [
                    'Inspektorat menyusun rencana pengawasan tahunan berbasis risiko.',
                    'Rencana pengawasan tahunan dikomunikasikan kepada pimpinan organisasi dan unit-unit terkait.',
                ]]]],
                ['judul' => 'B. Penetapan Besaran Risiko dan Peta Audit', 'isi' => [
                    'Besaran risiko setiap auditi ditetapkan dengan skala 1 sampai 5 (Sangat Rendah, Rendah, Sedang, Tinggi, Sangat Tinggi), paling sedikit satu kali setahun pada saat penyusunan rencana tahunan, dengan mempertimbangkan faktor:',
                    ['huruf' => ['jumlah anggaran;', 'waktu pengawasan terakhir;', 'jumlah pegawai dan jumlah kegiatan;', 'nilai aset tetap;', 'nilai temuan yang belum ditindaklanjuti;', 'kondisi Sistem Pengendalian Intern Pemerintah (SPIP);', 'nilai akuntabilitas kinerja; dan', 'profil manajemen risiko auditi, termasuk risiko strategis, operasional, dan risiko kecurangan (fraud) yang tercatat dalam aplikasi MR Kabar.']],
                    'Peta audit yang memuat auditi, besaran risiko, tenaga auditor, tenaga tata usaha, sarana prasarana, dan dukungan dana dituangkan dalam Formulir KM 2.',
                ]],
                ['judul' => 'C. Rencana Jangka Menengah dan Program Kerja Tahunan', 'isi' => [
                    ['angka' => [
                        'Unit yang melaksanakan fungsi perencanaan menyusun rencana pengawasan jangka menengah lima tahunan berdasarkan rencana strategis dan peta audit, ditetapkan oleh Inspektur (Formulir KM 3).',
                        'Unit perencanaan menyusun Usulan Program Kerja Pengawasan Tahunan (UPKPT) dan mengoordinasikannya dengan para Inspektur Pembantu (Formulir KM 4).',
                        'Hasil kesepakatan dituangkan dalam Program Kerja Pengawasan Tahunan (PKPT) yang ditetapkan oleh Inspektur (Formulir KM 5), didistribusikan kepada unit pelaksana, dan disampaikan kepada Bupati Aceh Barat.',
                        'PKPT dijabarkan ke dalam Rencana Penugasan Pengawasan (RPP) per bulan atau per jenis penugasan yang memuat objek, susunan tim, peran, hari kantor dan hari lapangan, serta waktu pelaksanaan. RPP menjadi sumber data Surat Tugas dan Formulir Kendali Mutu setiap penugasan.',
                    ]],
                ]],
            ]],
            ['nomor' => 'BAB IV', 'judul' => 'PENGENDALIAN MUTU RENCANA DAN PROGRAM KERJA PADA TINGKAT TIM', 'bagian' => [
                ['judul' => 'A. Standar Terkait', 'isi' => [['butir' => [
                    'Dalam setiap penugasan, tim menyusun rencana yang memuat sasaran, ruang lingkup, metodologi, dan alokasi sumber daya.',
                    'Perencanaan mempertimbangkan sistem pengendalian intern, ketidakpatuhan terhadap peraturan perundang-undangan, kecurangan, dan ketidakpatutan (abuse).',
                    'Rencana audit investigatif dievaluasi dan disempurnakan selama penugasan sesuai perkembangan di lapangan.',
                ]]]],
                ['judul' => 'B. Hal yang Dipertimbangkan', 'isi' => [['angka' => [
                    'laporan hasil pengawasan sebelumnya dan status tindak lanjutnya, termasuk data pada Database LHP;',
                    'sasaran penugasan dan pengujian yang diperlukan;',
                    'kriteria untuk menilai organisasi, program, kegiatan, dan fungsi;',
                    'sistem pengendalian intern dan risiko auditi;',
                    'kemungkinan pelanggaran terhadap ketentuan yang berlaku;',
                    'hak, kewajiban, dan manfaat penugasan bagi auditi;',
                    'pendekatan yang efisien dan efektif; dan',
                    'bentuk dan isi laporan.',
                ]]]],
                ['judul' => 'C. Prosedur', 'isi' => [['angka' => [
                    'Berdasarkan RPP, Inspektur menerbitkan Surat Tugas (Formulir KM 27) beserta Surat Pengantar kepada pimpinan auditi. Setiap anggota tim menandatangani Pernyataan Independensi dan Integritas sebelum penugasan dimulai.',
                    'Ketua Tim menyusun Kartu Penugasan (Formulir KM 6) rangkap dua: satu disimpan dalam KKP dan satu disampaikan kepada Pengendali Teknis. Kartu Penugasan ditandatangani Inspektur, Pengendali Teknis, dan Wakil Penanggung Jawab.',
                    'Ketua Tim menyusun Anggaran Waktu Penugasan (Formulir KM 7). Jumlah hari tiap anggota tim mengikuti RPP (hari kantor ditambah hari lapangan), dengan ketentuan satu hari produktif (HP) sama dengan 6,5 jam. Anggaran waktu disetujui Wakil Penanggung Jawab dan Pengendali Teknis serta diketahui Inspektur.',
                    'Tim melakukan analisis data auditi, menetapkan sasaran, ruang lingkup, dan metodologi, serta menilai pengendalian intern dan risiko kecurangan. Kemajuannya dilaporkan dalam Laporan Mingguan (Formulir KM 8).',
                    'Ketua Tim bersama anggota menyusun Program Kerja (Formulir KM 9) yang disahkan oleh Pengendali Teknis sebelum pelaksanaan lapangan.',
                    'Pengendali Teknis mengisi Check List Penyelesaian Perencanaan (Formulir KM 10). Kesepakatan dengan auditi atas tujuan, waktu, dan kontak dituangkan dalam Notulensi Kesepakatan (Formulir KM 11).',
                ]]]],
            ]],
            ['nomor' => 'BAB V', 'judul' => 'PENGENDALIAN MUTU SUPERVISI', 'bagian' => [
                ['judul' => 'A. Standar Terkait', 'isi' => ['Supervisi dilaksanakan pada setiap tahapan penugasan agar sasaran tercapai, mutu terjamin, dan kemampuan auditor meningkat. Supervisi dilakukan secara berjenjang: Ketua Tim mensupervisi Anggota Tim, Pengendali Teknis mensupervisi Ketua Tim, dan Wakil Penanggung Jawab mensupervisi seluruh tim di bidangnya.']],
                ['judul' => 'B. Supervisi oleh Ketua Tim', 'isi' => ['Ketua Tim mengawasi anggota secara langsung selama penugasan dan secara tidak langsung melalui reviu KKP. KKP yang telah sesuai tujuan diparaf Ketua Tim sebagai tanda telah direviu dan disetujui.']],
                ['judul' => 'C. Supervisi oleh Pengendali Teknis', 'isi' => ['Pengendali Teknis secara berkala mengunjungi tim di lapangan, paling sedikit pada saat pembicaraan akhir dengan auditi, memberikan arahan atas masalah yang memerlukan keputusan, dan mereviu KKP Ketua Tim. Hasil supervisi dicatat dalam Lembar Reviu Supervisi (Formulir KM 12) yang disediakan Ketua Tim; satu lembar disimpan dalam KKP dan satu lembar menjadi arsip Pengendali Teknis.']],
                ['judul' => 'D. Supervisi oleh Wakil Penanggung Jawab', 'isi' => ['Wakil Penanggung Jawab mereviu formulir supervisi Pengendali Teknis dan konsep laporan, melakukan rapat reviu bersama Pengendali Teknis dan Ketua Tim, serta mengisi Lembar Reviu Supervisi untuk mengomunikasikan hasil reviunya.']],
            ]],
            ['nomor' => 'BAB VI', 'judul' => 'PENGENDALIAN MUTU PELAKSANAAN PENUGASAN', 'bagian' => [
                ['judul' => 'A. Standar Terkait', 'isi' => ['Bukti dikumpulkan dan diuji untuk menyimpulkan dan mendukung temuan. Temuan dikembangkan secara memadai dan didokumentasikan dalam KKP.']],
                ['judul' => 'B. Pengendalian Waktu', 'isi' => [
                    'Waktu penugasan mengikuti Surat Tugas dan RPP. Setiap perubahan waktu mulai dikomunikasikan terlebih dahulu kepada auditi agar tidak terjadi pengawasan yang tumpang tindih. Ketua Tim mengendalikan realisasi waktu terhadap anggaran waktu (Formulir KM 7) melalui Laporan Mingguan Pengujian dan Evaluasi (Formulir KM 13).',
                ]],
                ['judul' => 'C. Kesesuaian dengan Program Kerja', 'isi' => ['Realisasi setiap langkah kerja dan referensi KKP diisikan pada kolom realisasi Program Kerja (Formulir KM 9). Perubahan program kerja disetujui Pengendali Teknis sebelum dilaksanakan.']],
                ['judul' => 'D. Pengendalian Temuan', 'isi' => [
                    'Setiap temuan dikembangkan melalui unsur kondisi, kriteria, sebab, dan akibat, disertai rekomendasi. Temuan dibahas dan disetujui Pengendali Teknis, lalu dikomunikasikan kepada pimpinan auditi sebelum atau pada saat penyelesaian lapangan.',
                    'Hasil komunikasi didokumentasikan, diberi tanggal, dan ditandatangani auditor dan auditi, memuat kesepakatan atau ketidaksepakatan serta kesanggupan menindaklanjuti rekomendasi paling lama 60 (enam puluh) hari setelah laporan diterima. Temuan dituangkan dalam Konsep Temuan dan Rencana Tindak Lanjut (Formulir KM 18) dan disampaikan dengan Surat Penyampaian Temuan (Formulir KM 28).',
                ]],
                ['judul' => 'E. Kertas Kerja Pemeriksaan', 'isi' => [
                    'KKP disusun oleh Anggota Tim, Ketua Tim, dan Pengendali Teknis, dan ditelaah secara berjenjang. KKP memenuhi prinsip:',
                    ['angka' => ['berkaitan dengan tujuan penugasan;', 'ringkas, jelas, cermat, dan teliti;', 'tidak menyisakan pos terbuka (pending matter) setelah penugasan selesai;', 'berjudul, tertata rapi, mudah dibaca, dan diberi indeks silang;', 'mencantumkan nama dan paraf pembuat serta pereviu.']],
                    'KKP pokok meliputi KKP perencanaan (pengumpulan informasi, survei pendahuluan, evaluasi SPIP, program kerja), KKP pelaksanaan (pengujian pengendalian, pengujian substantif, pengembangan temuan, kesepakatan temuan), dan konsep laporan final.',
                ]],
                ['judul' => 'F. Kesesuaian dengan Standar', 'isi' => ['Kepatuhan terhadap standar pengumpulan dan pengujian bukti dikendalikan melalui Check List Penyelesaian Pengujian dan Evaluasi (Formulir KM 14) yang diisi Ketua Tim dan direviu Pengendali Teknis.']],
            ]],
            ['nomor' => 'BAB VII', 'judul' => 'PENGENDALIAN MUTU PELAPORAN', 'bagian' => [
                ['judul' => 'A. Standar Terkait', 'isi' => ['Laporan dibuat tertulis segera setelah penugasan selesai, dalam bentuk dan isi yang mudah dimengerti, tepat waktu, lengkap, akurat, objektif, meyakinkan, jelas, dan ringkas, serta disampaikan kepada pihak yang berwenang sesuai ketentuan.']],
                ['judul' => 'B. Penyusunan Konsep Laporan', 'isi' => [['angka' => [
                    'Ketua Tim dibantu anggota menyusun konsep laporan berdasarkan KKP dan temuan yang telah dikomunikasikan, serta menyiapkan Pengendalian Penyusunan Laporan (Formulir KM 15) dan Reviu Konsep Laporan (Formulir KM 16).',
                    'Konsep laporan diserahkan kepada Pengendali Teknis untuk direviu. Permasalahan dicatat dalam Formulir KM 16 dan ditindaklanjuti Ketua Tim.',
                    'Setelah memadai, konsep laporan diserahkan kepada Wakil Penanggung Jawab untuk direviu dengan cara yang sama.',
                    'Konsep yang telah disetujui Wakil Penanggung Jawab dipaparkan (ekspose) di hadapan Inspektur. Hasil ekspose digunakan untuk menyempurnakan konsep sebelum difinalkan.',
                ]]]],
                ['judul' => 'C. Finalisasi dan Distribusi', 'isi' => [
                    ['angka' => [
                        'Tim memfinalkan laporan; Ketua Tim mengoreksi dengan Check List Penyelesaian Laporan (Formulir KM 17).',
                        'Nomor laporan dimintakan kepada unit yang melaksanakan fungsi tata usaha, lalu laporan diperbanyak dan dijilid.',
                        'Laporan diparaf Pengendali Teknis dan Wakil Penanggung Jawab, kemudian ditandatangani Inspektur.',
                        'Laporan didistribusikan kepada Bupati Aceh Barat, auditi, dan pihak lain yang berwenang, serta diarsipkan. Data laporan dan temuan dicatat pada Database LHP.',
                    ]],
                ]],
            ]],
            ['nomor' => 'BAB VIII', 'judul' => 'PENGENDALIAN MUTU PEMANTAUAN TINDAK LANJUT', 'bagian' => [
                ['judul' => 'A. Standar Terkait', 'isi' => [['butir' => [
                    'Inspektorat mengomunikasikan kepada auditi bahwa tanggung jawab menindaklanjuti temuan dan rekomendasi berada pada auditi.',
                    'Inspektorat memantau dan mendorong tindak lanjut atas temuan dan rekomendasi.',
                    'Inspektorat melaporkan status temuan dan rekomendasi yang belum ditindaklanjuti.',
                ]]]],
                ['judul' => 'B. Kewajiban Tindak Lanjut', 'isi' => ['Sesuai Peraturan Pemerintah Nomor 60 Tahun 2008, pimpinan auditi wajib menindaklanjuti rekomendasi hasil audit dan reviu. Inspektorat memantau pelaksanaannya melalui Tim Pemantauan Tindak Lanjut yang ditunjuk Inspektur. Pada setiap penugasan ulang atas auditi yang sama, tim memeriksa status tindak lanjut rekomendasi terdahulu.']],
                ['judul' => 'C. Prosedur Pemantauan', 'isi' => [['angka' => [
                    'Ketua Tim menyerahkan Konsep Temuan dan Rencana Tindak Lanjut (Formulir KM 18) kepada unit yang melaksanakan fungsi pelaporan untuk dicatat dalam Database LHP.',
                    'Auditi melaporkan tindak lanjut dengan Laporan Tindak Lanjut Temuan Audit (Formulir KM 19).',
                    'Tim Pemantau memverifikasi dan, bila perlu, menguji tindak lanjut, lalu melaporkannya dalam Laporan Pemantauan Tindak Lanjut (Formulir KM 20). Status dicatat sebagai: tuntas, sebagian, atau belum ditindaklanjuti.',
                    'Tindak lanjut yang kurang memuaskan dilaporkan kepada Inspektur. Apabila batas waktu terlampaui, Inspektur menerbitkan surat peringatan pertama; jika dalam satu bulan belum ditindaklanjuti, diterbitkan surat peringatan kedua; jika tetap belum ditindaklanjuti, Inspektur melaporkan kepada Bupati Aceh Barat untuk diproses sesuai ketentuan penyelesaian tuntutan ganti kerugian daerah.',
                    'Pemutakhiran saldo temuan dilakukan paling sedikit satu kali setahun dan dituangkan dalam Berita Acara Pemutakhiran Data (Formulir KM 21) yang ditandatangani pimpinan auditi dan pimpinan APIP.',
                ]]]],
            ]],
            ['nomor' => 'BAB IX', 'judul' => 'PENGENDALIAN MUTU TATA USAHA DAN SUMBER DAYA MANUSIA', 'bagian' => [
                ['judul' => 'A. Tata Usaha', 'isi' => [
                    'Ketatausahaan menunjang penugasan sejak perencanaan sampai pemantauan tindak lanjut, antara lain:',
                    ['angka' => [
                        'menyediakan dan menyebarluaskan pernyataan visi, misi, tujuan, kewenangan, dan tanggung jawab Inspektorat;',
                        'menyiapkan agenda penomoran RPP, Surat Pengantar, Surat Tugas, Kartu Penugasan, dan laporan;',
                        'mencetak Surat Tugas, surat perjalanan dinas, dan surat lain yang mendukung penugasan;',
                        'menyediakan formulir dan peralatan kerja, serta meminjamkannya dengan bukti peminjaman (Formulir KM 26);',
                        'menyusun rencana audit per objek, perencanaan petugas, anggaran biaya, dan rekapitulasi biaya (Formulir KM 22 sampai dengan KM 25);',
                        'mencetak, mendistribusikan, dan menyimpan laporan serta KKP yang telah disetujui.',
                    ]],
                ]],
                ['judul' => 'B. Tata Kearsipan', 'isi' => [
                    'Arsip penugasan dikelola agar mudah ditemukan, terlindung dari kehilangan, dan dikurangi sesuai ketentuan. Arsip terdiri atas arsip unit pelaksana (KKP dan surat penugasan berjalan) dan arsip pusat. Pengurangan arsip dilakukan dengan memindahkan arsip aktif menjadi inaktif, arsip inaktif menjadi statis, dan memusnahkan arsip yang tidak bernilai guna sesuai peraturan perundang-undangan di bidang kearsipan.',
                ]],
                ['judul' => 'C. Pengelolaan Sumber Daya Manusia', 'isi' => [
                    'Inspektur menetapkan program pengembangan sumber daya manusia yang meliputi:',
                    ['angka' => [
                        'pembagian tugas setiap jenjang jabatan secara tertulis;',
                        'seleksi auditor yang memenuhi syarat pendidikan paling rendah Sarjana (S-1) atau setara, sertifikasi JFA/P2UPD, serta kompetensi auditing, akuntansi, administrasi pemerintahan, hukum, dan komunikasi;',
                        'pendidikan dan pelatihan berkelanjutan yang terdokumentasi;',
                        'penilaian kinerja auditor paling sedikit setahun sekali secara berjenjang: Ketua Tim menilai Anggota Tim, Pengendali Teknis menilai Ketua Tim, dan Wakil Penanggung Jawab menilai Pengendali Teknis.',
                    ]],
                    'Penilaian kinerja per penugasan dituangkan dalam Formulir KM 29 dan direkapitulasi dalam Kartu Penilaian Kinerja Auditor/P2UPD (Formulir KM 30).',
                ]],
            ]],
            ['nomor' => 'BAB X', 'judul' => 'PENUTUP', 'bagian' => [
                ['judul' => '', 'isi' => [
                    'Formulir Kendali Mutu sebagaimana tercantum dalam Lampiran ini merupakan standar minimal dan dapat dikembangkan sesuai kebutuhan penugasan tanpa mengurangi unsur pokoknya. Setiap formulir dibuat satu lembar per penugasan, diisi, ditandatangani sesuai peran, dan disimpan dalam KKP.',
                    'Formulir yang datanya tersedia pada Rencana Penugasan Pengawasan (RPP) dan Database LHP diterbitkan melalui aplikasi ERPIKA menu AREP, sehingga nomor, tanggal, susunan tim, dan anggaran waktu konsisten antara Surat Tugas dan seluruh formulir kendali mutu.',
                    'Hal-hal yang belum diatur dalam Pedoman ini mengacu pada Kode Etik dan Standar Audit Intern Pemerintah Indonesia serta ketentuan peraturan perundang-undangan.',
                ]],
            ]],
        ];
    }
}
