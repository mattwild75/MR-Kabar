<?php

/**
 * Isi lengkap 1a KRS Pemda, diturunkan dari tiga tabel RPJMD Kabupaten
 * Aceh Barat 2025-2029:
 *
 *   Tabel 3.3  Cascading RPJM
 *   Tabel 3.5  Cascading Program Prioritas
 *   Tabel 4.1  Program Perangkat Daerah
 *
 * Berkas ini DIHASILKAN dari basis data yang isinya sudah dicocokkan dengan
 * ketiga tabel tersebut. Sengaja tidak diurai ulang dari PDF: sel tabelnya
 * terpecah antar baris sehingga penguraian otomatis kehilangan sebagian besar
 * nama program, dan hasil yang salah pada kertas kerja tingkat Pemda jauh
 * lebih mahal daripada satu berkas data yang besar.
 *
 * Satu baris di sini = satu pasangan indikator dan perangkat daerah. Program
 * yang diampu banyak perangkat daerah karena itu menempati banyak baris, dan
 * kolom OPD tiap baris hanya memuat SATU nama.
 *
 * Jangan disunting dengan tangan. Perbaiki datanya lewat aplikasi, lalu
 * hasilkan ulang berkas ini.
 *
 * @return array<int, array<string, string>>
 */

return [
    0 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Pendidikan yang Berkualitas dan Inklusif',
        'IK SASARAN RPJMD' => 'Jumlah Lulusan SMP yang Memiliki Kemampuan Bahasa Inggris dengan Score TOEFL Minimal 350
Rapor Mutu Pendidikan
Skor literasi SD
Skor Numerasi SD
Skor literasi SMP
Skor Numerasi SMP
Indeks Pembangunan Literasi Masyarakat',
        'BASELINE IK SASARAN RPJMD' => 'N/A
Tidak Ada Data
46,34
35,35
50,74
49,85
55,37',
        'TARGET IK SASARAN RPJMD' => '65
73,15
46,34
41,66
58,52
57,15
72,5',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen
Persen
Persen
Persen
Persen
Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PERPUSTAKAAN DAN KEARSIPAN',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Pendidikan',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Partisipasi Anak Usia Sekolah',
        'IK PROGRAM' => 'Angka Partisipasi Sekolah (7-15 Tahun)',
        'BASELINE IK PROGRAM' => '98,64',
        'TARGET IK PROGRAM' => '99,60',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    ],
    1 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Pendidikan yang Berkualitas dan Inklusif',
        'IK SASARAN RPJMD' => 'Jumlah Lulusan SMP yang Memiliki Kemampuan Bahasa Inggris dengan Score TOEFL Minimal 350
Rapor Mutu Pendidikan
Skor literasi SD
Skor Numerasi SD
Skor literasi SMP
Skor Numerasi SMP
Indeks Pembangunan Literasi Masyarakat',
        'BASELINE IK SASARAN RPJMD' => 'N/A
Tidak Ada Data
46,34
35,35
50,74
49,85
55,37',
        'TARGET IK SASARAN RPJMD' => '65
73,15
46,34
41,66
58,52
57,15
72,5',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen
Persen
Persen
Persen
Persen
Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PERPUSTAKAAN DAN KEARSIPAN',
        'PROGRAM PRIORITAS' => 'Program Pendidik dan Tenaga Kependidikan',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Mutu dan Distribusi Pendidik dan Tenaga Kependidikan',
        'IK PROGRAM' => 'Indeks Pemerataan Guru',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '67',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    ],
    2 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Pendidikan yang Berkualitas dan Inklusif',
        'IK SASARAN RPJMD' => 'Jumlah Lulusan SMP yang Memiliki Kemampuan Bahasa Inggris dengan Score TOEFL Minimal 350
Rapor Mutu Pendidikan
Skor literasi SD
Skor Numerasi SD
Skor literasi SMP
Skor Numerasi SMP
Indeks Pembangunan Literasi Masyarakat',
        'BASELINE IK SASARAN RPJMD' => 'N/A
Tidak Ada Data
46,34
35,35
50,74
49,85
55,37',
        'TARGET IK SASARAN RPJMD' => '65
73,15
46,34
41,66
58,52
57,15
72,5',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen
Persen
Persen
Persen
Persen
Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PERPUSTAKAAN DAN KEARSIPAN',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Lalu Lintas dan Angkutan Jalan (LLAJ)',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Transportasi Darat',
        'IK PROGRAM' => 'Cakupan Trayek Angkutan',
        'BASELINE IK PROGRAM' => '2',
        'TARGET IK PROGRAM' => '3',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERHUBUNGAN',
    ],
    3 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Memperluas Perlindungan Sosial bagi Masyarakat',
        'IK SASARAN RPJMD' => 'Persentase Belanja Pemerintah untuk Perlindungan Sosial
Persentase Belanja CSR untuk Perlindungan Sosial',
        'BASELINE IK SASARAN RPJMD' => 'N/A
0,35',
        'TARGET IK SASARAN RPJMD' => '0,05
0,9',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'PROGRAM PRIORITAS' => 'Program Hubungan Industrial',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Pekerja Indonesia yang Terindungi',
        'IK PROGRAM' => 'Persentase Penyelesaian Masalah Ketenagakerjaan',
        'BASELINE IK PROGRAM' => '76,92',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA',
    ],
    4 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Memperluas Perlindungan Sosial bagi Masyarakat',
        'IK SASARAN RPJMD' => 'Persentase Belanja Pemerintah untuk Perlindungan Sosial
Persentase Belanja CSR untuk Perlindungan Sosial',
        'BASELINE IK SASARAN RPJMD' => 'N/A
0,35',
        'TARGET IK SASARAN RPJMD' => '0,05
0,9',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'PROGRAM PRIORITAS' => 'Program Perlindungan dan Jaminan Sosial',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Perlindungan dan Jaminan Sosial',
        'IK PROGRAM' => 'Persentase Penerima Manfaat yang Terpenuhi kebutuhan Dasarnya',
        'BASELINE IK PROGRAM' => '10,79254373',
        'TARGET IK PROGRAM' => '90',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS SOSIAL',
    ],
    5 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Memperluas Perlindungan Sosial bagi Masyarakat',
        'IK SASARAN RPJMD' => 'Persentase Belanja Pemerintah untuk Perlindungan Sosial
Persentase Belanja CSR untuk Perlindungan Sosial',
        'BASELINE IK SASARAN RPJMD' => 'N/A
0,35',
        'TARGET IK SASARAN RPJMD' => '0,05
0,9',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'PROGRAM PRIORITAS' => 'Program Peningkatan Prasarana, Sarana dan Utilitas Umum (PSU)',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Penyediaan PSU Permukiman',
        'IK PROGRAM' => 'Persentase Permukiman dengan PSU Baik',
        'BASELINE IK PROGRAM' => '45',
        'TARGET IK PROGRAM' => '49',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN',
    ],
    6 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Aksesibilitas dan Partisipasi Perempuan dalam Pembangunan',
        'IK SASARAN RPJMD' => 'Indeks Pembangunan Gender (IPG)
Jumlah Kelompok Usaha Perempuan yang Berhasil',
        'BASELINE IK SASARAN RPJMD' => '86,7
50',
        'TARGET IK SASARAN RPJMD' => '87,45
67',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Kelompok',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA
DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
        'PROGRAM PRIORITAS' => 'Program Penyediaan dan Pengembangan Sarana Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Distribusi dan Kualitas Sarana Pertanian',
        'IK PROGRAM' => 'Produktivitas Padi',
        'BASELINE IK PROGRAM' => '6,3',
        'TARGET IK PROGRAM' => '7,1',
        'SATUAN IK PROGRAM' => 'Ton/Ha',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
    ],
    7 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Aksesibilitas dan Partisipasi Perempuan dalam Pembangunan',
        'IK SASARAN RPJMD' => 'Indeks Pembangunan Gender (IPG)
Jumlah Kelompok Usaha Perempuan yang Berhasil',
        'BASELINE IK SASARAN RPJMD' => '86,7
50',
        'TARGET IK SASARAN RPJMD' => '87,45
67',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Kelompok',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA
DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Perikanan Budidaya',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Produksi Perikanan Budidaya',
        'IK PROGRAM' => 'Produksi Perikanan Kelompok Pembudidaya Ikan',
        'BASELINE IK PROGRAM' => '802,39',
        'TARGET IK PROGRAM' => '840',
        'SATUAN IK PROGRAM' => 'Ton',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KELAUTAN DAN PERIKANAN',
    ],
    8 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Aksesibilitas dan Partisipasi Perempuan dalam Pembangunan',
        'IK SASARAN RPJMD' => 'Indeks Pembangunan Gender (IPG)
Jumlah Kelompok Usaha Perempuan yang Berhasil',
        'BASELINE IK SASARAN RPJMD' => '86,7
50',
        'TARGET IK SASARAN RPJMD' => '87,45
67',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Kelompok',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA
DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
        'PROGRAM PRIORITAS' => 'Program Pengolahan dan Pemasaran Hasil Perikanan',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Konsumsi Ikan Oleh Masyarakat',
        'IK PROGRAM' => 'Jumlah Industri Perikanan yang Mendapatkan Kerjasama Pemasaran',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '6',
        'SATUAN IK PROGRAM' => 'unit usaha',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KELAUTAN DAN PERIKANAN',
    ],
    9 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Aksesibilitas dan Partisipasi Perempuan dalam Pembangunan',
        'IK SASARAN RPJMD' => 'Indeks Pembangunan Gender (IPG)
Jumlah Kelompok Usaha Perempuan yang Berhasil',
        'BASELINE IK SASARAN RPJMD' => '86,7
50',
        'TARGET IK SASARAN RPJMD' => '87,45
67',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Kelompok',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA
DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
        'PROGRAM PRIORITAS' => 'Program Peningkatan Diversifikasi dan Ketahanan Pangan Masyarakat',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Diversifikasi dan Ketahanan Pangan Masyarakat',
        'IK PROGRAM' => 'Ketersediaan Pangan Utama',
        'BASELINE IK PROGRAM' => '71920',
        'TARGET IK PROGRAM' => '35050',
        'SATUAN IK PROGRAM' => 'Ton',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PANGAN',
    ],
    10 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Aksesibilitas dan Partisipasi Perempuan dalam Pembangunan',
        'IK SASARAN RPJMD' => 'Indeks Pembangunan Gender (IPG)
Jumlah Kelompok Usaha Perempuan yang Berhasil',
        'BASELINE IK SASARAN RPJMD' => '86,7
50',
        'TARGET IK SASARAN RPJMD' => '87,45
67',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Kelompok',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA
DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
        'PROGRAM PRIORITAS' => 'Program Perencanaan dan Pembangunan Industri',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Realisasi Pembangunan Industri',
        'IK PROGRAM' => 'Rata-rata Peningkatan Pendapatan IKM Hilir',
        'BASELINE IK PROGRAM' => '5',
        'TARGET IK PROGRAM' => '7,5-8',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    11 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Aksesibilitas dan Partisipasi Perempuan dalam Pembangunan',
        'IK SASARAN RPJMD' => 'Indeks Pembangunan Gender (IPG)
Jumlah Kelompok Usaha Perempuan yang Berhasil',
        'BASELINE IK SASARAN RPJMD' => '86,7
50',
        'TARGET IK SASARAN RPJMD' => '87,45
67',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Kelompok',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA
DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
        'PROGRAM PRIORITAS' => 'Program Pengembangan UMKM',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Daya Saing UMKM',
        'IK PROGRAM' => 'Persentase Usaha Mikro Menjadi Usaha kecil dan Menengah',
        'BASELINE IK PROGRAM' => '5,98',
        'TARGET IK PROGRAM' => '5',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    12 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Aksesibilitas dan Partisipasi Perempuan dalam Pembangunan',
        'IK SASARAN RPJMD' => 'Indeks Pembangunan Gender (IPG)
Jumlah Kelompok Usaha Perempuan yang Berhasil',
        'BASELINE IK SASARAN RPJMD' => '86,7
50',
        'TARGET IK SASARAN RPJMD' => '87,45
67',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Kelompok',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA
DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
        'PROGRAM PRIORITAS' => 'Program Perlindungan dan Jaminan Sosial',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Perlindungan dan Jaminan Sosial',
        'IK PROGRAM' => 'Persentase Penerima Manfaat yang Terpenuhi kebutuhan Dasarnya',
        'BASELINE IK PROGRAM' => '10,79254373',
        'TARGET IK PROGRAM' => '90',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS SOSIAL',
    ],
    13 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Mewujudkan Pemenuhan Hak-hak Anak',
        'IK SASARAN RPJMD' => 'Persentase Gampong Ramah Anak
Jumlah Anak Terlantar dan Rentan Terlantar yang Terpenuhi Layanan Dasar
Persentase Sekolah Ramah Anak Jenjang SD/SMP',
        'BASELINE IK SASARAN RPJMD' => '1,55
113
N/A',
        'TARGET IK SASARAN RPJMD' => '7,79
90
14,76',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Orang
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA
DINAS SOSIAL
DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
    ],
    14 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Ketersediaan Lapangan Pekerjaan',
        'IK SASARAN RPJMD' => 'Tingkat Pengangguran Terbuka
Pertumbuhan UMKM/IKM',
        'BASELINE IK SASARAN RPJMD' => '5,58
2,17',
        'TARGET IK SASARAN RPJMD' => '5
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Perikanan Budidaya',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Produksi Perikanan Budidaya',
        'IK PROGRAM' => 'Produksi Perikanan Kelompok Pembudidaya Ikan',
        'BASELINE IK PROGRAM' => '802,39',
        'TARGET IK PROGRAM' => '840',
        'SATUAN IK PROGRAM' => 'Ton',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KELAUTAN DAN PERIKANAN',
    ],
    15 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Ketersediaan Lapangan Pekerjaan',
        'IK SASARAN RPJMD' => 'Tingkat Pengangguran Terbuka
Pertumbuhan UMKM/IKM',
        'BASELINE IK SASARAN RPJMD' => '5,58
2,17',
        'TARGET IK SASARAN RPJMD' => '5
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Perikanan Tangkap',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Produksi Perikanan Tangkap',
        'IK PROGRAM' => 'Produksi Perikanan Kelompok Nelayan',
        'BASELINE IK PROGRAM' => '20105201',
        'TARGET IK PROGRAM' => '20450',
        'SATUAN IK PROGRAM' => 'Ton',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KELAUTAN DAN PERIKANAN',
    ],
    16 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Ketersediaan Lapangan Pekerjaan',
        'IK SASARAN RPJMD' => 'Tingkat Pengangguran Terbuka
Pertumbuhan UMKM/IKM',
        'BASELINE IK SASARAN RPJMD' => '5,58
2,17',
        'TARGET IK SASARAN RPJMD' => '5
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Pengolahan dan Pemasaran Hasil Perikanan',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Konsumsi Ikan Oleh Masyarakat',
        'IK PROGRAM' => 'Jumlah Industri Perikanan yang Mendapatkan Kerjasama Pemasaran',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '6',
        'SATUAN IK PROGRAM' => 'unit usaha',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KELAUTAN DAN PERIKANAN',
    ],
    17 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Ketersediaan Lapangan Pekerjaan',
        'IK SASARAN RPJMD' => 'Tingkat Pengangguran Terbuka
Pertumbuhan UMKM/IKM',
        'BASELINE IK SASARAN RPJMD' => '5,58
2,17',
        'TARGET IK SASARAN RPJMD' => '5
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Pengembangan UMKM',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Daya Saing UMKM',
        'IK PROGRAM' => 'Persentase Usaha Mikro Menjadi Usaha kecil dan Menengah',
        'BASELINE IK PROGRAM' => '5,98',
        'TARGET IK PROGRAM' => '5',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    18 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Ketersediaan Lapangan Pekerjaan',
        'IK SASARAN RPJMD' => 'Tingkat Pengangguran Terbuka
Pertumbuhan UMKM/IKM',
        'BASELINE IK SASARAN RPJMD' => '5,58
2,17',
        'TARGET IK SASARAN RPJMD' => '5
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Penyediaan dan Pengembangan Sarana Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Distribusi dan Kualitas Sarana Pertanian',
        'IK PROGRAM' => 'Produktivitas Padi',
        'BASELINE IK PROGRAM' => '6,3',
        'TARGET IK PROGRAM' => '7,1',
        'SATUAN IK PROGRAM' => 'Ton/Ha',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
    ],
    19 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Ketersediaan Lapangan Pekerjaan',
        'IK SASARAN RPJMD' => 'Tingkat Pengangguran Terbuka
Pertumbuhan UMKM/IKM',
        'BASELINE IK SASARAN RPJMD' => '5,58
2,17',
        'TARGET IK SASARAN RPJMD' => '5
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Penyediaan dan Pengembangan Prasarana Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Distribusi dan Kualitas Prasarana Pertanian',
        'IK PROGRAM' => 'Jumlah Lahan yang Dimanfaatkan untuk Persawahan',
        'BASELINE IK PROGRAM' => '82298,22',
        'TARGET IK PROGRAM' => '82900',
        'SATUAN IK PROGRAM' => 'Ha',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
    ],
    20 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Ketersediaan Lapangan Pekerjaan',
        'IK SASARAN RPJMD' => 'Tingkat Pengangguran Terbuka
Pertumbuhan UMKM/IKM',
        'BASELINE IK SASARAN RPJMD' => '5,58
2,17',
        'TARGET IK SASARAN RPJMD' => '5
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Pengendalian dan Penanggulangan Bencana Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Pengendalian dan Penanggulangan Bencana Pertanian',
        'IK PROGRAM' => 'Luas Panen Pertanian',
        'BASELINE IK PROGRAM' => '14026,16',
        'TARGET IK PROGRAM' => '16500',
        'SATUAN IK PROGRAM' => 'Ha',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
    ],
    21 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Ketersediaan Lapangan Pekerjaan',
        'IK SASARAN RPJMD' => 'Tingkat Pengangguran Terbuka
Pertumbuhan UMKM/IKM',
        'BASELINE IK SASARAN RPJMD' => '5,58
2,17',
        'TARGET IK SASARAN RPJMD' => '5
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Pelatihan Kerja dan Produktivitas Tenaga Kerja',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Produktivitas Tenaga Kerja',
        'IK PROGRAM' => 'Persentase Tenaga Kerja Terlatih yang Memperoleh Pekerjaan',
        'BASELINE IK PROGRAM' => '37,04',
        'TARGET IK PROGRAM' => '55',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA',
    ],
    22 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Ketersediaan Lapangan Pekerjaan',
        'IK SASARAN RPJMD' => 'Tingkat Pengangguran Terbuka
Pertumbuhan UMKM/IKM',
        'BASELINE IK SASARAN RPJMD' => '5,58
2,17',
        'TARGET IK SASARAN RPJMD' => '5
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Pengembangan Kapasitas Daya Saing Kepemudaan',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Daya Saing Kepemudaan',
        'IK PROGRAM' => 'Persentase Pengusaha Pemula Muda',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '75',
        'SATUAN IK PROGRAM' => 'Rasio',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
    ],
    23 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Ketersediaan Lapangan Pekerjaan',
        'IK SASARAN RPJMD' => 'Tingkat Pengangguran Terbuka
Pertumbuhan UMKM/IKM',
        'BASELINE IK SASARAN RPJMD' => '5,58
2,17',
        'TARGET IK SASARAN RPJMD' => '5
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Penempatan Tenaga Kerja',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Penempatan Tenaga Kerja',
        'IK PROGRAM' => 'Persentase Pencari Kerja yang Terdaftar dan Mendapatkan Pekerjaan',
        'BASELINE IK PROGRAM' => '18,4',
        'TARGET IK PROGRAM' => '27',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA',
    ],
    24 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Produksi serta Nilai Tambah Produk/Komoditi',
        'IK SASARAN RPJMD' => 'Jumlah Pelaku Ekonomi Kreatif
Kontribusi PDRB Industri Pengolahan',
        'BASELINE IK SASARAN RPJMD' => '10
1,81',
        'TARGET IK SASARAN RPJMD' => '46
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Orang
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Hubungan Industrial',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Pekerja',
        'IK PROGRAM' => 'Persentase Penyelesaian Masalah Ketenagakerjaan',
        'BASELINE IK PROGRAM' => '76,92',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA',
    ],
    25 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Produksi serta Nilai Tambah Produk/Komoditi',
        'IK SASARAN RPJMD' => 'Jumlah Pelaku Ekonomi Kreatif
Kontribusi PDRB Industri Pengolahan',
        'BASELINE IK SASARAN RPJMD' => '10
1,81',
        'TARGET IK SASARAN RPJMD' => '46
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Orang
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Pengembangan Iklim Penanaman Modal',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kemudahan Berinvestasi',
        'IK PROGRAM' => 'Nilai Rencana Investasi',
        'BASELINE IK PROGRAM' => '1616',
        'TARGET IK PROGRAM' => '530',
        'SATUAN IK PROGRAM' => 'Rupiah (Milyar)',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU',
    ],
    26 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Produksi serta Nilai Tambah Produk/Komoditi',
        'IK SASARAN RPJMD' => 'Jumlah Pelaku Ekonomi Kreatif
Kontribusi PDRB Industri Pengolahan',
        'BASELINE IK SASARAN RPJMD' => '10
1,81',
        'TARGET IK SASARAN RPJMD' => '46
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Orang
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Promosi Penanaman Modal',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Jangkauan Promosi Penanaman Modal',
        'IK PROGRAM' => 'Jumlah Investor Berskala Nasional (PMDN/PMA)',
        'BASELINE IK PROGRAM' => '4',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Perusahaan',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU',
    ],
    27 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Produksi serta Nilai Tambah Produk/Komoditi',
        'IK SASARAN RPJMD' => 'Jumlah Pelaku Ekonomi Kreatif
Kontribusi PDRB Industri Pengolahan',
        'BASELINE IK SASARAN RPJMD' => '10
1,81',
        'TARGET IK SASARAN RPJMD' => '46
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Orang
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Administrasi Pemerintahan Desa',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Pembinaan dan Pengawasan Pemerintahan Desa',
        'IK PROGRAM' => 'Persentase Aparatur Desa dan Anggota BPD yang ditingkatkan Kapasitasnya',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '50',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
    ],
    28 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Produksi serta Nilai Tambah Produk/Komoditi',
        'IK SASARAN RPJMD' => 'Jumlah Pelaku Ekonomi Kreatif
Kontribusi PDRB Industri Pengolahan',
        'BASELINE IK SASARAN RPJMD' => '10
1,81',
        'TARGET IK SASARAN RPJMD' => '46
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Orang
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Pengembangan Ekonomi Kreatif Melalui Pemanfaatan dan Perlindungan Hak Kekayaan Intelektual',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Ekosistem Kreatif',
        'IK PROGRAM' => 'Persentase Ekonomi Kreatif yang Memiliki kekayaan Intelektual',
        'BASELINE IK PROGRAM' => '1,00',
        'SATUAN IK PROGRAM' => 'Persen',
    ],
    29 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Produksi serta Nilai Tambah Produk/Komoditi',
        'IK SASARAN RPJMD' => 'Jumlah Pelaku Ekonomi Kreatif
Kontribusi PDRB Industri Pengolahan',
        'BASELINE IK SASARAN RPJMD' => '10
1,81',
        'TARGET IK SASARAN RPJMD' => '46
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Orang
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Pelayanan Izin Usaha Simpan Pinjam',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Izin Usaha Simpan Pinjam',
    ],
    30 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Produksi serta Nilai Tambah Produk/Komoditi',
        'IK SASARAN RPJMD' => 'Jumlah Pelaku Ekonomi Kreatif
Kontribusi PDRB Industri Pengolahan',
        'BASELINE IK SASARAN RPJMD' => '10
1,81',
        'TARGET IK SASARAN RPJMD' => '46
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Orang
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Pendidikan dan Latihan Perkoperasian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas SDM Perkoperasian',
        'IK PROGRAM' => 'Persentase yang Melaksanakan Rapat Anggota Tahunan (RAT) Tepat Waktu',
        'BASELINE IK PROGRAM' => '9,41',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    31 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Produksi serta Nilai Tambah Produk/Komoditi',
        'IK SASARAN RPJMD' => 'Jumlah Pelaku Ekonomi Kreatif
Kontribusi PDRB Industri Pengolahan',
        'BASELINE IK SASARAN RPJMD' => '10
1,81',
        'TARGET IK SASARAN RPJMD' => '46
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Orang
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan dan Perlindungan Koperasi',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Produktivitas Koperasi',
        'IK PROGRAM' => 'Persentase Rumah Tangga Miskin yang Bergabung dalam Koperasi',
        'BASELINE IK PROGRAM' => '0',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    32 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Mewujudkan Stabilitas Ekonomi',
        'IK SASARAN RPJMD' => 'Inflasi',
        'BASELINE IK SASARAN RPJMD' => '3,29',
        'TARGET IK SASARAN RPJMD' => '2,5-3,5',
        'SATUAN IK SASARAN RPJMD' => 'Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    33 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Tata Kelola Pemerintahan yang Bersih, Akuntabel dan Transparan',
        'IK TUJUAN RPJMD' => 'Indeks Pengelolaan Keuangan Daerah
Indeks Survey Penilaian Integritas (SPI)
Indeks Reformasi Hukum
Indeks Reformasi Birokrasi',
        'BASELINE IK TUJUAN RPJMD' => '83,3
69,23
55,99
B',
        'TARGET IK TUJUAN RPJMD' => '89
75
58,48
A',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Indeks
Indeks',
        'OPD IK TUJUAN RPJMD' => 'BADAN PENGELOLAAN KEUANGAN DAERAH
INSPEKTORAT
SEKRETARIAT DAERAH
SEKRETARIAT DAERAH',
        'SASARAN RPJMD' => 'Meningkatnya Tranparansi Pengelolaan Anggaran',
        'IK SASARAN RPJMD' => 'Opini BPK
Indeks Pencegahan Korupsi MCP',
        'BASELINE IK SASARAN RPJMD' => 'N/A
88,52',
        'TARGET IK SASARAN RPJMD' => 'WTP
90',
        'SATUAN IK SASARAN RPJMD' => 'Opini
Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENGELOLAAN KEUANGAN DAERAH
INSPEKTORAT',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'BASELINE IK PROGRAM' => 'B',
        'TARGET IK PROGRAM' => 'B',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT DAERAH',
    ],
    34 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Tata Kelola Pemerintahan yang Bersih, Akuntabel dan Transparan',
        'IK TUJUAN RPJMD' => 'Indeks Pengelolaan Keuangan Daerah
Indeks Survey Penilaian Integritas (SPI)
Indeks Reformasi Hukum
Indeks Reformasi Birokrasi',
        'BASELINE IK TUJUAN RPJMD' => '83,3
69,23
55,99
B',
        'TARGET IK TUJUAN RPJMD' => '89
75
58,48
A',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Indeks
Indeks',
        'OPD IK TUJUAN RPJMD' => 'BADAN PENGELOLAAN KEUANGAN DAERAH
INSPEKTORAT
SEKRETARIAT DAERAH
SEKRETARIAT DAERAH',
        'SASARAN RPJMD' => 'Meningkatnya Kualitas Perencanaan Pembangunan',
        'IK SASARAN RPJMD' => 'Tingkat Partisipasi Masyarakat dalam Pembangunan',
        'BASELINE IK SASARAN RPJMD' => '100',
        'TARGET IK SASARAN RPJMD' => '100',
        'SATUAN IK SASARAN RPJMD' => 'Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Statistik Sektoral',
        'OUTCOME PROGRAM PRIORITAS' => 'Tercapainya Kolaborasi, Integrasi, dan Standardisasi Dalam Penyelenggaraan Sistem Statistik Nasional (SSN)',
        'IK PROGRAM' => 'Indeks Pembangunan Statistik',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '3',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN',
    ],
    35 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Tata Kelola Pemerintahan yang Profesional dan Melayani',
        'IK TUJUAN RPJMD' => 'Indeks Pelayanan Publik
Indeks Daya Saing Daerah (IDSD)',
        'BASELINE IK TUJUAN RPJMD' => '4,14
3,04',
        'TARGET IK TUJUAN RPJMD' => '4,36
3,54',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks',
        'OPD IK TUJUAN RPJMD' => 'SEKRETARIAT DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas ASN',
        'IK SASARAN RPJMD' => 'Indeks Profesionalitas ASN',
        'BASELINE IK SASARAN RPJMD' => '71,93',
        'TARGET IK SASARAN RPJMD' => '72,95',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
        'PROGRAM PRIORITAS' => 'Program Pengembangan Sumber Daya Manusia',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Layanan Pengembangan Kompetensi Dasar, Kader, Manajerial dan Fungsional',
        'IK PROGRAM' => 'Persentase ASN yang Mendapatkan Pengembangan Kompetensi Dasar, Manajerial dan Fungsional',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '25',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
    ],
    36 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Tata Kelola Pemerintahan yang Profesional dan Melayani',
        'IK TUJUAN RPJMD' => 'Indeks Pelayanan Publik
Indeks Daya Saing Daerah (IDSD)',
        'BASELINE IK TUJUAN RPJMD' => '4,14
3,04',
        'TARGET IK TUJUAN RPJMD' => '4,36
3,54',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks',
        'OPD IK TUJUAN RPJMD' => 'SEKRETARIAT DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas ASN',
        'IK SASARAN RPJMD' => 'Indeks Profesionalitas ASN',
        'BASELINE IK SASARAN RPJMD' => '71,93',
        'TARGET IK SASARAN RPJMD' => '72,95',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
        'PROGRAM PRIORITAS' => 'Program Kepegawaian Daerah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Administrasi Kepegawaian',
        'IK PROGRAM' => 'Persentase Perencanaan Kebutuhan yang Sesuai dengan Formasi',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
    ],
    37 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Tata Kelola Pemerintahan yang Profesional dan Melayani',
        'IK TUJUAN RPJMD' => 'Indeks Pelayanan Publik
Indeks Daya Saing Daerah (IDSD)',
        'BASELINE IK TUJUAN RPJMD' => '4,14
3,04',
        'TARGET IK TUJUAN RPJMD' => '4,36
3,54',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks',
        'OPD IK TUJUAN RPJMD' => 'SEKRETARIAT DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas ASN',
        'IK SASARAN RPJMD' => 'Indeks Profesionalitas ASN',
        'BASELINE IK SASARAN RPJMD' => '71,93',
        'TARGET IK SASARAN RPJMD' => '72,95',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
        'PROGRAM PRIORITAS' => 'Program Kepegawaian Daerah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Pengembamngan Kompetensi ASN',
        'IK PROGRAM' => 'Persentase Perencanaan Kebutuhan yang Sesuai dengan Formasi',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
    ],
    38 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Tata Kelola Pemerintahan yang Profesional dan Melayani',
        'IK TUJUAN RPJMD' => 'Indeks Pelayanan Publik
Indeks Daya Saing Daerah (IDSD)',
        'BASELINE IK TUJUAN RPJMD' => '4,14
3,04',
        'TARGET IK TUJUAN RPJMD' => '4,36
3,54',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks',
        'OPD IK TUJUAN RPJMD' => 'SEKRETARIAT DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas ASN',
        'IK SASARAN RPJMD' => 'Indeks Profesionalitas ASN',
        'BASELINE IK SASARAN RPJMD' => '71,93',
        'TARGET IK SASARAN RPJMD' => '72,95',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
        'PROGRAM PRIORITAS' => 'Program Kepegawaian Daerah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Tata Kelola Pengembangan Karir ASN',
        'IK PROGRAM' => 'Persentase Perencanaan Kebutuhan yang Sesuai dengan Formasi',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
    ],
    39 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Tata Kelola Pemerintahan yang Profesional dan Melayani',
        'IK TUJUAN RPJMD' => 'Indeks Pelayanan Publik
Indeks Daya Saing Daerah (IDSD)',
        'BASELINE IK TUJUAN RPJMD' => '4,14
3,04',
        'TARGET IK TUJUAN RPJMD' => '4,36
3,54',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks',
        'OPD IK TUJUAN RPJMD' => 'SEKRETARIAT DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas ASN',
        'IK SASARAN RPJMD' => 'Indeks Profesionalitas ASN',
        'BASELINE IK SASARAN RPJMD' => '71,93',
        'TARGET IK SASARAN RPJMD' => '72,95',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
        'PROGRAM PRIORITAS' => 'Program Kepegawaian Daerah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Penilaian Kinerja ASN',
        'IK PROGRAM' => 'Persentase Perencanaan Kebutuhan yang Sesuai dengan Formasi',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
    ],
    40 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Tata Kelola Pemerintahan yang Profesional dan Melayani',
        'IK TUJUAN RPJMD' => 'Indeks Pelayanan Publik
Indeks Daya Saing Daerah (IDSD)',
        'BASELINE IK TUJUAN RPJMD' => '4,14
3,04',
        'TARGET IK TUJUAN RPJMD' => '4,36
3,54',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks',
        'OPD IK TUJUAN RPJMD' => 'SEKRETARIAT DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Layanan Pemeriintah',
        'IK SASARAN RPJMD' => 'Indeks Kepuasan Masyarakat (IKM)
Indeks SPBE',
        'BASELINE IK SASARAN RPJMD' => '91,81
2,68',
        'TARGET IK SASARAN RPJMD' => '91,91
3',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'SEKRETARIAT DAERAH
DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'BASELINE IK PROGRAM' => 'B',
        'TARGET IK PROGRAM' => 'B',
        'SATUAN IK PROGRAM' => 'Nilai',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT DAERAH',
    ],
    41 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Tata Kelola Pemerintahan yang Profesional dan Melayani',
        'IK TUJUAN RPJMD' => 'Indeks Pelayanan Publik
Indeks Daya Saing Daerah (IDSD)',
        'BASELINE IK TUJUAN RPJMD' => '4,14
3,04',
        'TARGET IK TUJUAN RPJMD' => '4,36
3,54',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks',
        'OPD IK TUJUAN RPJMD' => 'SEKRETARIAT DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Layanan Pemeriintah',
        'IK SASARAN RPJMD' => 'Indeks Kepuasan Masyarakat (IKM)
Indeks SPBE',
        'BASELINE IK SASARAN RPJMD' => '91,81
2,68',
        'TARGET IK SASARAN RPJMD' => '91,91
3',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'SEKRETARIAT DAERAH
DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Aplikasi Informatika',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Pengelolaan Aplikasi Informatika',
        'IK PROGRAM' => 'Persentase Perangkat Daerah yang Menerapkan SPBE',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '93',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN',
    ],
    42 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Tata Kelola Pemerintahan yang Profesional dan Melayani',
        'IK TUJUAN RPJMD' => 'Indeks Pelayanan Publik
Indeks Daya Saing Daerah (IDSD)',
        'BASELINE IK TUJUAN RPJMD' => '4,14
3,04',
        'TARGET IK TUJUAN RPJMD' => '4,36
3,54',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks',
        'OPD IK TUJUAN RPJMD' => 'SEKRETARIAT DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Layanan Pemeriintah',
        'IK SASARAN RPJMD' => 'Indeks Kepuasan Masyarakat (IKM)
Indeks SPBE',
        'BASELINE IK SASARAN RPJMD' => '91,81
2,68',
        'TARGET IK SASARAN RPJMD' => '91,91
3',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'SEKRETARIAT DAERAH
DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Keuangan Daerah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Tata Kelola Anggaran',
        'IK PROGRAM' => 'Persentase Belanja Pegawai di Luar Tunjangan Guru yang Dialokasikan Melalui TKD',
        'BASELINE IK PROGRAM' => '32,66',
        'TARGET IK PROGRAM' => '30',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
    ],
    43 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Tata Kelola Pemerintahan yang Profesional dan Melayani',
        'IK TUJUAN RPJMD' => 'Indeks Pelayanan Publik
Indeks Daya Saing Daerah (IDSD)',
        'BASELINE IK TUJUAN RPJMD' => '4,14
3,04',
        'TARGET IK TUJUAN RPJMD' => '4,36
3,54',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks',
        'OPD IK TUJUAN RPJMD' => 'SEKRETARIAT DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Layanan Pemeriintah',
        'IK SASARAN RPJMD' => 'Indeks Kepuasan Masyarakat (IKM)
Indeks SPBE',
        'BASELINE IK SASARAN RPJMD' => '91,81
2,68',
        'TARGET IK SASARAN RPJMD' => '91,91
3',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'SEKRETARIAT DAERAH
DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN',
        'PROGRAM PRIORITAS' => 'Program Pemerintahan dan Kesejahteraan Rakyat',
        'IK PROGRAM' => 'Kategori Hasil Evaluasi LPPD',
        'BASELINE IK PROGRAM' => '2,66',
        'TARGET IK PROGRAM' => '3,3',
        'SATUAN IK PROGRAM' => 'Kategori',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT DAERAH',
    ],
    44 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Tata Kelola Pemerintahan yang Profesional dan Melayani',
        'IK TUJUAN RPJMD' => 'Indeks Pelayanan Publik
Indeks Daya Saing Daerah (IDSD)',
        'BASELINE IK TUJUAN RPJMD' => '4,14
3,04',
        'TARGET IK TUJUAN RPJMD' => '4,36
3,54',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks',
        'OPD IK TUJUAN RPJMD' => 'SEKRETARIAT DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Inovasi Pelayanan bagi Masyarakat',
        'IK SASARAN RPJMD' => 'Indeks Inovasi Daerah',
        'BASELINE IK SASARAN RPJMD' => '59,19',
        'TARGET IK SASARAN RPJMD' => '70',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
    ],
    45 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Peran Serta Swasta dalam Pembangunan',
        'IK TUJUAN RPJMD' => 'Jumlah Perusahaan Pelaksana CSR',
        'BASELINE IK TUJUAN RPJMD' => '12',
        'TARGET IK TUJUAN RPJMD' => '17',
        'SATUAN IK TUJUAN RPJMD' => 'Perusahaan',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatnya Anggaran Swasta dalam Pembangunan',
        'IK SASARAN RPJMD' => 'Jumlah Anggaran CSR',
        'BASELINE IK SASARAN RPJMD' => '55,33',
        'TARGET IK SASARAN RPJMD' => '53',
        'SATUAN IK SASARAN RPJMD' => 'Milyar Rupiah',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'PROGRAM PRIORITAS' => 'Program Koordinasi dan Sinkronisasi Perencanaan Pembangunan Daerah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Perencanaan Pembangunan Bidang Pemerintahan dan Pembangunan Manusia',
        'IK PROGRAM' => 'Persentase Keselarasan RKPD dengan Renja PD pada Bidang Pemerintahan dan Pembangunan Manusia',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
    ],
    46 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Peran Serta Swasta dalam Pembangunan',
        'IK TUJUAN RPJMD' => 'Jumlah Perusahaan Pelaksana CSR',
        'BASELINE IK TUJUAN RPJMD' => '12',
        'TARGET IK TUJUAN RPJMD' => '17',
        'SATUAN IK TUJUAN RPJMD' => 'Perusahaan',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatnya Anggaran Swasta dalam Pembangunan',
        'IK SASARAN RPJMD' => 'Jumlah Anggaran CSR',
        'BASELINE IK SASARAN RPJMD' => '55,33',
        'TARGET IK SASARAN RPJMD' => '53',
        'SATUAN IK SASARAN RPJMD' => 'Milyar Rupiah',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'PROGRAM PRIORITAS' => 'Program Koordinasi dan Sinkronisasi Perencanaan Pembangunan Daerah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Perencanaan Pembangunan Bidang Infrastruktur dan Kewilayahan',
        'IK PROGRAM' => 'Persentase Keselarasan RKPD dengan Renja PD pada Bidang Pemerintahan dan Pembangunan Manusia',
        'BASELINE IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
    ],
    47 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Peran Serta Swasta dalam Pembangunan',
        'IK TUJUAN RPJMD' => 'Jumlah Perusahaan Pelaksana CSR',
        'BASELINE IK TUJUAN RPJMD' => '12',
        'TARGET IK TUJUAN RPJMD' => '17',
        'SATUAN IK TUJUAN RPJMD' => 'Perusahaan',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatnya Anggaran Swasta dalam Pembangunan',
        'IK SASARAN RPJMD' => 'Jumlah Anggaran CSR',
        'BASELINE IK SASARAN RPJMD' => '55,33',
        'TARGET IK SASARAN RPJMD' => '53',
        'SATUAN IK SASARAN RPJMD' => 'Milyar Rupiah',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'PROGRAM PRIORITAS' => 'Program Koordinasi dan Sinkronisasi Perencanaan Pembangunan Daerah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Perencanaan Pembangunan Bidang Perekonomian dan SDA',
        'IK PROGRAM' => 'Persentase Keselarasan RKPD dengan Renja PD pada Bidang Pemerintahan dan Pembangunan Manusia',
        'BASELINE IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
    ],
    48 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Sinergitas Pembangunan antara Pemerintah Kabupaten dan Pemerintah Gampong',
        'IK TUJUAN RPJMD' => 'Persentase APBG yang Selaras Vengan Visi Misi Bupati
Persentase Desa Mandiri',
        'BASELINE IK TUJUAN RPJMD' => 'N/A
6,521739',
        'TARGET IK TUJUAN RPJMD' => '80
12,42',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG
DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
        'SASARAN RPJMD' => 'Meningkatkan Kesetaraan RKPG dan RKPD',
        'IK SASARAN RPJMD' => 'Persentase Keselarasan Prioritas Pembangunan di Gampong dan di Kabupaten',
        'BASELINE IK SASARAN RPJMD' => 'N/A',
        'TARGET IK SASARAN RPJMD' => '85',
        'SATUAN IK SASARAN RPJMD' => 'Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
        'PROGRAM PRIORITAS' => 'Program Peningkatan Kerja Sama Desa',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Efektivitas Kerja Sama Desa',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
    ],
    49 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Sinergitas Pembangunan antara Pemerintah Kabupaten dan Pemerintah Gampong',
        'IK TUJUAN RPJMD' => 'Persentase APBG yang Selaras Vengan Visi Misi Bupati
Persentase Desa Mandiri',
        'BASELINE IK TUJUAN RPJMD' => 'N/A
6,521739',
        'TARGET IK TUJUAN RPJMD' => '80
12,42',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG
DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
        'SASARAN RPJMD' => 'Meningkatkan Kesetaraan RKPG dan RKPD',
        'IK SASARAN RPJMD' => 'Persentase Keselarasan Prioritas Pembangunan di Gampong dan di Kabupaten',
        'BASELINE IK SASARAN RPJMD' => 'N/A',
        'TARGET IK SASARAN RPJMD' => '85',
        'SATUAN IK SASARAN RPJMD' => 'Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
        'PROGRAM PRIORITAS' => 'Program Administrasi Pemerintahan Desa',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Pembinaan dan Pengawasan Pemerintahan Desa',
        'IK PROGRAM' => 'Persentase Aparatur Desa dan Anggota BPD yang ditingkatkan Kapasitasnya',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '50',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
    ],
    50 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Sinergitas Pembangunan antara Pemerintah Kabupaten dan Pemerintah Gampong',
        'IK TUJUAN RPJMD' => 'Persentase APBG yang Selaras Vengan Visi Misi Bupati
Persentase Desa Mandiri',
        'BASELINE IK TUJUAN RPJMD' => 'N/A
6,521739',
        'TARGET IK TUJUAN RPJMD' => '80
12,42',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG
DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
        'SASARAN RPJMD' => 'Meningkatkan Kesetaraan RKPG dan RKPD',
        'IK SASARAN RPJMD' => 'Persentase Keselarasan Prioritas Pembangunan di Gampong dan di Kabupaten',
        'BASELINE IK SASARAN RPJMD' => 'N/A',
        'TARGET IK SASARAN RPJMD' => '85',
        'SATUAN IK SASARAN RPJMD' => 'Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Keuangan Daerah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Tata Kelola Anggaran',
        'IK PROGRAM' => 'Persentase Belanja Pegawai di Luar Tunjangan Guru yang Dialokasikan Melalui TKD',
        'BASELINE IK PROGRAM' => '32,66',
        'TARGET IK PROGRAM' => '30',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
    ],
    51 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Sinergitas Pembangunan antara Pemerintah Kabupaten dan Pemerintah Gampong',
        'IK TUJUAN RPJMD' => 'Persentase APBG yang Selaras Vengan Visi Misi Bupati
Persentase Desa Mandiri',
        'BASELINE IK TUJUAN RPJMD' => 'N/A
6,521739',
        'TARGET IK TUJUAN RPJMD' => '80
12,42',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG
DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
        'SASARAN RPJMD' => 'Meningkatkan Kesetaraan RKPG dan RKPD',
        'IK SASARAN RPJMD' => 'Persentase Keselarasan Prioritas Pembangunan di Gampong dan di Kabupaten',
        'BASELINE IK SASARAN RPJMD' => 'N/A',
        'TARGET IK SASARAN RPJMD' => '85',
        'SATUAN IK SASARAN RPJMD' => 'Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan Lembaga Kemasyarakatan, Lembaga Adat dan Masyarakat Hukum Adat',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kapasitas Lembaga Kemasyarakatan, Lembaga Adat dan Masyarakat Hukum Adat Dalam Pembangunan',
        'IK PROGRAM' => 'Persentase Fasilitasi Pemberdayaan Lembaga kemasyarakatan Desa',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '50',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
    ],
    52 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Kemandirian Fiskal',
        'IK TUJUAN RPJMD' => 'Indeks Kapasitas Fiskal Daerah',
        'BASELINE IK TUJUAN RPJMD' => '0,936',
        'TARGET IK TUJUAN RPJMD' => '1,036',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Pendapatan Asli Daerah',
        'IK SASARAN RPJMD' => 'Persentase PAD terhadap Total Pendapatan',
        'BASELINE IK SASARAN RPJMD' => '10,85',
        'TARGET IK SASARAN RPJMD' => '17,9',
        'SATUAN IK SASARAN RPJMD' => 'Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Pendapatan Daerah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Upaya Ekstensifikasi dan Intensifikasi Pendapatan',
        'IK PROGRAM' => 'Cakupan Pembinaan dan Pengawasan Pengelolaan Pendapatan',
        'BASELINE IK PROGRAM' => '10,8',
        'TARGET IK PROGRAM' => '13,5',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
    ],
    53 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Kemandirian Fiskal',
        'IK TUJUAN RPJMD' => 'Indeks Kapasitas Fiskal Daerah',
        'BASELINE IK TUJUAN RPJMD' => '0,936',
        'TARGET IK TUJUAN RPJMD' => '1,036',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Pendapatan Asli Daerah',
        'IK SASARAN RPJMD' => 'Persentase PAD terhadap Total Pendapatan',
        'BASELINE IK SASARAN RPJMD' => '10,85',
        'TARGET IK SASARAN RPJMD' => '17,9',
        'SATUAN IK SASARAN RPJMD' => 'Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Pendapatan Daerah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Pengawasan dan Pelaporan',
        'IK PROGRAM' => 'Cakupan Pembinaan dan Pengawasan Pengelolaan Pendapatan',
        'BASELINE IK PROGRAM' => '4',
        'SATUAN IK PROGRAM' => 'Kali',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
    ],
    54 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 2 : Transformasi Tata Kelola Pemerintahan guna Mewujudkan Pemerintahan yang Bersih, Akuntabel, dan Transparan',
        'TUJUAN RPJMD' => 'Terwujudnya Kemandirian Fiskal',
        'IK TUJUAN RPJMD' => 'Indeks Kapasitas Fiskal Daerah',
        'BASELINE IK TUJUAN RPJMD' => '0,936',
        'TARGET IK TUJUAN RPJMD' => '1,036',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Pendapatan Asli Daerah',
        'IK SASARAN RPJMD' => 'Persentase PAD terhadap Total Pendapatan',
        'BASELINE IK SASARAN RPJMD' => '10,85',
        'TARGET IK SASARAN RPJMD' => '17,9',
        'SATUAN IK SASARAN RPJMD' => 'Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Pendapatan Daerah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Penerapan Sistem Informasi Keuangan Berbasis Digital',
        'IK PROGRAM' => 'Cakupan Pembinaan dan Pengawasan Pengelolaan Pendapatan',
        'BASELINE IK PROGRAM' => '4',
        'SATUAN IK PROGRAM' => 'Kali',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
    ],
    55 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 3 : Meningkatkan Implementasi Nilai-nilai Syariat Islam dalam Seluruh Aspek Kehidupan Masyarakat',
        'TUJUAN RPJMD' => 'Terwujudnya Kehidupan Sosial Keagamaan yang Islami',
        'IK TUJUAN RPJMD' => 'Indeks Pembangunan Syariah (IPS)',
        'BASELINE IK TUJUAN RPJMD' => '83,47',
        'TARGET IK TUJUAN RPJMD' => '87,94',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'SASARAN RPJMD' => 'Meningkatkan Fungsi Masjid sebagai Tempat Ibadah dan Kegiatan Keagamaan Lainnya',
        'IK SASARAN RPJMD' => 'Persentase Masjid yang Aktif sesuai dengan Fungsi Masjid',
        'BASELINE IK SASARAN RPJMD' => '75',
        'TARGET IK SASARAN RPJMD' => '85',
        'SATUAN IK SASARAN RPJMD' => 'Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Syariat Islam Aceh',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatkatnya Partisipasi Aktif Masyarakat dalam Kegiatan Keagamaan, Dakwah, dan Pembinaan Syariat Islam',
        'IK PROGRAM' => 'Persentase Masjid yang Melaksanakan Shalat Berjamaah Lima Waktu Secara Rutin',
        'BASELINE IK PROGRAM' => '65',
        'TARGET IK PROGRAM' => '76',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS SYARIAT ISLAM',
    ],
    56 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 3 : Meningkatkan Implementasi Nilai-nilai Syariat Islam dalam Seluruh Aspek Kehidupan Masyarakat',
        'TUJUAN RPJMD' => 'Terwujudnya Kehidupan Sosial Keagamaan yang Islami',
        'IK TUJUAN RPJMD' => 'Indeks Pembangunan Syariah (IPS)',
        'BASELINE IK TUJUAN RPJMD' => '83,47',
        'TARGET IK TUJUAN RPJMD' => '87,94',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS SYARIAT ISLAM',
        'SASARAN RPJMD' => 'Meningkatkan Fungsi Masjid sebagai Tempat Ibadah dan Kegiatan Keagamaan Lainnya',
        'IK SASARAN RPJMD' => 'Persentase Masjid yang Aktif sesuai dengan Fungsi Masjid',
        'BASELINE IK SASARAN RPJMD' => '75',
        'TARGET IK SASARAN RPJMD' => '85',
        'SATUAN IK SASARAN RPJMD' => 'Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS SYARIAT ISLAM',
        'PROGRAM PRIORITAS' => 'Program Administrasi Pemerintahan Desa',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Pembinaan dan Pengawasan Pemerintahan Desa',
        'IK PROGRAM' => 'Persentase Aparatur Desa dan Anggota BPD yang ditingkatkan Kapasitasnya',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '50',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
    ],
    57 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 3 : Meningkatkan Implementasi Nilai-nilai Syariat Islam dalam Seluruh Aspek Kehidupan Masyarakat',
        'TUJUAN RPJMD' => 'Terwujudnya Kehidupan Sosial Keagamaan yang Islami',
        'IK TUJUAN RPJMD' => 'Indeks Pembangunan Syariah (IPS)',
        'BASELINE IK TUJUAN RPJMD' => '83,47',
        'TARGET IK TUJUAN RPJMD' => '87,94',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS SYARIAT ISLAM',
        'SASARAN RPJMD' => 'Meningkatkan Fungsi Masjid sebagai Tempat Ibadah dan Kegiatan Keagamaan Lainnya',
        'IK SASARAN RPJMD' => 'Persentase Masjid yang Aktif sesuai dengan Fungsi Masjid',
        'BASELINE IK SASARAN RPJMD' => '75',
        'TARGET IK SASARAN RPJMD' => '85',
        'SATUAN IK SASARAN RPJMD' => 'Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS SYARIAT ISLAM',
        'PROGRAM PRIORITAS' => 'Program Pendidikan Dayah',
        'OUTCOME PROGRAM PRIORITAS' => 'Peningkatan Manajemen dan Tata Kelola Dayah',
        'IK PROGRAM' => 'Cakupan Dayah Terakreditasi',
        'BASELINE IK PROGRAM' => '56',
        'TARGET IK PROGRAM' => '81,914894',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENDIDIKAN DAYAH',
    ],
    58 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 3 : Meningkatkan Implementasi Nilai-nilai Syariat Islam dalam Seluruh Aspek Kehidupan Masyarakat',
        'TUJUAN RPJMD' => 'Terwujudnya Kehidupan Sosial Keagamaan yang Islami',
        'IK TUJUAN RPJMD' => 'Indeks Pembangunan Syariah (IPS)',
        'BASELINE IK TUJUAN RPJMD' => '83,47',
        'TARGET IK TUJUAN RPJMD' => '87,94',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS SYARIAT ISLAM',
        'SASARAN RPJMD' => 'Meningkatkan Pemahaman Masyarakat',
        'IK SASARAN RPJMD' => 'Persentase Majelis Taklim Gampong yang Aktif',
        'BASELINE IK SASARAN RPJMD' => 'N/A',
        'TARGET IK SASARAN RPJMD' => '90',
        'SATUAN IK SASARAN RPJMD' => 'Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS SYARIAT ISLAM',
    ],
    59 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 3 : Meningkatkan Implementasi Nilai-nilai Syariat Islam dalam Seluruh Aspek Kehidupan Masyarakat',
        'TUJUAN RPJMD' => 'Terwujudnya Kehidupan Sosial Keagamaan yang Islami',
        'IK TUJUAN RPJMD' => 'Indeks Pembangunan Syariah (IPS)',
        'BASELINE IK TUJUAN RPJMD' => '83,47',
        'TARGET IK TUJUAN RPJMD' => '87,94',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS SYARIAT ISLAM',
        'SASARAN RPJMD' => 'Meningkatkan Pemahaman Masyarakat tentang Nilai-nilai Syariat Islam',
        'IK SASARAN RPJMD' => 'Persentase Majelis Taklim Gampong yang Aktif',
        'BASELINE IK SASARAN RPJMD' => 'N/A',
        'TARGET IK SASARAN RPJMD' => '90',
        'SATUAN IK SASARAN RPJMD' => 'Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS SYARIAT ISLAM',
        'PROGRAM PRIORITAS' => 'Program Syariat Islam Aceh',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatkatnya Partisipasi Aktif Masyarakat dalam Kegiatan Keagamaan, Dakwah, dan Pembinaan Syariat Islam',
        'IK PROGRAM' => 'Persentase Masjid yang Melaksanakan Shalat Berjamaah Lima Waktu Secara Rutin',
        'BASELINE IK PROGRAM' => '65',
        'TARGET IK PROGRAM' => '76',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS SYARIAT ISLAM',
    ],
    60 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 3 : Meningkatkan Implementasi Nilai-nilai Syariat Islam dalam Seluruh Aspek Kehidupan Masyarakat',
        'TUJUAN RPJMD' => 'Terwujudnya Sistem Kehidupan yang Menjamin Tumbuh Kembang Generasi masa Depan yang Islami',
        'IK TUJUAN RPJMD' => 'Jumlah Gampong yang Sesuai dengan Syariat Islam',
        'BASELINE IK TUJUAN RPJMD' => '48',
        'TARGET IK TUJUAN RPJMD' => '73',
        'SATUAN IK TUJUAN RPJMD' => 'Jumlah Gampong',
        'OPD IK TUJUAN RPJMD' => 'DINAS SYARIAT ISLAM',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas dan Peran Dayah',
        'IK SASARAN RPJMD' => 'Jumlah Dayah yang Terakreditasi
Jumlah Dayah yang Aktif dalam Kehidupan Sosial Masyarakat',
        'BASELINE IK SASARAN RPJMD' => '53
N/A',
        'TARGET IK SASARAN RPJMD' => '77
10',
        'SATUAN IK SASARAN RPJMD' => 'Unit
Dayah',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PENDIDIKAN DAYAH
DINAS PENDIDIKAN DAYAH',
        'PROGRAM PRIORITAS' => 'Program Pendidikan Dayah',
        'OUTCOME PROGRAM PRIORITAS' => 'Peningkatan Manajemen dan Tata Kelola Dayah',
        'IK PROGRAM' => 'Cakupan Dayah Terakreditasi',
        'BASELINE IK PROGRAM' => '56',
        'TARGET IK PROGRAM' => '81,914894',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENDIDIKAN DAYAH',
    ],
    61 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 3 : Meningkatkan Implementasi Nilai-nilai Syariat Islam dalam Seluruh Aspek Kehidupan Masyarakat',
        'TUJUAN RPJMD' => 'Terwujudnya Sistem Kehidupan yang Menjamin Tumbuh Kembang Generasi masa Depan yang Islami',
        'IK TUJUAN RPJMD' => 'Jumlah Gampong yang Sesuai dengan Syariat Islam',
        'BASELINE IK TUJUAN RPJMD' => '48',
        'TARGET IK TUJUAN RPJMD' => '73',
        'SATUAN IK TUJUAN RPJMD' => 'Jumlah Gampong',
        'OPD IK TUJUAN RPJMD' => 'DINAS SYARIAT ISLAM',
        'SASARAN RPJMD' => 'Menciptakan Lingkungan Sosial Kehidupan Masyarakat yang Islami',
        'IK SASARAN RPJMD' => 'Jumlah Pelanggaran Syariat Islam',
        'BASELINE IK SASARAN RPJMD' => '79',
        'TARGET IK SASARAN RPJMD' => '54',
        'SATUAN IK SASARAN RPJMD' => 'Kasus',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'SATUAN POLISI PAMONG PRAJA DAN WILAYATUL HISBAH',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan Lembaga Kemasyarakatan, Lembaga Adat dan Masyarakat Hukum Adat',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kapasitas Lembaga Kemasyarakatan, Lembaga Adat dan Masyarakat Hukum Adat Dalam Pembangunan',
        'IK PROGRAM' => 'Persentase Fasilitasi Pemberdayaan Lembaga kemasyarakatan Desa',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '50',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
    ],
    62 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 3 : Meningkatkan Implementasi Nilai-nilai Syariat Islam dalam Seluruh Aspek Kehidupan Masyarakat',
        'TUJUAN RPJMD' => 'Terwujudnya Sistem Kehidupan yang Menjamin Tumbuh Kembang Generasi masa Depan yang Islami',
        'IK TUJUAN RPJMD' => 'Jumlah Gampong yang Sesuai dengan Syariat Islam',
        'BASELINE IK TUJUAN RPJMD' => '48',
        'TARGET IK TUJUAN RPJMD' => '73',
        'SATUAN IK TUJUAN RPJMD' => 'Jumlah Gampong',
        'OPD IK TUJUAN RPJMD' => 'DINAS SYARIAT ISLAM',
        'SASARAN RPJMD' => 'Mewujudkan Sumber Daya Manusia di Bidang Keagamaan yang Berdaya Saing',
        'IK SASARAN RPJMD' => 'Jumlah Qori Internasional',
        'BASELINE IK SASARAN RPJMD' => 'N/A',
        'TARGET IK SASARAN RPJMD' => '1',
        'SATUAN IK SASARAN RPJMD' => 'Orang',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS SYARIAT ISLAM',
        'PROGRAM PRIORITAS' => 'Program Syariat Islam Aceh',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatkatnya Partisipasi Aktif Masyarakat dalam Kegiatan Keagamaan, Dakwah, dan Pembinaan Syariat Islam',
        'IK PROGRAM' => 'Persentase Masjid yang Melaksanakan Shalat Berjamaah Lima Waktu Secara Rutin',
        'BASELINE IK PROGRAM' => '65',
        'TARGET IK PROGRAM' => '76',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS SYARIAT ISLAM',
    ],
    63 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 4 : Meningkatkan Pemerataan Pembangunan di Seluruh Wilayah Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Peningkatan Infrastruktur Layanan Dasar',
        'IK TUJUAN RPJMD' => 'Persentase Cakupan Pelayanan Dasar',
        'BASELINE IK TUJUAN RPJMD' => '66,23',
        'TARGET IK TUJUAN RPJMD' => '66,7',
        'SATUAN IK TUJUAN RPJMD' => 'Persen',
        'OPD IK TUJUAN RPJMD' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
        'SASARAN RPJMD' => 'Mengurangi Kawasan Permukiman Kumuh',
        'IK SASARAN RPJMD' => 'Jumlah Kawasan Permukiman Kumuh',
        'BASELINE IK SASARAN RPJMD' => '9',
        'TARGET IK SASARAN RPJMD' => '8',
        'SATUAN IK SASARAN RPJMD' => 'Kawasan',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Jalan',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Aksesibilitas Masyarakat yang Nyaman dan Aman',
        'IK PROGRAM' => 'Persentase Jalan Kabupaten dalam Kondisi Mantap ( > 40 Km/Jam)',
        'BASELINE IK PROGRAM' => '57,83',
        'TARGET IK PROGRAM' => '59,3',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
    ],
    64 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 4 : Meningkatkan Pemerataan Pembangunan di Seluruh Wilayah Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Peningkatan Infrastruktur Layanan Dasar',
        'IK TUJUAN RPJMD' => 'Persentase Cakupan Pelayanan Dasar',
        'BASELINE IK TUJUAN RPJMD' => '66,23',
        'TARGET IK TUJUAN RPJMD' => '66,7',
        'SATUAN IK TUJUAN RPJMD' => 'Persen',
        'OPD IK TUJUAN RPJMD' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
        'SASARAN RPJMD' => 'Mengurangi Kawasan Permukiman Kumuh',
        'IK SASARAN RPJMD' => 'Jumlah Kawasan Permukiman Kumuh',
        'BASELINE IK SASARAN RPJMD' => '9',
        'TARGET IK SASARAN RPJMD' => '8',
        'SATUAN IK SASARAN RPJMD' => 'Kawasan',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan dan Pengembangan Sistem Penyediaan Air Minum',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Akses Masyarakat Terhadap Sistem Penyediaan Air Minum',
        'IK PROGRAM' => 'Proporsi Rumah Tangga dengan Akses Berkelanjutan Terhadap Air Minum Layak, Perkotaan dan Perdesaan',
        'BASELINE IK PROGRAM' => '68,14',
        'TARGET IK PROGRAM' => '73',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
    ],
    65 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 4 : Meningkatkan Pemerataan Pembangunan di Seluruh Wilayah Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Peningkatan Infrastruktur Layanan Dasar',
        'IK TUJUAN RPJMD' => 'Persentase Cakupan Pelayanan Dasar',
        'BASELINE IK TUJUAN RPJMD' => '66,23',
        'TARGET IK TUJUAN RPJMD' => '66,7',
        'SATUAN IK TUJUAN RPJMD' => 'Persen',
        'OPD IK TUJUAN RPJMD' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
        'SASARAN RPJMD' => 'Mengurangi Kawasan Permukiman Kumuh',
        'IK SASARAN RPJMD' => 'Jumlah Kawasan Permukiman Kumuh',
        'BASELINE IK SASARAN RPJMD' => '9',
        'TARGET IK SASARAN RPJMD' => '8',
        'SATUAN IK SASARAN RPJMD' => 'Kawasan',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan dan Pengembangan Sistem Air Limbah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Akses Masyarakat Terhadap Sistem Pengelolaan Air Limbah',
        'IK PROGRAM' => 'Persentase Rumah Tinggal Bersanitasi',
        'BASELINE IK PROGRAM' => '90,36',
        'TARGET IK PROGRAM' => '95',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
    ],
    66 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 4 : Meningkatkan Pemerataan Pembangunan di Seluruh Wilayah Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Peningkatan Infrastruktur Layanan Dasar',
        'IK TUJUAN RPJMD' => 'Persentase Cakupan Pelayanan Dasar',
        'BASELINE IK TUJUAN RPJMD' => '66,23',
        'TARGET IK TUJUAN RPJMD' => '66,7',
        'SATUAN IK TUJUAN RPJMD' => 'Persen',
        'OPD IK TUJUAN RPJMD' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
        'SASARAN RPJMD' => 'Meningkatkan kemitraan dalam Pemenuhan Layanan Dasar',
        'IK SASARAN RPJMD' => 'Jumlah Kerjasama Pemerintah dengan Badan Usaha (KPBU)',
        'BASELINE IK SASARAN RPJMD' => 'N/A',
        'TARGET IK SASARAN RPJMD' => '1',
        'SATUAN IK SASARAN RPJMD' => 'KPBU',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'SEKRETARIAT DAERAH',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan dan Pengembangan Sistem Drainase',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Sistem Drainase Perkotaan',
        'IK PROGRAM' => 'Persentase Drainase Perkotaan dalam Kondisi Baik/ Pembuangan Aliran Air Tidak Tersumbat',
        'BASELINE IK PROGRAM' => '87',
        'TARGET IK PROGRAM' => '91',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
    ],
    67 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 4 : Meningkatkan Pemerataan Pembangunan di Seluruh Wilayah Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Peningkatan Infrastruktur Layanan Dasar',
        'IK TUJUAN RPJMD' => 'Persentase Cakupan Pelayanan Dasar',
        'BASELINE IK TUJUAN RPJMD' => '66,23',
        'TARGET IK TUJUAN RPJMD' => '66,7',
        'SATUAN IK TUJUAN RPJMD' => 'Persen',
        'OPD IK TUJUAN RPJMD' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
        'SASARAN RPJMD' => 'Meningkatkan kemitraan dalam Pemenuhan Layanan Dasar',
        'IK SASARAN RPJMD' => 'Jumlah Kerjasama Pemerintah dengan Badan Usaha (KPBU)',
        'BASELINE IK SASARAN RPJMD' => 'N/A',
        'TARGET IK SASARAN RPJMD' => '1',
        'SATUAN IK SASARAN RPJMD' => 'KPBU',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'SEKRETARIAT DAERAH',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Sumber Daya Air (SDA)',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Perlindungan Masyarakat Terhadap Banjir dan Meningkatnya Akses Masyarakat Terhadap Irigasi',
        'IK PROGRAM' => 'Persentase Irigasi Kabupaten dalam Kondisi Baik',
        'BASELINE IK PROGRAM' => '0',
        'TARGET IK PROGRAM' => '0',
        'SATUAN IK PROGRAM' => 'Hektar',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
    ],
    68 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 4 : Meningkatkan Pemerataan Pembangunan di Seluruh Wilayah Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Peningkatan Infrastruktur Layanan Dasar',
        'IK TUJUAN RPJMD' => 'Persentase Cakupan Pelayanan Dasar',
        'BASELINE IK TUJUAN RPJMD' => '66,23',
        'TARGET IK TUJUAN RPJMD' => '66,7',
        'SATUAN IK TUJUAN RPJMD' => 'Persen',
        'OPD IK TUJUAN RPJMD' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
        'SASARAN RPJMD' => 'Tersedianya Infrastruktur Layanan Perkotaan',
        'IK SASARAN RPJMD' => 'Jumlah Panjang Ruas Jalan yang Memiliki Lampu Penerangan
Jumlah Panjang Ruas Jalan yang Memiliki Pedestrian',
        'BASELINE IK SASARAN RPJMD' => 'N/A
0,9',
        'TARGET IK SASARAN RPJMD' => '3
0,75',
        'SATUAN IK SASARAN RPJMD' => 'KM
KM',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN
DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan dan Pengembangan Sistem Penyediaan Air Minum',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Akses Masyarakat Terhadap Sistem Penyediaan Air Minum',
        'IK PROGRAM' => 'Proporsi Rumah Tangga dengan Akses Berkelanjutan Terhadap Air Minum Layak, Perkotaan dan Perdesaan',
        'BASELINE IK PROGRAM' => '68,14',
        'TARGET IK PROGRAM' => '73',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
    ],
    69 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 4 : Meningkatkan Pemerataan Pembangunan di Seluruh Wilayah Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Peningkatan Infrastruktur Layanan Dasar',
        'IK TUJUAN RPJMD' => 'Persentase Cakupan Pelayanan Dasar',
        'BASELINE IK TUJUAN RPJMD' => '66,23',
        'TARGET IK TUJUAN RPJMD' => '66,7',
        'SATUAN IK TUJUAN RPJMD' => 'Persen',
        'OPD IK TUJUAN RPJMD' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
        'SASARAN RPJMD' => 'Tersedianya Infrastruktur Layanan Perkotaan',
        'IK SASARAN RPJMD' => 'Jumlah Panjang Ruas Jalan yang Memiliki Lampu Penerangan
Jumlah Panjang Ruas Jalan yang Memiliki Pedestrian',
        'BASELINE IK SASARAN RPJMD' => 'N/A
0,9',
        'TARGET IK SASARAN RPJMD' => '3
0,75',
        'SATUAN IK SASARAN RPJMD' => 'KM
KM',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN
DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
        'PROGRAM PRIORITAS' => 'Program Peningkatan Prasarana, Sarana dan Utilitas Umum (PSU)',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Penyediaan PSU Permukiman',
        'IK PROGRAM' => 'Persentase Permukiman dengan PSU Baik',
        'BASELINE IK PROGRAM' => '45',
        'TARGET IK PROGRAM' => '49',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN',
    ],
    70 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 4 : Meningkatkan Pemerataan Pembangunan di Seluruh Wilayah Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Peningkatan Infrastruktur Pendukung Perekonomian',
        'IK TUJUAN RPJMD' => 'Persentase Cakupan Pelayanan Irigasi Lhok Guci',
        'BASELINE IK TUJUAN RPJMD' => '14',
        'TARGET IK TUJUAN RPJMD' => '15',
        'SATUAN IK TUJUAN RPJMD' => 'Persen',
        'OPD IK TUJUAN RPJMD' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
        'SASARAN RPJMD' => 'Meningkatkan Jaringan irigasi untuk Sumber Daya Air Pertanian',
        'IK SASARAN RPJMD' => 'Indeks Luas Areal (IA)',
        'BASELINE IK SASARAN RPJMD' => '0,291',
        'TARGET IK SASARAN RPJMD' => '0,299',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Sumber Daya Air (SDA)',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Perlindungan Masyarakat Terhadap Banjir dan Meningkatnya Akses Masyarakat Terhadap Irigasi',
        'IK PROGRAM' => 'Persentase Irigasi Kabupaten dalam Kondisi Baik',
        'BASELINE IK PROGRAM' => '0',
        'TARGET IK PROGRAM' => '0',
        'SATUAN IK PROGRAM' => 'Hektar',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
    ],
    71 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Pemanfaatan Lahan untuk Pengembangan Sumber Daya Alam yang Mendukung Perekonomian Masyarakat',
        'IK SASARAN RPJMD' => 'Jumlah Lahan yang Dimanfaatkan untuk Persawahan/Perkebunan/Pengembalaan/Budidaya Perairan',
        'BASELINE IK SASARAN RPJMD' => '82298,22',
        'TARGET IK SASARAN RPJMD' => '82800',
        'SATUAN IK SASARAN RPJMD' => 'Ha',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'PROGRAM PRIORITAS' => 'Program Penyuluhan Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kapasitas SDM Bidang Penyuluhan Pertanian',
        'IK PROGRAM' => 'Jumlah Variasi Komoditi Pertanian',
        'BASELINE IK PROGRAM' => '19',
        'TARGET IK PROGRAM' => '23',
        'SATUAN IK PROGRAM' => 'Komoditi',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
    ],
    72 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Diversifikasi Produk Pertanian',
        'IK SASARAN RPJMD' => 'Jumlah Variasi Komoditi Pertanian',
        'BASELINE IK SASARAN RPJMD' => '19',
        'TARGET IK SASARAN RPJMD' => '24',
        'SATUAN IK SASARAN RPJMD' => 'Komoditi',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'PROGRAM PRIORITAS' => 'Program Penyuluhan Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kapasitas SDM Bidang Penyuluhan Pertanian',
        'IK PROGRAM' => 'Jumlah Variasi Komoditi Pertanian',
        'BASELINE IK PROGRAM' => '19',
        'TARGET IK PROGRAM' => '23',
        'SATUAN IK PROGRAM' => 'Komoditi',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
    ],
    73 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Kesejahteraan Petani dan Nelayan serta Mendorong Hilirisasi Komoditi Pertanian',
        'IK SASARAN RPJMD' => 'NTP
NTN
Jumlah Produk Industri Hilir Komoditi Pertanian/Perikanan/Perkebunan/Peternakan yang Dikembangkan',
        'BASELINE IK SASARAN RPJMD' => '119,25
104,75
N/A',
        'TARGET IK SASARAN RPJMD' => '124
107,1
2',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks
Produk',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Pengolahan dan Pemasaran Hasil Perikanan',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Konsumsi Ikan oleh Masyarakat',
        'IK PROGRAM' => 'Jumlah Industri Perikanan yang Mendapatkan Kerjasama Pemasaran',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '6',
        'SATUAN IK PROGRAM' => 'unit usaha',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KELAUTAN DAN PERIKANAN',
    ],
    74 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Kesejahteraan Petani dan Nelayan serta Mendorong Hilirisasi Komoditi Pertanian',
        'IK SASARAN RPJMD' => 'NTP
NTN
Jumlah Produk Industri Hilir Komoditi Pertanian/Perikanan/Perkebunan/Peternakan yang Dikembangkan',
        'BASELINE IK SASARAN RPJMD' => '119,25
104,75
N/A',
        'TARGET IK SASARAN RPJMD' => '124
107,1
2',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks
Produk',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Perencanaan dan Pembangunan Industri',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Realisasi Pembangunan Industri',
        'IK PROGRAM' => 'Rata-rata Peningkatan Pendapatan IKM Hilir',
        'BASELINE IK PROGRAM' => '5',
        'TARGET IK PROGRAM' => '7,5-8',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    75 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Kesejahteraan Petani dan Nelayan serta Mendorong Hilirisasi Komoditi Pertanian',
        'IK SASARAN RPJMD' => 'NTP
NTN
Jumlah Produk Industri Hilir Komoditi Pertanian/Perikanan/Perkebunan/Peternakan yang Dikembangkan',
        'BASELINE IK SASARAN RPJMD' => '119,25
104,75
N/A',
        'TARGET IK SASARAN RPJMD' => '124
107,1
2',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks
Produk',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Perikanan Tangkap',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Produksi Perikanan Tangkap',
        'IK PROGRAM' => 'Produksi Perikanan Kelompok Nelayan',
        'BASELINE IK PROGRAM' => '20105201',
        'TARGET IK PROGRAM' => '20450',
        'SATUAN IK PROGRAM' => 'Ton',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KELAUTAN DAN PERIKANAN',
    ],
    76 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Ketahanan Pangan Daerah',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Pangan (IKP)',
        'BASELINE IK SASARAN RPJMD' => '78,27',
        'TARGET IK SASARAN RPJMD' => '79,7',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PANGAN',
        'PROGRAM PRIORITAS' => 'Program Penyediaan dan Pengembangan Sarana Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Distribusi dan Kualitas Sarana Pertanian',
        'IK PROGRAM' => 'Produktivitas Padi',
        'BASELINE IK PROGRAM' => '6,3',
        'TARGET IK PROGRAM' => '7,1',
        'SATUAN IK PROGRAM' => 'Ton/Ha',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
    ],
    77 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Ketahanan Pangan Daerah',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Pangan (IKP)',
        'BASELINE IK SASARAN RPJMD' => '78,27',
        'TARGET IK SASARAN RPJMD' => '79,7',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PANGAN',
        'PROGRAM PRIORITAS' => 'Program Penyediaan dan Pengembangan Prasarana Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Distribusi dan Kualitas Prasarana Pertanian',
        'IK PROGRAM' => 'Jumlah Lahan yang Dimanfaatkan untuk Persawahan',
        'BASELINE IK PROGRAM' => '82298,22',
        'TARGET IK PROGRAM' => '82900',
        'SATUAN IK PROGRAM' => 'Ha',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
    ],
    78 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Ketahanan Pangan Daerah',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Pangan (IKP)',
        'BASELINE IK SASARAN RPJMD' => '78,27',
        'TARGET IK SASARAN RPJMD' => '79,7',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PANGAN',
        'PROGRAM PRIORITAS' => 'Program Pengendalian dan Penanggulangan Bencana Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Pengendalian dan Penanggulangan Bencana Pertanian',
        'IK PROGRAM' => 'Luas Panen Pertanian',
        'BASELINE IK PROGRAM' => '14026,16',
        'TARGET IK PROGRAM' => '16500',
        'SATUAN IK PROGRAM' => 'Ha',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
    ],
    79 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Ketahanan Pangan Daerah',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Pangan (IKP)',
        'BASELINE IK SASARAN RPJMD' => '78,27',
        'TARGET IK SASARAN RPJMD' => '79,7',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PANGAN',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Perikanan Tangkap',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Produksi Perikanan Tangkap',
        'IK PROGRAM' => 'Produksi Perikanan Kelompok Nelayan',
        'BASELINE IK PROGRAM' => '20105201',
        'TARGET IK PROGRAM' => '20450',
        'SATUAN IK PROGRAM' => 'Ton',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KELAUTAN DAN PERIKANAN',
    ],
    80 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Ketahanan Pangan Daerah',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Pangan (IKP)',
        'BASELINE IK SASARAN RPJMD' => '78,27',
        'TARGET IK SASARAN RPJMD' => '79,7',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PANGAN',
        'PROGRAM PRIORITAS' => 'Program Pengolahan dan Pemasaran Hasil Perikanan',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Konsumsi Ikan oleh Masyarakat',
        'IK PROGRAM' => 'Jumlah Industri Perikanan yang Mendapatkan Kerjasama Pemasaran',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '6',
        'SATUAN IK PROGRAM' => 'unit usaha',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KELAUTAN DAN PERIKANAN',
    ],
    81 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Ketahanan Pangan Daerah',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Pangan (IKP)',
        'BASELINE IK SASARAN RPJMD' => '78,27',
        'TARGET IK SASARAN RPJMD' => '79,7',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PANGAN',
        'PROGRAM PRIORITAS' => 'Program Perencanaan dan Pembangunan Industri',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Realisasi Pembangunan Industri',
        'IK PROGRAM' => 'Rata-rata Peningkatan Pendapatan IKM Hilir',
        'BASELINE IK PROGRAM' => '5',
        'TARGET IK PROGRAM' => '7,5-8',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    82 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Ketahanan Pangan Daerah',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Pangan (IKP)',
        'BASELINE IK SASARAN RPJMD' => '78,27',
        'TARGET IK SASARAN RPJMD' => '79,7',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PANGAN',
        'PROGRAM PRIORITAS' => 'Program Pengembangan UMKM',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Daya Saing UMKM',
        'IK PROGRAM' => 'Persentase Usaha Mikro Menjadi Usaha kecil dan Menengah',
        'BASELINE IK PROGRAM' => '5,98',
        'TARGET IK PROGRAM' => '5',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    83 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Ketahanan Pangan Daerah',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Pangan (IKP)',
        'BASELINE IK SASARAN RPJMD' => '78,27',
        'TARGET IK SASARAN RPJMD' => '79,7',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PANGAN',
        'PROGRAM PRIORITAS' => 'Program Pelayanan Izin Usaha Simpan Pinjam',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Izin Usaha Simpan Pinjam',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    84 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Ketahanan Pangan Daerah',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Pangan (IKP)',
        'BASELINE IK SASARAN RPJMD' => '78,27',
        'TARGET IK SASARAN RPJMD' => '79,7',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PANGAN',
        'PROGRAM PRIORITAS' => 'Program Pendidikan dan Latihan Perkoperasian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas SDM Perkoperasian',
        'IK PROGRAM' => 'Persentase yang Melaksanakan Rapat Anggota Tahunan (RAT) Tepat Waktu',
        'BASELINE IK PROGRAM' => '9,41',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    85 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Ketahanan Pangan Daerah',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Pangan (IKP)',
        'BASELINE IK SASARAN RPJMD' => '78,27',
        'TARGET IK SASARAN RPJMD' => '79,7',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PANGAN',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan dan Perlindungan Koperasi',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Daya Saing UMKM',
        'IK PROGRAM' => 'Persentase Rumah Tangga Miskin yang Bergabung dalam Koperasi',
        'BASELINE IK PROGRAM' => '0',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    86 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Kepastian Keleslestarian Lingkungan Hidup',
        'IK TUJUAN RPJMD' => 'Indeks Kualitas Lingkungan Hidup',
        'BASELINE IK TUJUAN RPJMD' => '76,72',
        'TARGET IK TUJUAN RPJMD' => '77,8',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS LINGKUNGAN HIDUP',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Lingkungan dan Ketahanan terhadap Bencana',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Daerah
Indeks Kualitas Lahan
Indeks Risiko Bencana (IRB)
Jumlah Desa yang Melakukan Pengolahan Sampah Berbasis Reduce, Reuse, Recycle, Refused, dan Rot (5R)',
        'BASELINE IK SASARAN RPJMD' => '0,45
62,69
173,76
N/A',
        'TARGET IK SASARAN RPJMD' => '0,59
79,8
128,6
1',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks
Indeks
Desa',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP
BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP',
        'PROGRAM PRIORITAS' => 'Program Perencanaan Lingkungan Hidup',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Evektifitas Kajian Lingkungan Hdiup Memitigasi Dampak KRP',
        'IK PROGRAM' => 'Persentase Implementasi kebijakan Lingkungan Hidup',
        'BASELINE IK PROGRAM' => '63',
        'TARGET IK PROGRAM' => '71',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS LINGKUNGAN HIDUP',
    ],
    87 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Kepastian Keleslestarian Lingkungan Hidup',
        'IK TUJUAN RPJMD' => 'Indeks Kualitas Lingkungan Hidup',
        'BASELINE IK TUJUAN RPJMD' => '76,72',
        'TARGET IK TUJUAN RPJMD' => '77,8',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS LINGKUNGAN HIDUP',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Lingkungan dan Ketahanan terhadap Bencana',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Daerah
Indeks Kualitas Lahan
Indeks Risiko Bencana (IRB)
Jumlah Desa yang Melakukan Pengolahan Sampah Berbasis Reduce, Reuse, Recycle, Refused, dan Rot (5R)',
        'BASELINE IK SASARAN RPJMD' => '0,45
62,69
173,76
N/A',
        'TARGET IK SASARAN RPJMD' => '0,59
79,8
128,6
1',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks
Indeks
Desa',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP
BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP',
        'PROGRAM PRIORITAS' => 'Program Pengendalian Pencemaran dan/Atau Kerusakan Lingkungan Hidup',
        'OUTCOME PROGRAM PRIORITAS' => 'Menurunnya Pencemaran dan/atau Kerusakan Lingkungan Hidup',
        'IK PROGRAM' => 'Persentase Penanganan Pencemaran Lingkungan',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS LINGKUNGAN HIDUP',
    ],
    88 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Kepastian Keleslestarian Lingkungan Hidup',
        'IK TUJUAN RPJMD' => 'Indeks Kualitas Lingkungan Hidup',
        'BASELINE IK TUJUAN RPJMD' => '76,72',
        'TARGET IK TUJUAN RPJMD' => '77,8',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS LINGKUNGAN HIDUP',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Lingkungan dan Ketahanan terhadap Bencana',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Daerah
Indeks Kualitas Lahan
Indeks Risiko Bencana (IRB)
Jumlah Desa yang Melakukan Pengolahan Sampah Berbasis Reduce, Reuse, Recycle, Refused, dan Rot (5R)',
        'BASELINE IK SASARAN RPJMD' => '0,45
62,69
173,76
N/A',
        'TARGET IK SASARAN RPJMD' => '0,59
79,8
128,6
1',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks
Indeks
Desa',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP
BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Keanekaragaman Hayati (Kehati)',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Pengelolaan Keanekaragaman Hayati',
        'IK PROGRAM' => 'Jumlah Kawasan kehati yang Terkelola',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kawasan',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS LINGKUNGAN HIDUP',
    ],
    89 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Kepastian Keleslestarian Lingkungan Hidup',
        'IK TUJUAN RPJMD' => 'Indeks Kualitas Lingkungan Hidup',
        'BASELINE IK TUJUAN RPJMD' => '76,72',
        'TARGET IK TUJUAN RPJMD' => '77,8',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS LINGKUNGAN HIDUP',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Lingkungan dan Ketahanan terhadap Bencana',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Daerah
Indeks Kualitas Lahan
Indeks Risiko Bencana (IRB)
Jumlah Desa yang Melakukan Pengolahan Sampah Berbasis Reduce, Reuse, Recycle, Refused, dan Rot (5R)',
        'BASELINE IK SASARAN RPJMD' => '0,45
62,69
173,76
N/A',
        'TARGET IK SASARAN RPJMD' => '0,59
79,8
128,6
1',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks
Indeks
Desa',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP
BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP',
        'PROGRAM PRIORITAS' => 'Program Pengendalian Bahan Berbahaya dan Beracun (B3) dan Limbah Bahan Berbahaya dan Beracun (Limbah B3)',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Penanganan Bahan Berbahaya dan Beracun (B3) dan Limbah Bahan Berbahaya dan Beracun (Limbah B3)',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS LINGKUNGAN HIDUP',
    ],
    90 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Kepastian Keleslestarian Lingkungan Hidup',
        'IK TUJUAN RPJMD' => 'Indeks Kualitas Lingkungan Hidup',
        'BASELINE IK TUJUAN RPJMD' => '76,72',
        'TARGET IK TUJUAN RPJMD' => '77,8',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS LINGKUNGAN HIDUP',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Lingkungan dan Ketahanan terhadap Bencana',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Daerah
Indeks Kualitas Lahan
Indeks Risiko Bencana (IRB)
Jumlah Desa yang Melakukan Pengolahan Sampah Berbasis Reduce, Reuse, Recycle, Refused, dan Rot (5R)',
        'BASELINE IK SASARAN RPJMD' => '0,45
62,69
173,76
N/A',
        'TARGET IK SASARAN RPJMD' => '0,59
79,8
128,6
1',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks
Indeks
Desa',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP
BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP',
        'PROGRAM PRIORITAS' => 'Program Pembinaan dan Pengawasan Terhadap Izin Lingkungan dan Izin Perlindungan dan Pengelolaan Lingkungan Hidup (PPLH)',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kepatuhan Usaha dan/atau Kegiatan Terhadap Persetujuan Lingkungan yang Ditertibkan',
        'IK PROGRAM' => 'Persentase Pemegang Izin Usaha yang Taat Terhadap Peraturan Terkait Pengelolaan Lingkungan Hidup',
        'BASELINE IK PROGRAM' => '28',
        'TARGET IK PROGRAM' => '45',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS LINGKUNGAN HIDUP',
    ],
    91 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Kepastian Keleslestarian Lingkungan Hidup',
        'IK TUJUAN RPJMD' => 'Indeks Kualitas Lingkungan Hidup',
        'BASELINE IK TUJUAN RPJMD' => '76,72',
        'TARGET IK TUJUAN RPJMD' => '77,8',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS LINGKUNGAN HIDUP',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Lingkungan dan Ketahanan terhadap Bencana',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Daerah
Indeks Kualitas Lahan
Indeks Risiko Bencana (IRB)
Jumlah Desa yang Melakukan Pengolahan Sampah Berbasis Reduce, Reuse, Recycle, Refused, dan Rot (5R)',
        'BASELINE IK SASARAN RPJMD' => '0,45
62,69
173,76
N/A',
        'TARGET IK SASARAN RPJMD' => '0,59
79,8
128,6
1',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks
Indeks
Desa',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP
BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP',
        'PROGRAM PRIORITAS' => 'Program Penanganan Pengaduan Lingkungan Hidup',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Penyelesaian Sengketa dan/Kasus Tindak Pidana Lingkungan Hidup',
        'IK PROGRAM' => 'Persentase Kasus yang diselesaikan',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS LINGKUNGAN HIDUP',
    ],
    92 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Kepastian Keleslestarian Lingkungan Hidup',
        'IK TUJUAN RPJMD' => 'Indeks Kualitas Lingkungan Hidup',
        'BASELINE IK TUJUAN RPJMD' => '76,72',
        'TARGET IK TUJUAN RPJMD' => '77,8',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS LINGKUNGAN HIDUP',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Lingkungan dan Ketahanan terhadap Bencana',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Daerah
Indeks Kualitas Lahan
Indeks Risiko Bencana (IRB)
Jumlah Desa yang Melakukan Pengolahan Sampah Berbasis Reduce, Reuse, Recycle, Refused, dan Rot (5R)',
        'BASELINE IK SASARAN RPJMD' => '0,45
62,69
173,76
N/A',
        'TARGET IK SASARAN RPJMD' => '0,59
79,8
128,6
1',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks
Indeks
Desa',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP
BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Persampahan',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Tata Kelola Persampahan',
        'IK PROGRAM' => 'Persentase Timbulan Sampah Perkotaan yang ditangani',
        'BASELINE IK PROGRAM' => '86',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS LINGKUNGAN HIDUP',
    ],
    93 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Kepastian Keleslestarian Lingkungan Hidup',
        'IK TUJUAN RPJMD' => 'Indeks Kualitas Lingkungan Hidup',
        'BASELINE IK TUJUAN RPJMD' => '76,72',
        'TARGET IK TUJUAN RPJMD' => '77,8',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS LINGKUNGAN HIDUP',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Lingkungan dan Ketahanan terhadap Bencana',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Daerah
Indeks Kualitas Lahan
Indeks Risiko Bencana (IRB)
Jumlah Desa yang Melakukan Pengolahan Sampah Berbasis Reduce, Reuse, Recycle, Refused, dan Rot (5R)',
        'BASELINE IK SASARAN RPJMD' => '0,45
62,69
173,76
N/A',
        'TARGET IK SASARAN RPJMD' => '0,59
79,8
128,6
1',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks
Indeks
Desa',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP
BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP',
        'PROGRAM PRIORITAS' => 'Program Administrasi Pemerintahan Desa',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Pembinaan dan Pengawasan Pemerintahan Desa',
        'IK PROGRAM' => 'Persentase Aparatur Desa dan Anggota BPD yang ditingkatkan Kapasitasnya',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '50',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
    ],
    94 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Kepastian Keleslestarian Lingkungan Hidup',
        'IK TUJUAN RPJMD' => 'Indeks Kualitas Lingkungan Hidup',
        'BASELINE IK TUJUAN RPJMD' => '76,72',
        'TARGET IK TUJUAN RPJMD' => '77,8',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS LINGKUNGAN HIDUP',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Lingkungan dan Ketahanan terhadap Bencana',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Daerah
Indeks Kualitas Lahan
Indeks Risiko Bencana (IRB)
Jumlah Desa yang Melakukan Pengolahan Sampah Berbasis Reduce, Reuse, Recycle, Refused, dan Rot (5R)',
        'BASELINE IK SASARAN RPJMD' => '0,45
62,69
173,76
N/A',
        'TARGET IK SASARAN RPJMD' => '0,59
79,8
128,6
1',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks
Indeks
Desa',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP
BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP',
        'PROGRAM PRIORITAS' => 'Program Penghargaan Lingkungan Hidup Untuk Masyarakat',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kinerja Pemangku Kepentingan dalam Perlindungan dan Pengelolaan Lingkungan Hidup',
        'IK PROGRAM' => 'Partisipasi Masyarakat dalam Peningkatan kepedulian Lingkungan Hidup',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '5',
        'SATUAN IK PROGRAM' => 'Desa',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS LINGKUNGAN HIDUP',
    ],
    95 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Kepastian Keleslestarian Lingkungan Hidup',
        'IK TUJUAN RPJMD' => 'Indeks Kualitas Lingkungan Hidup',
        'BASELINE IK TUJUAN RPJMD' => '76,72',
        'TARGET IK TUJUAN RPJMD' => '77,8',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS LINGKUNGAN HIDUP',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Lingkungan dan Ketahanan terhadap Bencana',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Daerah
Indeks Kualitas Lahan
Indeks Risiko Bencana (IRB)
Jumlah Desa yang Melakukan Pengolahan Sampah Berbasis Reduce, Reuse, Recycle, Refused, dan Rot (5R)',
        'BASELINE IK SASARAN RPJMD' => '0,45
62,69
173,76
N/A',
        'TARGET IK SASARAN RPJMD' => '0,59
79,8
128,6
1',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks
Indeks
Desa',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP
BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP',
        'PROGRAM PRIORITAS' => 'Program Penanggulangan Bencana',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pencegahan dan Kesiapsiagaan Terhadap Bencana',
        'IK PROGRAM' => 'Tingkat Waktu Tanggap (Response Time rate) Daerah Layanan Wilayah Manajemen kebakaran (WMK)',
        'BASELINE IK PROGRAM' => '85',
        'TARGET IK PROGRAM' => '90',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PENANGGULANGAN BENCANA DAERAH',
    ],
    96 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Kepastian Keleslestarian Lingkungan Hidup',
        'IK TUJUAN RPJMD' => 'Indeks Kualitas Lingkungan Hidup',
        'BASELINE IK TUJUAN RPJMD' => '76,72',
        'TARGET IK TUJUAN RPJMD' => '77,8',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS LINGKUNGAN HIDUP',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Lingkungan dan Ketahanan terhadap Bencana',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Daerah
Indeks Kualitas Lahan
Indeks Risiko Bencana (IRB)
Jumlah Desa yang Melakukan Pengolahan Sampah Berbasis Reduce, Reuse, Recycle, Refused, dan Rot (5R)',
        'BASELINE IK SASARAN RPJMD' => '0,45
62,69
173,76
N/A',
        'TARGET IK SASARAN RPJMD' => '0,59
79,8
128,6
1',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks
Indeks
Desa',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP
BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP',
        'PROGRAM PRIORITAS' => 'Program Penanggulangan Bencana',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Penanganan Bencana pada Saatn Tanggap Darurat',
        'IK PROGRAM' => 'Tingkat Waktu Tanggap (Response Time rate) Daerah Layanan Wilayah Manajemen kebakaran (WMK)',
        'BASELINE IK PROGRAM' => '85,00',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PENANGGULANGAN BENCANA DAERAH',
    ],
    97 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Kepastian Keleslestarian Lingkungan Hidup',
        'IK TUJUAN RPJMD' => 'Indeks Kualitas Lingkungan Hidup',
        'BASELINE IK TUJUAN RPJMD' => '76,72',
        'TARGET IK TUJUAN RPJMD' => '77,8',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS LINGKUNGAN HIDUP',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Lingkungan dan Ketahanan terhadap Bencana',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Daerah
Indeks Kualitas Lahan
Indeks Risiko Bencana (IRB)
Jumlah Desa yang Melakukan Pengolahan Sampah Berbasis Reduce, Reuse, Recycle, Refused, dan Rot (5R)',
        'BASELINE IK SASARAN RPJMD' => '0,45
62,69
173,76
N/A',
        'TARGET IK SASARAN RPJMD' => '0,59
79,8
128,6
1',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks
Indeks
Desa',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP
BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP',
        'PROGRAM PRIORITAS' => 'Program Penanggulangan Bencana',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Penanganan Bencana pada saat Bencana',
        'IK PROGRAM' => 'Tingkat Waktu Tanggap (Response Time rate) Daerah Layanan Wilayah Manajemen kebakaran (WMK)',
        'BASELINE IK PROGRAM' => '85,00',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PENANGGULANGAN BENCANA DAERAH',
    ],
    98 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Kepastian Keleslestarian Lingkungan Hidup',
        'IK TUJUAN RPJMD' => 'Indeks Kualitas Lingkungan Hidup',
        'BASELINE IK TUJUAN RPJMD' => '76,72',
        'TARGET IK TUJUAN RPJMD' => '77,8',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS LINGKUNGAN HIDUP',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Lingkungan dan Ketahanan terhadap Bencana',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Daerah
Indeks Kualitas Lahan
Indeks Risiko Bencana (IRB)
Jumlah Desa yang Melakukan Pengolahan Sampah Berbasis Reduce, Reuse, Recycle, Refused, dan Rot (5R)',
        'BASELINE IK SASARAN RPJMD' => '0,45
62,69
173,76
N/A',
        'TARGET IK SASARAN RPJMD' => '0,59
79,8
128,6
1',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks
Indeks
Desa',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP
BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP',
        'PROGRAM PRIORITAS' => 'Program Pencegahan, Penanggulangan, Penyelamatan Kebakaran dan Penyelamatan Non Kebakaran',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Layanan Pencegahan Kebakaran',
        'IK PROGRAM' => 'Persentase Bencana Kebakaran Kabupaten/Kota yang Tertangani',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PENANGGULANGAN BENCANA DAERAH',
    ],
    99 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Kepastian Keleslestarian Lingkungan Hidup',
        'IK TUJUAN RPJMD' => 'Indeks Kualitas Lingkungan Hidup',
        'BASELINE IK TUJUAN RPJMD' => '76,72',
        'TARGET IK TUJUAN RPJMD' => '77,8',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS LINGKUNGAN HIDUP',
        'SASARAN RPJMD' => 'Meningkatkan Kualitas Lingkungan dan Ketahanan terhadap Bencana',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Daerah
Indeks Kualitas Lahan
Indeks Risiko Bencana (IRB)
Jumlah Desa yang Melakukan Pengolahan Sampah Berbasis Reduce, Reuse, Recycle, Refused, dan Rot (5R)',
        'BASELINE IK SASARAN RPJMD' => '0,45
62,69
173,76
N/A',
        'TARGET IK SASARAN RPJMD' => '0,59
79,8
128,6
1',
        'SATUAN IK SASARAN RPJMD' => 'Indeks
Indeks
Indeks
Desa',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP
BADAN PENANGGULANGAN BENCANA DAERAH
DINAS LINGKUNGAN HIDUP',
        'PROGRAM PRIORITAS' => 'Program Pencegahan, Penanggulangan, Penyelamatan Kebakaran dan Penyelamatan Non Kebakaran',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Pelayanan Penyelamatan dan Evakuasi Korban Kebakaran',
        'IK PROGRAM' => 'Persentase Bencana Kebakaran Kabupaten/Kota yang Tertangani',
        'BASELINE IK PROGRAM' => '100,00',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PENANGGULANGAN BENCANA DAERAH',
    ],
    100 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 6 : Mengembangkan dan Melestarikan Budaya Aceh',
        'TUJUAN RPJMD' => 'Terlestarikannya Budaya Aceh',
        'IK TUJUAN RPJMD' => 'Indeks Pembangunan Kebudayaan (IPK)',
        'BASELINE IK TUJUAN RPJMD' => '52,91',
        'TARGET IK TUJUAN RPJMD' => '75,3',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
        'SASARAN RPJMD' => 'Meningkatkan Keberdayaan Pelaku Seni dan Budaya',
        'IK SASARAN RPJMD' => 'Jumlah Event yang Diikuti Pelaku Seni dan Budaya
Jumlah Sanggar Seni yang Representatif dan Aktif',
        'BASELINE IK SASARAN RPJMD' => '4
25',
        'TARGET IK SASARAN RPJMD' => '4
30',
        'SATUAN IK SASARAN RPJMD' => 'Jumlah Event
Sanggar',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA
DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'PROGRAM PRIORITAS' => 'Program Pengembangan Kebudayaan',
        'OUTCOME PROGRAM PRIORITAS' => 'Menngkatnya Peran Serta Masyarakat dalam Pengembangan Kebudayaan',
        'IK PROGRAM' => 'Tingkat Partisipasi Masyarakat Terhadap Pengembangan kebudayaan',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '70',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    ],
    101 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 6 : Mengembangkan dan Melestarikan Budaya Aceh',
        'TUJUAN RPJMD' => 'Terlestarikannya Budaya Aceh',
        'IK TUJUAN RPJMD' => 'Indeks Pembangunan Kebudayaan (IPK)',
        'BASELINE IK TUJUAN RPJMD' => '52,91',
        'TARGET IK TUJUAN RPJMD' => '75,3',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
        'SASARAN RPJMD' => 'Meningkatkan Keberdayaan Pelaku Seni dan Budaya',
        'IK SASARAN RPJMD' => 'Jumlah Event yang Diikuti Pelaku Seni dan Budaya
Jumlah Sanggar Seni yang Representatif dan Aktif',
        'BASELINE IK SASARAN RPJMD' => '4
25',
        'TARGET IK SASARAN RPJMD' => '4
30',
        'SATUAN IK SASARAN RPJMD' => 'Jumlah Event
Sanggar',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA
DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'PROGRAM PRIORITAS' => 'Program Pengembangan Kesenian Tradisional',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Peran Serta Masyarakat dalam Pengembangan Kesenian Tradisional',
        'IK PROGRAM' => 'Persentase kesenian Tradisional yang dilestarikan dan dikembangkan',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '70',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    ],
    102 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 6 : Mengembangkan dan Melestarikan Budaya Aceh',
        'TUJUAN RPJMD' => 'Terlestarikannya Budaya Aceh',
        'IK TUJUAN RPJMD' => 'Indeks Pembangunan Kebudayaan (IPK)',
        'BASELINE IK TUJUAN RPJMD' => '52,91',
        'TARGET IK TUJUAN RPJMD' => '75,3',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
        'SASARAN RPJMD' => 'Mengoptimalkan Peran Kelembagaan dan Meningkatkan Kolaborasi Pengembangan Kebudayaan',
        'IK SASARAN RPJMD' => 'Jumlah Lembaga yang Bekerjasama dalam Pengembangan Kebudayaan',
        'BASELINE IK SASARAN RPJMD' => '28',
        'TARGET IK SASARAN RPJMD' => '33',
        'SATUAN IK SASARAN RPJMD' => 'Lembaga',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
        'PROGRAM PRIORITAS' => 'Program Pengembangan Kebudayaan',
        'OUTCOME PROGRAM PRIORITAS' => 'Menngkatnya Peran Serta Masyarakat dalam Pengembangan Kebudayaan',
        'IK PROGRAM' => 'Tingkat Partisipasi Masyarakat Terhadap Pengembangan kebudayaan',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '70',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    ],
    103 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 6 : Mengembangkan dan Melestarikan Budaya Aceh',
        'TUJUAN RPJMD' => 'Terlestarikannya Budaya Aceh',
        'IK TUJUAN RPJMD' => 'Indeks Pembangunan Kebudayaan (IPK)',
        'BASELINE IK TUJUAN RPJMD' => '52,91',
        'TARGET IK TUJUAN RPJMD' => '75,3',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
        'SASARAN RPJMD' => 'Melindungi Adat Istiadat dan Cagar Budaya',
        'IK SASARAN RPJMD' => 'Jumlah Cagar Budaya yang Terdaftar',
        'BASELINE IK SASARAN RPJMD' => '5',
        'TARGET IK SASARAN RPJMD' => '15',
        'SATUAN IK SASARAN RPJMD' => 'Cagar Budaya',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Permuseuman',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Tata Kelola Museum',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    ],
    104 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 7 : Meningkatkan Peran Pemuda dalam Upaya Mewujudkan Percepatan Pembangunan',
        'TUJUAN RPJMD' => 'Terwujudnya Peningkatan Pembangunan di Bidang Kepemudaan',
        'IK TUJUAN RPJMD' => 'Indeks Pembangunan Pemuda (IPP)',
        'BASELINE IK TUJUAN RPJMD' => '56,33',
        'TARGET IK TUJUAN RPJMD' => '56,5',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'SASARAN RPJMD' => 'Meningkatkan Kapasitas dan Kualitas Pemuda',
        'IK SASARAN RPJMD' => 'Jumlah Pemuda yang Dibina',
        'BASELINE IK SASARAN RPJMD' => 'N/A',
        'TARGET IK SASARAN RPJMD' => '29',
        'SATUAN IK SASARAN RPJMD' => 'OKP',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'PROGRAM PRIORITAS' => 'Program Pengembangan Kapasitas Daya Saing Kepemudaan',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Daya Saing Kepemudaan',
        'IK PROGRAM' => 'Persentase Pengusaha Pemula Muda',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '80',
        'SATUAN IK PROGRAM' => 'Rasio',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
    ],
    105 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 7 : Meningkatkan Peran Pemuda dalam Upaya Mewujudkan Percepatan Pembangunan',
        'TUJUAN RPJMD' => 'Terwujudnya Peningkatan Pembangunan di Bidang Kepemudaan',
        'IK TUJUAN RPJMD' => 'Indeks Pembangunan Pemuda (IPP)',
        'BASELINE IK TUJUAN RPJMD' => '56,33',
        'TARGET IK TUJUAN RPJMD' => '56,5',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'SASARAN RPJMD' => 'Meningkatkan Kapasitas dan Kualitas Pemuda',
        'IK SASARAN RPJMD' => 'Jumlah Pemuda yang Dibina',
        'BASELINE IK SASARAN RPJMD' => 'N/A',
        'TARGET IK SASARAN RPJMD' => '29',
        'SATUAN IK SASARAN RPJMD' => 'OKP',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'PROGRAM PRIORITAS' => 'Program Administrasi Pemerintahan Desa',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Pembinaan dan Pengawasan Pemerintahan Desa',
        'IK PROGRAM' => 'Persentase Aparatur Desa dan Anggota BPD yang ditingkatkan Kapasitasnya',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '60',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
    ],
    106 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 7 : Meningkatkan Peran Pemuda dalam Upaya Mewujudkan Percepatan Pembangunan',
        'TUJUAN RPJMD' => 'Terwujudnya Peningkatan Pembangunan di Bidang Kepemudaan',
        'IK TUJUAN RPJMD' => 'Indeks Pembangunan Pemuda (IPP)',
        'BASELINE IK TUJUAN RPJMD' => '56,33',
        'TARGET IK TUJUAN RPJMD' => '56,5',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'SASARAN RPJMD' => 'Memperkuat Partisipasi Pemuda dalam Pembangunan Sosial Ekonomi',
        'IK SASARAN RPJMD' => 'Persentase Wirausaha Muda',
        'BASELINE IK SASARAN RPJMD' => 'N/A',
        'TARGET IK SASARAN RPJMD' => '71',
        'SATUAN IK SASARAN RPJMD' => 'Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'PROGRAM PRIORITAS' => 'Program Penyediaan dan Pengembangan Sarana Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Distribusi dan Kualitas Prasarana Pertanian',
        'IK PROGRAM' => 'Produktivitas Padi',
        'BASELINE IK PROGRAM' => '6,3',
        'TARGET IK PROGRAM' => '7,3',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
    ],
    107 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 7 : Meningkatkan Peran Pemuda dalam Upaya Mewujudkan Percepatan Pembangunan',
        'TUJUAN RPJMD' => 'Terwujudnya Peningkatan Pembangunan di Bidang Olahraga',
        'IK TUJUAN RPJMD' => 'Indeks Pembangunan Olahraga (IPO)',
        'BASELINE IK TUJUAN RPJMD' => '0,327',
        'TARGET IK TUJUAN RPJMD' => '0,36',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'SASARAN RPJMD' => 'Meningkatkan Prestasi Pemuda',
        'IK SASARAN RPJMD' => 'Jumlah Pemuda yang Berprestasi di Bidang Olahraga di tingkat Nasional
Jumlah Pemuda yang Berprestasi di Bidang Non Olahraga di tingkat Nasional',
        'BASELINE IK SASARAN RPJMD' => '9
15',
        'TARGET IK SASARAN RPJMD' => '30
40',
        'SATUAN IK SASARAN RPJMD' => 'Orang
Orang',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA
DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'PROGRAM PRIORITAS' => 'Program Pengembangan Kapasitas Daya Saing Keolahragaan',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Pembudayaan dan Prestasi Olahraga',
        'IK PROGRAM' => 'Persentase Peningkatan Prestasi Atlet',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '13',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
    ],
    108 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Majelis Pendidikan Aceh',
        'IK PROGRAM' => 'Persentase SD yang Menerapkan Muatan Lokal (Bahasa Aceh)
Persentase SMP yang Menerapkan Muatan Lokal (Bahasa Aceh)',
        'BASELINE IK PROGRAM' => 'N/A
N/A',
        'TARGET IK PROGRAM' => '82
82',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT MAJELIS PENDIDIKAN DAERAH',
    ],
    109 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengembangan Kurikulum',
        'IK PROGRAM' => 'Persentase Satuan Pendidikan yang Mengembangkan Kurikulum Muatan Lokal',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '70',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    ],
    110 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pembinaan Sejarah',
        'IK PROGRAM' => 'Tingkat Partisipasi Masyarakat Terhadap Tinjauan Sejarah Lokal',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '75',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    ],
    111 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pelestarian dan Pengelolaan Cagar Budaya',
        'IK PROGRAM' => 'Persentase Warisan Budaya yang dilestarikan',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '75',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    ],
    112 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Peningkatan Kapasitas Sumber Daya Manusia Kesehatan',
        'IK PROGRAM' => 'Persentase Peningkatan Kompetensi SDM Bidang Kesehatan',
        'BASELINE IK PROGRAM' => '55',
        'TARGET IK PROGRAM' => '85',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KESEHATAN',
    ],
    113 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Sediaan Farmasi, Alat Kesehatan dan Makanan Minuman',
        'IK PROGRAM' => 'Persentase Cakupan Sediaan Farmasi, Alat Kesehatan dan Makanan Minuman',
        'BASELINE IK PROGRAM' => '70,00',
        'TARGET IK PROGRAM' => '95',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KESEHATAN',
    ],
    114 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penataan Bangunan Gedung',
        'IK PROGRAM' => 'Persentase Gedung Pemerintah yang Dapat Berfungsi
Persentase Bangunan yang Memiliki PBG Per Satuan Bangunan',
        'BASELINE IK PROGRAM' => '95,00
0,0219',
        'TARGET IK PROGRAM' => '97,00
0,035',
        'SATUAN IK PROGRAM' => 'Persen
Rasio',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
    ],
    115 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penataan Bangunan dan Lingkungannya',
        'IK PROGRAM' => 'Ruang Publik yang Berubah Peruntukannya',
        'BASELINE IK PROGRAM' => '0',
        'TARGET IK PROGRAM' => '0',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
    ],
    116 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Penataan Ruang',
        'IK PROGRAM' => 'Ketaatan Terhadap Regulasi Rencana Tata Ruang',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '87,00',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
    ],
    117 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengembangan Jasa Konstruksi',
        'IK PROGRAM' => 'Persentase Penyedia Jasa yang Mendapatkan Pembinaan Teknis',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '3,50',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
    ],
    118 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengembangan Perumahan',
        'IK PROGRAM' => 'Persentase Rumah Layak Huni',
        'BASELINE IK PROGRAM' => '32,00',
        'TARGET IK PROGRAM' => '32,3',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN',
    ],
    119 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Kawasan Permukiman',
        'IK PROGRAM' => 'Persentase Rumah Tangga yang Memiliki Akses Terhadap Hunian yang Layak',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '84',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN',
    ],
    120 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Perumahan dan Kawasan Permukiman Kumuh',
        'IK PROGRAM' => 'Persentase Kawasan Permukiman Bebas Kumuh',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '84',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN',
    ],
    121 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Peningkatan Ketenteraman dan Ketertiban Umum',
        'IK PROGRAM' => 'Persentase Perda dan Perkada yang ditegakkan
Persentase Penyelenggaraan Trantibum
Persentase Cakupan Perlindungan Masyarakat
Persentase PPNS yang ditingkatkan Kompetensinya',
        'BASELINE IK PROGRAM' => '60,00
60,00
60,00
60,00',
        'TARGET IK PROGRAM' => '85
85
85
85',
        'SATUAN IK PROGRAM' => 'Persen
Persen
Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SATUAN POLISI PAMONG PRAJA DAN WILAYATUL HISBAH',
    ],
    122 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan Sosial',
        'IK PROGRAM' => 'Persentase Keluarga Miskin yang Memperoleh Pemberdayaan Sosial Melalui Pemberdayaan Ekonomi',
        'BASELINE IK PROGRAM' => '250',
        'TARGET IK PROGRAM' => '220',
        'SATUAN IK PROGRAM' => 'Keluarga',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS SOSIAL',
    ],
    123 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Rehabilitasi Sosial',
        'IK PROGRAM' => 'Persentase Penyandang Disabilitas Terlantar yang Terpenuhi Kebutuhan Dasarnya
Persentase Anak Terlantar yang Terpenuhi Kebutuhan Dasarnya
Persentase Usia Lanjut Terlantar yang Terpenuhi Kebutuhan Dasarnya
Persentase Gelandangan dan Pengemis Terlantar yang Terpenuhi Kebutuhan Dasarnya',
        'BASELINE IK PROGRAM' => '60,15
95,00
95,33
80,00',
        'TARGET IK PROGRAM' => '90
98
98
92',
        'SATUAN IK PROGRAM' => 'Persen
Persen
Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS SOSIAL',
    ],
    124 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penanganan Bencana',
        'IK PROGRAM' => 'Persentase Korban Bencana Alam, Sosial dan/atau Non Alam yang Terpenuhi Kebutuhan Dasar pada Saat dan Setelah Tanggap Darurat Bencana
Persentase Korban Bencana yang Mendapatkan Layanan Pemulihan Sosial',
        'BASELINE IK PROGRAM' => '100
100',
        'TARGET IK PROGRAM' => '100
100',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS SOSIAL',
    ],
    125 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Taman Makam Pahlawan',
        'IK PROGRAM' => 'Persentase Taman Makam Pahlawan Nasional yang Terkelola dengan Baik',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS SOSIAL',
    ],
    126 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penatagunaan Tanah',
        'IK PROGRAM' => 'Persentase Tanah yang Tersedia untuk Kepentingan Umum',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '80',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANAHAN',
    ],
    127 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengurusan Hak-Hak Atas Tanah',
        'IK PROGRAM' => 'Jumlah Usulan Sertifikat Tanah Pemerintah',
        'BASELINE IK PROGRAM' => '543,00',
        'TARGET IK PROGRAM' => '50',
        'SATUAN IK PROGRAM' => 'Hak Alas',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANAHAN',
    ],
    128 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Survei, Pengukuran dan Pemetaan',
        'IK PROGRAM' => 'Jumlah Tanah Pemerintah yang Sudah Terinventarisasi',
        'BASELINE IK PROGRAM' => '543,00',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Hak Alas',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANAHAN',
    ],
    129 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Sistem Informasi Pertanahan',
        'IK PROGRAM' => 'Persentase Tanah Pemerintah yang dicatat dalam Sim Tanah',
        'BASELINE IK PROGRAM' => '41,67',
        'TARGET IK PROGRAM' => '81',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANAHAN',
    ],
    130 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penanganan Konflik, Sengketa dan Perkara Pertanahan',
        'IK PROGRAM' => 'Persentase Kasus Tanah yang diselesaikan',
        'BASELINE IK PROGRAM' => '80,36',
        'TARGET IK PROGRAM' => '85',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANAHAN',
    ],
    131 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Peningkatan Pendidikan, Pelatihan dan Penyuluhan Lingkungan Hidup untuk Masyarakat',
        'IK PROGRAM' => 'Jumlah Keterlibatan Kelompok Masyarakat dalam Pengelolaan Lingkungan Hidup',
        'BASELINE IK PROGRAM' => '2',
        'TARGET IK PROGRAM' => '5',
        'SATUAN IK PROGRAM' => 'Kelompok',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS LINGKUNGAN HIDUP',
    ],
    132 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pendaftaran Penduduk',
        'IK PROGRAM' => 'Persentase Kepemilikan Identitas Kependudukan Digital
Persentase Kepemilikan Kartu Identitas Anak',
        'BASELINE IK PROGRAM' => '2,74
55,46',
        'TARGET IK PROGRAM' => '60
85',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL',
    ],
    133 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pencatatan Sipil',
        'IK PROGRAM' => 'Persentase Akta Kelahiran yang diterbitkan Bagi yang Melaporkan
Persentase Akta Kematian yang diterbitkan Bagi yang Melaporkan
Persentase Akta Perkawinan yang diterbitkan Bagi yang Melaporkan
Persentase Akta Perceraian yang diterbitkan Bagi yang Melaporkan',
        'BASELINE IK PROGRAM' => '97,68
100,00
56,75
44,56',
        'TARGET IK PROGRAM' => '100
100
85
75',
        'SATUAN IK PROGRAM' => 'Persen
Persen
Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL',
    ],
    134 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Informasi Administrasi Kependudukan',
        'IK PROGRAM' => 'Persentase Informasi Kependudukan yang dimanfaatkan',
        'BASELINE IK PROGRAM' => '11,53',
        'TARGET IK PROGRAM' => '30,77',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL',
    ],
    135 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Profil Kependudukan',
        'IK PROGRAM' => 'Pemanfaatan Profil Data Kependudukan untuk Pembangunan',
        'BASELINE IK PROGRAM' => 'Ada',
        'TARGET IK PROGRAM' => 'Ada',
        'SATUAN IK PROGRAM' => 'Nilai',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL',
    ],
    136 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penataan Desa',
        'IK PROGRAM' => 'Persentase Fasilitasi Penataan Desa',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '60',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
    ],
    137 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Pelayaran',
        'IK PROGRAM' => 'Persentase Capaian PAD',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERHUBUNGAN',
    ],
    138 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Informasi dan Komunikasi Publik',
        'IK PROGRAM' => 'Persentase Tingkat Kepuasan Masyarakat Terhadap Akses dan Kualitas Informasi Publik Pemerintah Daerah (Survei)',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '90',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN',
    ],
    139 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Persandian untuk Pengamanan Informasi',
        'IK PROGRAM' => 'Tingkat Kesiapan Pengamanan Informasi Pemerintah Daerah',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '90',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN',
    ],
    140 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Sumber Daya Ekonomi untuk Kedaulatan dan Kemandirian Pangan',
        'IK PROGRAM' => 'Persentase Kebijakan Pangan yang Diimplementasikan',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PANGAN',
    ],
    141 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penanganan Kerawanan Pangan',
        'IK PROGRAM' => 'Persentase Daerah Rawan Pangan',
        'BASELINE IK PROGRAM' => '8,70',
        'TARGET IK PROGRAM' => '6,5',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PANGAN',
    ],
    142 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengawasan Keamanan Pangan',
        'IK PROGRAM' => 'Persentase Keamanan Pangan Segar yang Beredar',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '96',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PANGAN',
    ],
    143 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengarusutamaan Gender dan Pemberdayaan Perempuan',
        'IK PROGRAM' => 'Indeks Pembangunan Gender (IPG)
Indeks Ketimpangan Gender (IKG)',
        'BASELINE IK PROGRAM' => '85,98
0,231',
        'TARGET IK PROGRAM' => '86,00
0,227',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
    ],
    144 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Perlindungan Perempuan',
        'IK PROGRAM' => 'Rasio Kekerasan dalam Rumah Tangga (KDRT)',
        'BASELINE IK PROGRAM' => '0,333',
        'TARGET IK PROGRAM' => '0,095',
        'SATUAN IK PROGRAM' => 'Rasio',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
    ],
    145 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Peningkatan Kualitas Keluarga',
        'IK PROGRAM' => 'Persentase Gampong Keluarga Berkualitas Mandiri',
        'BASELINE IK PROGRAM' => '49,55',
        'TARGET IK PROGRAM' => '52,80',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
    ],
    146 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Sistem Data Gender dan Anak',
        'IK PROGRAM' => 'Tersedianya Profil Gender',
        'BASELINE IK PROGRAM' => '-',
        'TARGET IK PROGRAM' => '5',
        'SATUAN IK PROGRAM' => 'Dokumen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
    ],
    147 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemenuhan Hak Anak (PHA)',
        'IK PROGRAM' => 'Indeks Pemenuhan Hak Anak (IPHA)',
        'BASELINE IK PROGRAM' => '50,00',
        'TARGET IK PROGRAM' => '75,00',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
    ],
    148 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Perlindungan Khusus Anak',
        'IK PROGRAM' => 'Indeks Perlindungan Anak',
        'BASELINE IK PROGRAM' => '69,32',
        'TARGET IK PROGRAM' => '69,37',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
    ],
    149 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengendalian Penduduk',
        'IK PROGRAM' => 'Rasio Kepadatan Penduduk
Angka Kelahiran Total (Total Fertility Rate/TFR)',
        'BASELINE IK PROGRAM' => '75,28
2,18',
        'TARGET IK PROGRAM' => '81,04
2,17',
        'SATUAN IK PROGRAM' => 'Persen
Nilai',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
    ],
    150 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pembinaan Keluarga Berencana (KB)',
        'IK PROGRAM' => 'Proporsi Kebutuhan KB yang Terpenuhi',
        'BASELINE IK PROGRAM' => '87,77',
        'TARGET IK PROGRAM' => '89,85',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
    ],
    151 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan dan Peningkatan Keluarga Sejahtera (KS)',
        'IK PROGRAM' => 'Indeks Pengasuhan Keluarga Remaja
Indeks Lansia Berdaya',
        'BASELINE IK PROGRAM' => '87,24
57,43',
        'TARGET IK PROGRAM' => '92,48
63,69',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
    ],
    152 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengawasan dan Pemeriksaan Koperasi',
        'IK PROGRAM' => 'Cakupan Pengawasan Koperasi',
        'BASELINE IK PROGRAM' => '64,06',
        'TARGET IK PROGRAM' => '79',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    153 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penilaian Kesehatan KSP/USP Koperasi',
        'IK PROGRAM' => 'Persentase Koperasi Simpan Pinjam (KSP)/Usaha Simpan Pinjam (USP) Sehat',
        'BASELINE IK PROGRAM' => '57,81',
        'TARGET IK PROGRAM' => '80',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    154 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan Usaha Menengah, Usaha Kecil, dan Usaha Mikro (UMKM)',
        'IK PROGRAM' => 'Persentase Peningkatan Pendapatan UMKM',
        'BASELINE IK PROGRAM' => '34,88',
        'TARGET IK PROGRAM' => '7,00-7,50',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    155 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Peningkatan Sarana Distribusi Perdagangan',
        'IK PROGRAM' => 'Jumlah Pasar Induk Komoditi Pertanian
Jumlah Gudang Komoditi Pertanian',
        'BASELINE IK PROGRAM' => 'N/A
N/A',
        'TARGET IK PROGRAM' => '1
1',
        'SATUAN IK PROGRAM' => 'Pasar Induk
Gudang',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    156 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Stabilisasi Harga Barang Kebutuhan Pokok dan Barang Penting',
        'IK PROGRAM' => 'Persentase Stabilitas Harga Kebutuhan Harga Barang Pokok',
        'BASELINE IK PROGRAM' => '3,29',
        'TARGET IK PROGRAM' => '2,50-4,50',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    157 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengembangan Ekspor',
        'IK PROGRAM' => 'Ekspor Bersih Perdagangan',
        'BASELINE IK PROGRAM' => '958,8',
        'TARGET IK PROGRAM' => '1887,816',
        'SATUAN IK PROGRAM' => 'Milyar Rupiah',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    158 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Standardisasi dan Perlindungan Konsumen',
        'IK PROGRAM' => 'Persentase Akurasi Kemetrologian',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    159 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penggunaan dan Pemasaran Produk Dalam Negeri',
        'IK PROGRAM' => 'Jumlah UMKM yang Memiliki Kerja Sama Pemasaran
Jumlah UMKM Komoditi Pertanian yang Memiliki Akses E-Commerce',
        'BASELINE IK PROGRAM' => '0
0',
        'TARGET IK PROGRAM' => '2
2',
        'SATUAN IK PROGRAM' => 'Jumlah UMKM
Jumlah UMKM',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    160 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Sistem Informasi Industri Nasional',
        'IK PROGRAM' => 'Persentase IKM yang Dibantu Tepat Sasaran',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    161 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pelayanan Penanaman Modal',
        'IK PROGRAM' => 'Indeks Kepuasan Masyarakat',
        'BASELINE IK PROGRAM' => '94,46',
        'TARGET IK PROGRAM' => 'A',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU',
    ],
    162 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengendalian Pelaksanaan Penanaman Modal',
        'IK PROGRAM' => 'Jumlah Realisasi Investasi',
        'BASELINE IK PROGRAM' => '1613,76',
        'TARGET IK PROGRAM' => '2900',
        'SATUAN IK PROGRAM' => 'Milyar',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU',
    ],
    163 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Data dan Sistem Informasi Penanaman Modal',
        'IK PROGRAM' => 'Persentase Update Data dan Informasi Perizinan dan Nonperizinan',
        'BASELINE IK PROGRAM' => '95,00',
        'TARGET IK PROGRAM' => '95',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU',
    ],
    164 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Peningkatan Daya Tarik Destinasi Pariwisata',
        'IK PROGRAM' => 'Jumlah Kunjungan Wisatawan',
        'BASELINE IK PROGRAM' => '144.902',
        'TARGET IK PROGRAM' => '770',
        'SATUAN IK PROGRAM' => 'Jumlah Orang',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
    ],
    165 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemasaran Pariwisata',
        'IK PROGRAM' => 'Kontribusi Pertumbuhan PDRB Sektor Pariwisata
Persentase PAD Sektor Pariwisata',
        'BASELINE IK PROGRAM' => '0,74
4,26',
        'TARGET IK PROGRAM' => '0,8
4,40',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
    ],
    166 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengembangan Sumber Daya Pariwisata dan Ekonomi Kreatif',
        'IK PROGRAM' => 'Persentase Usaha Ekonomi Kreatif',
        'BASELINE IK PROGRAM' => '28,99',
        'TARGET IK PROGRAM' => '33',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
    ],
    167 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengembangan Kapasitas Kepramukaan',
        'IK PROGRAM' => 'Persentase Penggalang Kategori Rakit',
        'BASELINE IK PROGRAM' => '33,33',
        'TARGET IK PROGRAM' => '38',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
    ],
    168 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengendalian Kesehatan Hewan dan Kesehatan Masyarakat Veteriner',
        'IK PROGRAM' => 'Angka Kematian Ternak Ruminansia
Persentase Kasus Penyakit Ternak yang Ditangani',
        'BASELINE IK PROGRAM' => '86
100,00',
        'TARGET IK PROGRAM' => '79
100',
        'SATUAN IK PROGRAM' => 'Ekor
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERKEBUNAN DAN PETERNAKAN',
    ],
    169 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Perizinan Usaha Pertanian',
        'IK PROGRAM' => 'Persentase Plasma Perkebunan yang Terimplementasi',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '4,68',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERKEBUNAN DAN PETERNAKAN',
    ],
    170 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengawasan Sumber Daya Kelautan dan Perikanan',
        'IK PROGRAM' => 'Wilayah Perikanan Tangkap Terawasi',
        'BASELINE IK PROGRAM' => '4',
        'TARGET IK PROGRAM' => '4',
        'SATUAN IK PROGRAM' => 'Kecamatan',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KELAUTAN DAN PERIKANAN',
    ],
    171 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Perencanaan Tenaga Kerja',
        'IK PROGRAM' => 'Implementasi Kebijakan Perencanaan Tenaga Kerja',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '70',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA',
    ],
    172 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Perencanaan Kawasan Transmigrasi',
        'IK PROGRAM' => 'Persentase Jumlah Perencanaan Kawasan Transmigrasi yang Terimplementasi',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '75',
        'SATUAN IK PROGRAM' => 'Kawasan',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA',
    ],
    173 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pembangunan Kawasan Transmigrasi',
        'IK PROGRAM' => 'Persentase Jumlah Kawasan Transmigrasi yang Aktif',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '50',
        'SATUAN IK PROGRAM' => 'Kawasan',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA',
    ],
    174 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengembangan Kawasan Transmigrasi',
        'IK PROGRAM' => 'Jumlah Satuan Permukiman Mandiri pada Kawasan Transmigrasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Satuan Permukiman',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA',
    ],
    175 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Perekonomian dan Pembangunan',
        'IK PROGRAM' => 'Persentase Pengawasan dan Pengendalian Pelaksanaan Pembangunan Kabupaten Aceh Barat',
        'BASELINE IK PROGRAM' => '60,00',
        'TARGET IK PROGRAM' => '90',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT DAERAH',
    ],
    176 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Dukungan Pelaksanaan Tugas dan Fungsi DPRD',
        'IK PROGRAM' => 'Ketetapan Penetapan Perda APBD Tahun Berjalan
Persentase Penetapan Rancangan Peraturan Daerah Tahun Berjalan',
        'BASELINE IK PROGRAM' => 'Tepat Waktu
80,00',
        'TARGET IK PROGRAM' => 'Tepat Waktu
90',
        'SATUAN IK PROGRAM' => 'Tepat Waktu
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT DPRK',
    ],
    177 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Perencanaan, Pengendalian dan Evaluasi Pembangunan Daerah',
        'IK PROGRAM' => 'Persentase Keselarasan RPJMD dengan RKPD
Persentase Keselarasan RPJMD dengan Renstra PD',
        'BASELINE IK PROGRAM' => '100
100',
        'TARGET IK PROGRAM' => '93
65',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
    ],
    178 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penelitian dan Pengembangan Daerah',
        'IK PROGRAM' => 'Persentase Rekomendasi Kebijakan Pembangunan Daerah yang Dijadikan Sebagai Landasan dalam Implementasi Pembangunan',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
    ],
    179 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Riset dan Inovasi Daerah',
        'IK PROGRAM' => 'Persentase Produk Inovasi yang Dimanfaatkan',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
    ],
    180 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Barang Milik Daerah',
        'IK PROGRAM' => 'Persentase Penambahan Nilai Aset Tetap',
        'BASELINE IK PROGRAM' => '3,17',
        'TARGET IK PROGRAM' => '3',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
    ],
    181 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Pengawasan',
        'IK PROGRAM' => 'Persentase Perangkat Daerah yang Menerapkan SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '80',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'INSPEKTORAT',
    ],
    182 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Perumusan Kebijakan, Pendampingan dan Asistensi',
        'IK PROGRAM' => 'Persentase Penyelesaian Temuan di Perangkat Daerah
Indeks Persepsi Korupsi',
        'BASELINE IK PROGRAM' => 'N/A
2,86',
        'TARGET IK PROGRAM' => '100
2,74',
        'SATUAN IK PROGRAM' => 'Persen
Indeks',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'INSPEKTORAT',
    ],
    183 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penguatan Ideologi Pancasila dan Karakter Kebangsaan',
        'IK PROGRAM' => 'Cakupan Penguatan Ideologi Pancasila dan Karakter Kebangsaan',
        'BASELINE IK PROGRAM' => '60',
        'TARGET IK PROGRAM' => '90',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KESATUAN BANGSA DAN POLITIK',
    ],
    184 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Peningkatan Peran Partai Politik dan Lembaga Pendidikan Melalui Pendidikan Politik dan Pengembangan Etika serta Budaya Politik',
        'IK PROGRAM' => 'Persentase Pendidikan Politik pada Kader Partai Politik',
        'BASELINE IK PROGRAM' => '50',
        'TARGET IK PROGRAM' => '80',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KESATUAN BANGSA DAN POLITIK',
    ],
    185 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan dan Pengawasan Organisasi Kemasyarakatan',
        'IK PROGRAM' => 'Persentase Organisasi Kemasyarakatan yang Aktif',
        'BASELINE IK PROGRAM' => '60',
        'TARGET IK PROGRAM' => '90',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KESATUAN BANGSA DAN POLITIK',
    ],
    186 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pembinaan dan Pengembangan Ketahanan Ekonomi, Sosial, dan Budaya',
        'IK PROGRAM' => 'Persentase Kebijakan di Bidang Ketahanan Ekonomi, Sosial, Budaya dan Fasilitasi Pencegahan Penyalahgunaan Narkotika, Fasilitasi Kerukunan Umat Beragama dan Penghayat Kepercayaan di Daerah yang dilaksanakan',
        'BASELINE IK PROGRAM' => '50',
        'TARGET IK PROGRAM' => '70',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KESATUAN BANGSA DAN POLITIK',
    ],
    187 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Peningkatan Kewaspadaan Nasional dan Peningkatan Kualitas dan Fasilitasi Penanganan Konflik Sosial',
        'IK PROGRAM' => 'Persentase Konflik Sosial yang diselesaikan',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KESATUAN BANGSA DAN POLITIK',
    ],
    188 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Majelis Permusyawaratan Ulama (MPU) Aceh',
        'IK PROGRAM' => 'Persentase Peran Ulama dalam Bidang Kesehatan',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '50',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT MAJELIS PEMUSYAWARATAN ULAMA',
    ],
    189 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Baitul Mal',
        'IK PROGRAM' => 'Persentase Peningkatan Ziswaf',
        'BASELINE IK PROGRAM' => '2,35',
        'TARGET IK PROGRAM' => '2,95',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT BAITUL MAL KABUPATEN',
    ],
    190 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Majelis Adat Aceh (MAA)',
        'IK PROGRAM' => 'Persentase Nilai-Nilai Adat Istiadat
Persentase Gampong yang Telah Menerapkan Hukum Adat',
        'BASELINE IK PROGRAM' => '90
88,16',
        'TARGET IK PROGRAM' => '95
99',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT MAJELIS ADAT ACEH',
    ],
    191 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pembinaan Perpustakaan',
        'IK PROGRAM' => 'Persentase Peningkatan Jumlah Pengunjung Perpustakaan Kabupaten Per Tahun
Rasio Ketercukupan Koleksi Perpustakaan dengan Penduduk',
        'BASELINE IK PROGRAM' => 'N/A
0,32',
        'TARGET IK PROGRAM' => '25
0,57',
        'SATUAN IK PROGRAM' => 'Persen
Rasio',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERPUSTAKAAN DAN KEARSIPAN',
    ],
    192 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pelestarian Koleksi Nasional dan Naskah Kuno',
        'IK PROGRAM' => 'Jumlah Naskah Kuno yang Terdata/Teridentifikasi',
        'BASELINE IK PROGRAM' => '5',
        'TARGET IK PROGRAM' => '10',
        'SATUAN IK PROGRAM' => 'Naskah',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERPUSTAKAAN DAN KEARSIPAN',
    ],
    193 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Arsip',
        'IK PROGRAM' => 'Cakupan Implementasi Srikandi pada OPD dan BLUD Lingkup Pemkab Aceh Barat
Persentase Arsip Statis yang dimasukkan dalam SIKN Melalui JIKN
Persentase Arsip Covid-19 yang diakuisisi',
        'BASELINE IK PROGRAM' => 'N/A
N/A
35',
        'TARGET IK PROGRAM' => '95
100
80',
        'SATUAN IK PROGRAM' => 'Persen
Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERPUSTAKAAN DAN KEARSIPAN',
    ],
    194 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Pemerintahan dan Pelayanan Publik',
        'IK PROGRAM' => 'Persentase Capaian Pelayanan SPM di Kecamatan
Persentase Kegiatan Daerah/Instansi Vertikal yang difasilitasi',
        'BASELINE IK PROGRAM' => '60
N/A',
        'TARGET IK PROGRAM' => '100
100',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN JOHAN PAHLAWAN',
    ],
    195 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan Masyarakat Desa dan Kelurahan',
        'IK PROGRAM' => 'Persentase Keluarga yang Melaksanakan Program PKK',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN JOHAN PAHLAWAN',
    ],
    196 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Koordinasi Ketentraman dan Ketertiban Umum',
        'IK PROGRAM' => 'Kasus Pelanggaran Ketertiban Umum',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN JOHAN PAHLAWAN',
    ],
    197 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Urusan Pemerintahan Umum',
        'IK PROGRAM' => 'Kasus Sara (Suku, Agama, Ras, dan Antargolongan)',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN JOHAN PAHLAWAN',
    ],
    198 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pembinaan dan Pengawasan Pemerintahan Desa',
        'IK PROGRAM' => 'Persentase Gampong yang Melaksanakan Musyawarah Gampong Tepat Waktu',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN JOHAN PAHLAWAN',
    ],
    199 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Pemerintahan dan Pelayanan Publik',
        'IK PROGRAM' => 'Persentase Capaian Pelayanan SPM di Kecamatan
Persentase Kegiatan Daerah/Instansi Vertikal yang difasilitasi',
        'BASELINE IK PROGRAM' => '60
N/A',
        'TARGET IK PROGRAM' => '100
100',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN KAWAY XVI',
    ],
    200 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan Masyarakat Desa dan Kelurahan',
        'IK PROGRAM' => 'Persentase Keluarga yang Melaksanakan Program PKK',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN KAWAY XVI',
    ],
    201 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Koordinasi Ketentraman dan Ketertiban Umum',
        'IK PROGRAM' => 'Kasus Pelanggaran Ketertiban Umum',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN KAWAY XVI',
    ],
    202 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Urusan Pemerintahan Umum',
        'IK PROGRAM' => 'Kasus Sara (Suku, Agama, Ras, dan Antargolongan)',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN KAWAY XVI',
    ],
    203 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pembinaan dan Pengawasan Pemerintahan Desa',
        'IK PROGRAM' => 'Persentase Gampong yang Melaksanakan Musyawarah Gampong Tepat Waktu',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN KAWAY XVI',
    ],
    204 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Pemerintahan dan Pelayanan Publik',
        'IK PROGRAM' => 'Persentase Capaian Pelayanan SPM di Kecamatan
Persentase Kegiatan Daerah/Instansi Vertikal yang difasilitasi',
        'BASELINE IK PROGRAM' => '60
N/A',
        'TARGET IK PROGRAM' => '100
100',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN MEUREUBO',
    ],
    205 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan Masyarakat Desa dan Kelurahan',
        'IK PROGRAM' => 'Persentase Keluarga yang Melaksanakan Program PKK',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN MEUREUBO',
    ],
    206 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Koordinasi Ketentraman dan Ketertiban Umum',
        'IK PROGRAM' => 'Kasus Pelanggaran Ketertiban Umum',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN MEUREUBO',
    ],
    207 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Urusan Pemerintahan Umum',
        'IK PROGRAM' => 'Kasus Sara (Suku, Agama, Ras, dan Antargolongan)',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN MEUREUBO',
    ],
    208 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pembinaan dan Pengawasan Pemerintahan Desa',
        'IK PROGRAM' => 'Persentase Gampong yang Melaksanakan Musyawarah Gampong Tepat Waktu',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN MEUREUBO',
    ],
    209 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Pemerintahan dan Pelayanan Publik',
        'IK PROGRAM' => 'Persentase Capaian Pelayanan SPM di Kecamatan
Persentase Kegiatan Daerah/Instansi Vertikal yang difasilitasi',
        'BASELINE IK PROGRAM' => '60
N/A',
        'TARGET IK PROGRAM' => '100
100',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA',
    ],
    210 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan Masyarakat Desa dan Kelurahan',
        'IK PROGRAM' => 'Persentase Keluarga yang Melaksanakan Program PKK',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA',
    ],
    211 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Koordinasi Ketentraman dan Ketertiban Umum',
        'IK PROGRAM' => 'Kasus Pelanggaran Ketertiban Umum',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA',
    ],
    212 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Urusan Pemerintahan Umum',
        'IK PROGRAM' => 'Kasus Sara (Suku, Agama, Ras, dan Antargolongan)',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA',
    ],
    213 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pembinaan dan Pengawasan Pemerintahan Desa',
        'IK PROGRAM' => 'Persentase Gampong yang Melaksanakan Musyawarah Gampong Tepat Waktu',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA',
    ],
    214 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Pemerintahan dan Pelayanan Publik',
        'IK PROGRAM' => 'Persentase Capaian Pelayanan SPM di Kecamatan
Persentase Kegiatan Daerah/Instansi Vertikal yang difasilitasi',
        'BASELINE IK PROGRAM' => '60
N/A',
        'TARGET IK PROGRAM' => '100
100',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA TIMUR',
    ],
    215 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan Masyarakat Desa dan Kelurahan',
        'IK PROGRAM' => 'Persentase Keluarga yang Melaksanakan Program PKK',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA TIMUR',
    ],
    216 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Koordinasi Ketentraman dan Ketertiban Umum',
        'IK PROGRAM' => 'Kasus Pelanggaran Ketertiban Umum',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA TIMUR',
    ],
    217 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Urusan Pemerintahan Umum',
        'IK PROGRAM' => 'Kasus Sara (Suku, Agama, Ras, dan Antargolongan)',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA TIMUR',
    ],
    218 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pembinaan dan Pengawasan Pemerintahan Desa',
        'IK PROGRAM' => 'Persentase Gampong yang Melaksanakan Musyawarah Gampong Tepat Waktu',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA TIMUR',
    ],
    219 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Pemerintahan dan Pelayanan Publik',
        'IK PROGRAM' => 'Persentase Capaian Pelayanan SPM di Kecamatan
Persentase Kegiatan Daerah/Instansi Vertikal yang difasilitasi',
        'BASELINE IK PROGRAM' => '60
N/A',
        'TARGET IK PROGRAM' => '100
100',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA BARAT',
    ],
    220 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan Masyarakat Desa dan Kelurahan',
        'IK PROGRAM' => 'Persentase Keluarga yang Melaksanakan Program PKK',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA BARAT',
    ],
    221 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Koordinasi Ketentraman dan Ketertiban Umum',
        'IK PROGRAM' => 'Kasus Pelanggaran Ketertiban Umum',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA BARAT',
    ],
    222 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Urusan Pemerintahan Umum',
        'IK PROGRAM' => 'Kasus Sara (Suku, Agama, Ras, dan Antargolongan)',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA BARAT',
    ],
    223 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pembinaan dan Pengawasan Pemerintahan Desa',
        'IK PROGRAM' => 'Persentase Gampong yang Melaksanakan Musyawarah Gampong Tepat Waktu',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA BARAT',
    ],
    224 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Pemerintahan dan Pelayanan Publik',
        'IK PROGRAM' => 'Persentase Capaian Pelayanan SPM di Kecamatan
Persentase Kegiatan Daerah/Instansi Vertikal yang difasilitasi',
        'BASELINE IK PROGRAM' => '60
N/A',
        'TARGET IK PROGRAM' => '100
100',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN PANTE CEUREUMEN',
    ],
    225 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan Masyarakat Desa dan Kelurahan',
        'IK PROGRAM' => 'Persentase Keluarga yang Melaksanakan Program PKK',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN PANTE CEUREUMEN',
    ],
    226 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Koordinasi Ketentraman dan Ketertiban Umum',
        'IK PROGRAM' => 'Kasus Pelanggaran Ketertiban Umum',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN PANTE CEUREUMEN',
    ],
    227 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Urusan Pemerintahan Umum',
        'IK PROGRAM' => 'Kasus Sara (Suku, Agama, Ras, dan Antargolongan)',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN PANTE CEUREUMEN',
    ],
    228 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pembinaan dan Pengawasan Pemerintahan Desa',
        'IK PROGRAM' => 'Persentase Gampong yang Melaksanakan Musyawarah Gampong Tepat Waktu',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN PANTE CEUREUMEN',
    ],
    229 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Pemerintahan dan Pelayanan Publik',
        'IK PROGRAM' => 'Persentase Capaian Pelayanan SPM di Kecamatan
Persentase Kegiatan Daerah/Instansi Vertikal yang difasilitasi',
        'BASELINE IK PROGRAM' => '60
N/A',
        'TARGET IK PROGRAM' => '100
100',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN PANTON REU',
    ],
    230 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan Masyarakat Desa dan Kelurahan',
        'IK PROGRAM' => 'Persentase Keluarga yang Melaksanakan Program PKK',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN PANTON REU',
    ],
    231 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Koordinasi Ketentraman dan Ketertiban Umum',
        'IK PROGRAM' => 'Kasus Pelanggaran Ketertiban Umum',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN PANTON REU',
    ],
    232 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Urusan Pemerintahan Umum',
        'IK PROGRAM' => 'Kasus Sara (Suku, Agama, Ras, dan Antargolongan)',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN PANTON REU',
    ],
    233 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pembinaan dan Pengawasan Pemerintahan Desa',
        'IK PROGRAM' => 'Persentase Gampong yang Melaksanakan Musyawarah Gampong Tepat Waktu',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN PANTON REU',
    ],
    234 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Pemerintahan dan Pelayanan Publik',
        'IK PROGRAM' => 'Persentase Capaian Pelayanan SPM di Kecamatan
Persentase Kegiatan Daerah/Instansi Vertikal yang difasilitasi',
        'BASELINE IK PROGRAM' => '60
N/A',
        'TARGET IK PROGRAM' => '100
100',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN ARONGAN LAMBALEK',
    ],
    235 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan Masyarakat Desa dan Kelurahan',
        'IK PROGRAM' => 'Persentase Keluarga yang Melaksanakan Program PKK',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN ARONGAN LAMBALEK',
    ],
    236 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Koordinasi Ketentraman dan Ketertiban Umum',
        'IK PROGRAM' => 'Kasus Pelanggaran Ketertiban Umum',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN ARONGAN LAMBALEK',
    ],
    237 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Urusan Pemerintahan Umum',
        'IK PROGRAM' => 'Kasus Sara (Suku, Agama, Ras, dan Antargolongan)',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN ARONGAN LAMBALEK',
    ],
    238 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pembinaan dan Pengawasan Pemerintahan Desa',
        'IK PROGRAM' => 'Persentase Gampong yang Melaksanakan Musyawarah Gampong Tepat Waktu',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN ARONGAN LAMBALEK',
    ],
    239 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Pemerintahan dan Pelayanan Publik',
        'IK PROGRAM' => 'Persentase Capaian Pelayanan SPM di Kecamatan
Persentase Kegiatan Daerah/Instansi Vertikal yang difasilitasi',
        'BASELINE IK PROGRAM' => '60
N/A',
        'TARGET IK PROGRAM' => '100
100',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN SUNGAI MAS',
    ],
    240 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan Masyarakat Desa dan Kelurahan',
        'IK PROGRAM' => 'Persentase Keluarga yang Melaksanakan Program PKK',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN SUNGAI MAS',
    ],
    241 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Koordinasi Ketentraman dan Ketertiban Umum',
        'IK PROGRAM' => 'Kasus Pelanggaran Ketertiban Umum',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN SUNGAI MAS',
    ],
    242 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Urusan Pemerintahan Umum',
        'IK PROGRAM' => 'Kasus Sara (Suku, Agama, Ras, dan Antargolongan)',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN SUNGAI MAS',
    ],
    243 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pembinaan dan Pengawasan Pemerintahan Desa',
        'IK PROGRAM' => 'Persentase Gampong yang Melaksanakan Musyawarah Gampong Tepat Waktu',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN SUNGAI MAS',
    ],
    244 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Pemerintahan dan Pelayanan Publik',
        'IK PROGRAM' => 'Persentase Capaian Pelayanan SPM di Kecamatan
Persentase Kegiatan Daerah/Instansi Vertikal yang difasilitasi',
        'BASELINE IK PROGRAM' => '60
N/A',
        'TARGET IK PROGRAM' => '100
100',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN SAMATIGA',
    ],
    245 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan Masyarakat Desa dan Kelurahan',
        'IK PROGRAM' => 'Persentase Keluarga yang Melaksanakan Program PKK',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN SAMATIGA',
    ],
    246 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Koordinasi Ketentraman dan Ketertiban Umum',
        'IK PROGRAM' => 'Kasus Pelanggaran Ketertiban Umum',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN SAMATIGA',
    ],
    247 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Urusan Pemerintahan Umum',
        'IK PROGRAM' => 'Kasus Sara (Suku, Agama, Ras, dan Antargolongan)',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN SAMATIGA',
    ],
    248 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pembinaan dan Pengawasan Pemerintahan Desa',
        'IK PROGRAM' => 'Persentase Gampong yang Melaksanakan Musyawarah Gampong Tepat Waktu',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN SAMATIGA',
    ],
    249 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Pemerintahan dan Pelayanan Publik',
        'IK PROGRAM' => 'Persentase Capaian Pelayanan SPM di Kecamatan
Persentase Kegiatan Daerah/Instansi Vertikal yang difasilitasi',
        'BASELINE IK PROGRAM' => '60
N/A',
        'TARGET IK PROGRAM' => '100
100',
        'SATUAN IK PROGRAM' => 'Persen
Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN BUBON',
    ],
    250 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan Masyarakat Desa dan Kelurahan',
        'IK PROGRAM' => 'Persentase Keluarga yang Melaksanakan Program PKK',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN BUBON',
    ],
    251 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Koordinasi Ketentraman dan Ketertiban Umum',
        'IK PROGRAM' => 'Kasus Pelanggaran Ketertiban Umum',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN BUBON',
    ],
    252 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penyelenggaraan Urusan Pemerintahan Umum',
        'IK PROGRAM' => 'Kasus Sara (Suku, Agama, Ras, dan Antargolongan)',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Kasus',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN BUBON',
    ],
    253 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pembinaan dan Pengawasan Pemerintahan Desa',
        'IK PROGRAM' => 'Persentase Gampong yang Melaksanakan Musyawarah Gampong Tepat Waktu',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN BUBON',
    ],
    254 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Kesehatan Masyarakat',
        'IK SASARAN RPJMD' => 'Angka Kematian Ibu (per 100.000 kelahiran hidup)
Prevalensi Stunting pada balita
Insidensi Tuberkulosis (per 100.000 penduduk)
Cakupan kepesertaan Jaminan Kesehatan Nasional (JKN)
Angka Kematian Bayi (AKB) per 1000 kelahiran hidup',
        'BASELINE IK SASARAN RPJMD' => '112
27,65
128
100
14',
        'TARGET IK SASARAN RPJMD' => '85
23,24
100
100
4',
        'SATUAN IK SASARAN RPJMD' => 'Angka
Persen
Kasus
Persen
Angka',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN',
        'PROGRAM PRIORITAS' => 'Program Pengelolaan Keuangan Daerah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Tata Kelola Anggaran',
        'IK PROGRAM' => 'Persentase Belanja Pegawai di Luar Tunjangan Guru yang Dialokasikan Melalui TKD',
        'BASELINE IK PROGRAM' => '32,66',
        'TARGET IK PROGRAM' => '30',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
    ],
    255 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Kesehatan Masyarakat',
        'IK SASARAN RPJMD' => 'Angka Kematian Ibu (per 100.000 kelahiran hidup)
Prevalensi Stunting pada balita
Insidensi Tuberkulosis (per 100.000 penduduk)
Cakupan kepesertaan Jaminan Kesehatan Nasional (JKN)
Angka Kematian Bayi (AKB) per 1000 kelahiran hidup',
        'BASELINE IK SASARAN RPJMD' => '112
27,65
128
100
14',
        'TARGET IK SASARAN RPJMD' => '85
23,24
100
100
4',
        'SATUAN IK SASARAN RPJMD' => 'Angka
Persen
Kasus
Persen
Angka',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN',
        'PROGRAM PRIORITAS' => 'Program Pemenuhan Upaya Kesehatan Perorangan dan Upaya Kesehatan Masyarakat',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Kesehatan Perorangan dan Upaya Kesehatan Masyarakat',
        'IK PROGRAM' => 'Prevalensi Stunting (Pendek dan Sangat Pendek pada Balita)',
        'BASELINE IK PROGRAM' => '20,2',
        'TARGET IK PROGRAM' => '10',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KESEHATAN',
    ],
    256 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Kesehatan Masyarakat',
        'IK SASARAN RPJMD' => 'Angka Kematian Ibu (per 100.000 kelahiran hidup)
Prevalensi Stunting pada balita
Insidensi Tuberkulosis (per 100.000 penduduk)
Cakupan kepesertaan Jaminan Kesehatan Nasional (JKN)
Angka Kematian Bayi (AKB) per 1000 kelahiran hidup',
        'BASELINE IK SASARAN RPJMD' => '112
27,65
128
100
14',
        'TARGET IK SASARAN RPJMD' => '85
23,24
100
100
4',
        'SATUAN IK SASARAN RPJMD' => 'Angka
Persen
Kasus
Persen
Angka',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN',
        'PROGRAM PRIORITAS' => 'Program Pemberdayaan Masyarakat Bidang Kesehatan',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Pemberdayaan Masyarakat Bidang Kesehatan',
        'IK PROGRAM' => 'Persentase Masyarakat Bidang Kesehatan yang Diberdayakan',
        'BASELINE IK PROGRAM' => '50',
        'TARGET IK PROGRAM' => '77',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KESEHATAN',
    ],
    257 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Kesehatan Masyarakat',
        'IK SASARAN RPJMD' => 'Angka Kematian Ibu (per 100.000 kelahiran hidup)
Prevalensi Stunting pada balita
Insidensi Tuberkulosis (per 100.000 penduduk)
Cakupan kepesertaan Jaminan Kesehatan Nasional (JKN)
Angka Kematian Bayi (AKB) per 1000 kelahiran hidup',
        'BASELINE IK SASARAN RPJMD' => '112
27,65
128
100
14',
        'TARGET IK SASARAN RPJMD' => '85
23,24
100
100
4',
        'SATUAN IK SASARAN RPJMD' => 'Angka
Persen
Kasus
Persen
Angka',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN',
        'PROGRAM PRIORITAS' => 'Program Kepegawaian Daerah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Administrasi Kepegawaian',
        'IK PROGRAM' => 'Persentase Perencanaan Kebutuhan yang Sesuai dengan Formasi',
        'BASELINE IK PROGRAM' => 'NA',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
    ],
    258 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Kesehatan Masyarakat',
        'IK SASARAN RPJMD' => 'Angka Kematian Ibu (per 100.000 kelahiran hidup)
Prevalensi Stunting pada balita
Insidensi Tuberkulosis (per 100.000 penduduk)
Cakupan kepesertaan Jaminan Kesehatan Nasional (JKN)
Angka Kematian Bayi (AKB) per 1000 kelahiran hidup',
        'BASELINE IK SASARAN RPJMD' => '112
27,65
128
100
14',
        'TARGET IK SASARAN RPJMD' => '85
23,24
100
100
4',
        'SATUAN IK SASARAN RPJMD' => 'Angka
Persen
Kasus
Persen
Angka',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN',
        'PROGRAM PRIORITAS' => 'Program Kepegawaian Daerah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Pengembangan Kompetensi ASN',
        'IK PROGRAM' => 'Persentase Perencanaan Kebutuhan yang Sesuai dengan Formasi',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
    ],
    259 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Kesehatan Masyarakat',
        'IK SASARAN RPJMD' => 'Angka Kematian Ibu (per 100.000 kelahiran hidup)
Prevalensi Stunting pada balita
Insidensi Tuberkulosis (per 100.000 penduduk)
Cakupan kepesertaan Jaminan Kesehatan Nasional (JKN)
Angka Kematian Bayi (AKB) per 1000 kelahiran hidup',
        'BASELINE IK SASARAN RPJMD' => '112
27,65
128
100
14',
        'TARGET IK SASARAN RPJMD' => '85
23,24
100
100
4',
        'SATUAN IK SASARAN RPJMD' => 'Angka
Persen
Kasus
Persen
Angka',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN',
        'PROGRAM PRIORITAS' => 'Program Kepegawaian Daerah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Tata Kelola Pengembangan Karir ASN',
        'IK PROGRAM' => 'Persentase Perencanaan Kebutuhan yang Sesuai dengan Formasi',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
    ],
    260 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Kesehatan Masyarakat',
        'IK SASARAN RPJMD' => 'Angka Kematian Ibu (per 100.000 kelahiran hidup)
Prevalensi Stunting pada balita
Insidensi Tuberkulosis (per 100.000 penduduk)
Cakupan kepesertaan Jaminan Kesehatan Nasional (JKN)
Angka Kematian Bayi (AKB) per 1000 kelahiran hidup',
        'BASELINE IK SASARAN RPJMD' => '112
27,65
128
100
14',
        'TARGET IK SASARAN RPJMD' => '85
23,24
100
100
4',
        'SATUAN IK SASARAN RPJMD' => 'Angka
Persen
Kasus
Persen
Angka',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN
DINAS KESEHATAN',
        'PROGRAM PRIORITAS' => 'Program Kepegawaian Daerah',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Penilaian Kinerja ASN',
        'IK PROGRAM' => 'Persentase Perencanaan Kebutuhan yang Sesuai dengan Formasi',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
    ],
    261 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Percepatan Transformasi Sosial dalam Kehidupan Masyarakat',
        'IK TUJUAN RPJMD' => 'Tingkat Kemiskinan
Indeks Pembangunan Manusia (IPM)
Usia Harapan Hidup (UHH)
Harapan Lama Sekolah
Rata-Rata lama sekolah penduduk usia di atas 15 tahun
Cakupan kepesertaan jaminan sosial ketenagakerjaan
Cakupan Kepesertaan Jaminan Sosial ketenagakerjaan bagi Pekerja Rentan',
        'BASELINE IK TUJUAN RPJMD' => '17,63
75,45
72,03
14,93
9,99
42,9
17,37',
        'TARGET IK TUJUAN RPJMD' => '16,1
77,72
73,54
15,03
10,26
48
22,5',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Indeks
Tahun
Tahun
Tahun
Persen
Persen',
        'OPD IK TUJUAN RPJMD' => 'Tidak Ada Data
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS KESEHATAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS PENDIDIKAN DAN KEBUDAYAAN
DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'SASARAN RPJMD' => 'Meningkatkan Aksesibilitas dan Partisipasi Perempuan dalam Pembangunan',
        'IK SASARAN RPJMD' => 'Indeks Pembangunan Gender (IPG)
Jumlah Kelompok Usaha Perempuan yang Berhasil',
        'BASELINE IK SASARAN RPJMD' => '86,7
50',
        'TARGET IK SASARAN RPJMD' => '87,45
67',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Kelompok',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA
DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
        'PROGRAM PRIORITAS' => 'Program Penyediaan dan Pengembangan Sarana Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Distribusi dan Kualitas Sarana Pertanian',
        'IK PROGRAM' => 'Jumlah Populasi Ternak Sapi',
        'BASELINE IK PROGRAM' => '9611',
        'TARGET IK PROGRAM' => '10817',
        'SATUAN IK PROGRAM' => 'Ton/Ha',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERKEBUNAN DAN PETERNAKAN',
    ],
    262 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Ketersediaan Lapangan Pekerjaan',
        'IK SASARAN RPJMD' => 'Tingkat Pengangguran Terbuka
Pertumbuhan UMKM/IKM',
        'BASELINE IK SASARAN RPJMD' => '5,58
2,17',
        'TARGET IK SASARAN RPJMD' => '5
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Penyediaan dan Pengembangan Sarana Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Distribusi dan Kualitas Sarana Pertanian',
        'IK PROGRAM' => 'Jumlah Populasi Ternak Sapi',
        'BASELINE IK PROGRAM' => '9611',
        'TARGET IK PROGRAM' => '10817',
        'SATUAN IK PROGRAM' => 'Ton/Ha',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERKEBUNAN DAN PETERNAKAN',
    ],
    263 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 1 : Mewujudkan Transformasi Sosial dan Ekonomi Guna Meningkatkan Daya Saing Kabupaten Aceh Barat',
        'TUJUAN RPJMD' => 'Terwujudnya Pertumbuhan Ekonomi yang Tinggi dan Berkualitas',
        'IK TUJUAN RPJMD' => 'Pertumbuhan Ekonomi
PDRB/kapita',
        'BASELINE IK TUJUAN RPJMD' => '7,5
67,94 (ADHB) / 41,89 (ADHK)',
        'TARGET IK TUJUAN RPJMD' => '5,7-6,6
81,34 (ADHB) / 47 (ADHK)',
        'SATUAN IK TUJUAN RPJMD' => 'Persen
Juta Rupiah',
        'OPD IK TUJUAN RPJMD' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH
BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'SASARAN RPJMD' => 'Meningkatkan Ketersediaan Lapangan Pekerjaan',
        'IK SASARAN RPJMD' => 'Tingkat Pengangguran Terbuka
Pertumbuhan UMKM/IKM',
        'BASELINE IK SASARAN RPJMD' => '5,58
2,17',
        'TARGET IK SASARAN RPJMD' => '5
3,2',
        'SATUAN IK SASARAN RPJMD' => 'Persen
Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA
DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'PROGRAM PRIORITAS' => 'Program Penyediaan dan Pengembangan Prasarana Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Distribusi dan Kualitas Prasarana Pertanian',
        'IK PROGRAM' => 'Produksi Sektor Perkebunan (Sawit)',
        'BASELINE IK PROGRAM' => '16518,16',
        'TARGET IK PROGRAM' => '18591,335',
        'SATUAN IK PROGRAM' => 'Ha',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERKEBUNAN DAN PETERNAKAN',
    ],
    264 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Pemanfaatan Lahan untuk Pengembangan Sumber Daya Alam yang Mendukung Perekonomian Masyarakat',
        'IK SASARAN RPJMD' => 'Jumlah Lahan yang Dimanfaatkan untuk Persawahan/Perkebunan/Pengembalaan/Budidaya Perairan',
        'BASELINE IK SASARAN RPJMD' => '82298,22',
        'TARGET IK SASARAN RPJMD' => '82800',
        'SATUAN IK SASARAN RPJMD' => 'Ha',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'PROGRAM PRIORITAS' => 'Program Penyuluhan Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kapasitas SDM Bidang Penyuluhan Pertanian',
        'IK PROGRAM' => 'Persentase Kelompok Tani Perkebunan dan Peternakan yang Aktif Dibina',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Komoditi',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERKEBUNAN DAN PETERNAKAN',
    ],
    265 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Diversifikasi Produk Pertanian',
        'IK SASARAN RPJMD' => 'Jumlah Variasi Komoditi Pertanian',
        'BASELINE IK SASARAN RPJMD' => '19',
        'TARGET IK SASARAN RPJMD' => '24',
        'SATUAN IK SASARAN RPJMD' => 'Komoditi',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'PROGRAM PRIORITAS' => 'Program Penyuluhan Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kapasitas SDM Bidang Penyuluhan Pertanian',
        'IK PROGRAM' => 'Persentase Kelompok Tani Perkebunan dan Peternakan yang Aktif Dibina',
        'BASELINE IK PROGRAM' => '100',
        'TARGET IK PROGRAM' => '100',
        'SATUAN IK PROGRAM' => 'Komoditi',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERKEBUNAN DAN PETERNAKAN',
    ],
    266 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Ketahanan Pangan Daerah',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Pangan (IKP)',
        'BASELINE IK SASARAN RPJMD' => '78,27',
        'TARGET IK SASARAN RPJMD' => '79,7',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PANGAN',
        'PROGRAM PRIORITAS' => 'Program Penyediaan dan Pengembangan Sarana Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Distribusi dan Kualitas Sarana Pertanian',
        'IK PROGRAM' => 'Jumlah Populasi Ternak Sapi',
        'BASELINE IK PROGRAM' => '9611',
        'TARGET IK PROGRAM' => '10817',
        'SATUAN IK PROGRAM' => 'Ton/Ha',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERKEBUNAN DAN PETERNAKAN',
    ],
    267 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 5 : Optimalisasi Pemanfaatan Sumber Daya Alam dengan Memperhatikan Ketahanan Bencana dan Kelestarian Lingkungan Hidup',
        'TUJUAN RPJMD' => 'Terwujudnya Pemanfaatan Sumber Daya Alam secara Optimal dan Berkelanjutan untuk Kesejahteraan Masyarakat',
        'IK TUJUAN RPJMD' => 'Indeks Ekonomi Hijau Daerah
Indeks Ekonomi Biru Indonesia (IEI)
PDRB Pertanian, Perikanan dan Kehutanan (ADHK)',
        'BASELINE IK TUJUAN RPJMD' => '63,58
54
2087,36',
        'TARGET IK TUJUAN RPJMD' => '69,48
164,5
2600',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks
Indeks
Milyar Rupiah',
        'OPD IK TUJUAN RPJMD' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA
DINAS KELAUTAN DAN PERIKANAN
DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'SASARAN RPJMD' => 'Meningkatkan Ketahanan Pangan Daerah',
        'IK SASARAN RPJMD' => 'Indeks Ketahanan Pangan (IKP)',
        'BASELINE IK SASARAN RPJMD' => '78,27',
        'TARGET IK SASARAN RPJMD' => '79,7',
        'SATUAN IK SASARAN RPJMD' => 'Indeks',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PANGAN',
        'PROGRAM PRIORITAS' => 'Program Penyediaan dan Pengembangan Prasarana Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Distribusi dan Kualitas Prasarana Pertanian',
        'IK PROGRAM' => 'Produksi Sektor Perkebunan (Sawit)',
        'BASELINE IK PROGRAM' => '16518,16',
        'TARGET IK PROGRAM' => '18591,335',
        'SATUAN IK PROGRAM' => 'Ha',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERKEBUNAN DAN PETERNAKAN',
    ],
    268 => [
        'VISI' => 'TERWUJUDNYA ACEH BARAT MAJU MELALUI PEMBANGUNAN BERKELANJUTAN YANG BERLANDASKAN SYARIAT ISLAM',
        'MISI' => 'Misi 7 : Meningkatkan Peran Pemuda dalam Upaya Mewujudkan Percepatan Pembangunan',
        'TUJUAN RPJMD' => 'Terwujudnya Peningkatan Pembangunan di Bidang Kepemudaan',
        'IK TUJUAN RPJMD' => 'Indeks Pembangunan Pemuda (IPP)',
        'BASELINE IK TUJUAN RPJMD' => '56,33',
        'TARGET IK TUJUAN RPJMD' => '56,5',
        'SATUAN IK TUJUAN RPJMD' => 'Indeks',
        'OPD IK TUJUAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'SASARAN RPJMD' => 'Memperkuat Partisipasi Pemuda dalam Pembangunan Sosial Ekonomi',
        'IK SASARAN RPJMD' => 'Persentase Wirausaha Muda',
        'BASELINE IK SASARAN RPJMD' => 'N/A',
        'TARGET IK SASARAN RPJMD' => '71',
        'SATUAN IK SASARAN RPJMD' => 'Persen',
        'PERIODE PENILAIAN' => '2025-2029',
        'OPD IK SASARAN RPJMD' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'PROGRAM PRIORITAS' => 'Program Penyediaan dan Pengembangan Sarana Pertanian',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Distribusi dan Kualitas Prasarana Pertanian',
        'IK PROGRAM' => 'Jumlah Populasi Ternak Sapi',
        'BASELINE IK PROGRAM' => '9611',
        'TARGET IK PROGRAM' => '11142',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERKEBUNAN DAN PETERNAKAN',
    ],
    269 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    ],
    270 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS PERHUBUNGAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERHUBUNGAN',
    ],
    271 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS PERHUBUNGAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERHUBUNGAN',
    ],
    272 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA',
    ],
    273 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS TRANSMIGRASI DAN TENAGA KERJA',
    ],
    274 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS SOSIAL',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS SOSIAL',
    ],
    275 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS SOSIAL',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS SOSIAL',
    ],
    276 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN',
    ],
    277 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERUMAHAN RAKYAT DAN KAWASAN PERMUKIMAN',
    ],
    278 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
    ],
    279 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANIAN TANAMAN PANGAN DAN HORTIKULTURA',
    ],
    280 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS KELAUTAN DAN PERIKANAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KELAUTAN DAN PERIKANAN',
    ],
    281 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS KELAUTAN DAN PERIKANAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KELAUTAN DAN PERIKANAN',
    ],
    282 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS PANGAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PANGAN',
    ],
    283 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS PANGAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PANGAN',
    ],
    284 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    285 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERDAGANGAN PERINDUSTRIAN KOPERASI DAN USAHA KECIL DAN MENENGAH',
    ],
    286 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
    ],
    287 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PARIWISATA PEMUDA DAN OLAHRAGA',
    ],
    288 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU',
    ],
    289 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU',
    ],
    290 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
    ],
    291 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN MASYARAKAT DAN GAMPONG',
    ],
    292 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN',
    ],
    293 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KOMUNIKASI INFORMATIKA DAN PERSANDIAN',
    ],
    294 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
    ],
    295 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA',
    ],
    296 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
    ],
    297 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PENGELOLAAN KEUANGAN DAERAH',
    ],
    298 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'SEKRETARIAT DAERAH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT DAERAH',
    ],
    299 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'SEKRETARIAT DAERAH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT DAERAH',
    ],
    300 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
    ],
    301 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PERENCANAAN PEMBANGUNAN DAERAH',
    ],
    302 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS SYARIAT ISLAM',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS SYARIAT ISLAM',
    ],
    303 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS SYARIAT ISLAM',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS SYARIAT ISLAM',
    ],
    304 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS PENDIDIKAN DAYAH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENDIDIKAN DAYAH',
    ],
    305 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS PENDIDIKAN DAYAH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENDIDIKAN DAYAH',
    ],
    306 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
    ],
    307 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEKERJAAN UMUM DAN PENATAAN RUANG',
    ],
    308 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS LINGKUNGAN HIDUP',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS LINGKUNGAN HIDUP',
    ],
    309 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS LINGKUNGAN HIDUP',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS LINGKUNGAN HIDUP',
    ],
    310 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'BADAN PENANGGULANGAN BENCANA DAERAH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PENANGGULANGAN BENCANA DAERAH',
    ],
    311 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'BADAN PENANGGULANGAN BENCANA DAERAH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN PENANGGULANGAN BENCANA DAERAH',
    ],
    312 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'SEKRETARIAT MAJELIS PENDIDIKAN DAERAH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT MAJELIS PENDIDIKAN DAERAH',
    ],
    313 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'SEKRETARIAT MAJELIS PENDIDIKAN DAERAH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT MAJELIS PENDIDIKAN DAERAH',
    ],
    314 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS KESEHATAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KESEHATAN',
    ],
    315 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS KESEHATAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KESEHATAN',
    ],
    316 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'SATUAN POLISI PAMONG PRAJA DAN WILAYATUL HISBAH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SATUAN POLISI PAMONG PRAJA DAN WILAYATUL HISBAH',
    ],
    317 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'SATUAN POLISI PAMONG PRAJA DAN WILAYATUL HISBAH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SATUAN POLISI PAMONG PRAJA DAN WILAYATUL HISBAH',
    ],
    318 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS PERTANAHAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANAHAN',
    ],
    319 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS PERTANAHAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERTANAHAN',
    ],
    320 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL',
    ],
    321 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL',
    ],
    322 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
    ],
    323 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PEMBERDAYAAN PEREMPUAN PERLINDUNGAN ANAK DAN KELUARGA BERENCANA',
    ],
    324 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS PERKEBUNAN DAN PETERNAKAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERKEBUNAN DAN PETERNAKAN',
    ],
    325 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS PERKEBUNAN DAN PETERNAKAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERKEBUNAN DAN PETERNAKAN',
    ],
    326 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'SEKRETARIAT DPRK',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT DPRK',
    ],
    327 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'SEKRETARIAT DPRK',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT DPRK',
    ],
    328 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'INSPEKTORAT',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'INSPEKTORAT',
    ],
    329 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'INSPEKTORAT',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'INSPEKTORAT',
    ],
    330 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'BADAN KESATUAN BANGSA DAN POLITIK',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KESATUAN BANGSA DAN POLITIK',
    ],
    331 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'BADAN KESATUAN BANGSA DAN POLITIK',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BADAN KESATUAN BANGSA DAN POLITIK',
    ],
    332 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'SEKRETARIAT MAJELIS PEMUSYAWARATAN ULAMA',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT MAJELIS PEMUSYAWARATAN ULAMA',
    ],
    333 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'SEKRETARIAT MAJELIS PEMUSYAWARATAN ULAMA',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT MAJELIS PEMUSYAWARATAN ULAMA',
    ],
    334 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'SEKRETARIAT BAITUL MAL KABUPATEN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT BAITUL MAL KABUPATEN',
    ],
    335 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'SEKRETARIAT BAITUL MAL KABUPATEN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT BAITUL MAL KABUPATEN',
    ],
    336 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'SEKRETARIAT MAJELIS ADAT ACEH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT MAJELIS ADAT ACEH',
    ],
    337 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'SEKRETARIAT MAJELIS ADAT ACEH',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'SEKRETARIAT MAJELIS ADAT ACEH',
    ],
    338 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS PERPUSTAKAAN DAN KEARSIPAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERPUSTAKAAN DAN KEARSIPAN',
    ],
    339 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'DINAS PERPUSTAKAAN DAN KEARSIPAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PERPUSTAKAAN DAN KEARSIPAN',
    ],
    340 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'KECAMATAN JOHAN PAHLAWAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN JOHAN PAHLAWAN',
    ],
    341 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'KECAMATAN JOHAN PAHLAWAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN JOHAN PAHLAWAN',
    ],
    342 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'KECAMATAN KAWAY XVI',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN KAWAY XVI',
    ],
    343 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'KECAMATAN KAWAY XVI',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN KAWAY XVI',
    ],
    344 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'KECAMATAN MEUREUBO',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN MEUREUBO',
    ],
    345 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'KECAMATAN MEUREUBO',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN MEUREUBO',
    ],
    346 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'KECAMATAN WOYLA',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA',
    ],
    347 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'KECAMATAN WOYLA',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA',
    ],
    348 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'KECAMATAN WOYLA TIMUR',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA TIMUR',
    ],
    349 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'KECAMATAN WOYLA TIMUR',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA TIMUR',
    ],
    350 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'KECAMATAN WOYLA BARAT',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA BARAT',
    ],
    351 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'KECAMATAN WOYLA BARAT',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN WOYLA BARAT',
    ],
    352 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'KECAMATAN PANTE CEUREUMEN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN PANTE CEUREUMEN',
    ],
    353 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'KECAMATAN PANTE CEUREUMEN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN PANTE CEUREUMEN',
    ],
    354 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'KECAMATAN PANTON REU',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN PANTON REU',
    ],
    355 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'KECAMATAN PANTON REU',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN PANTON REU',
    ],
    356 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'KECAMATAN ARONGAN LAMBALEK',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN ARONGAN LAMBALEK',
    ],
    357 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'KECAMATAN ARONGAN LAMBALEK',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN ARONGAN LAMBALEK',
    ],
    358 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'KECAMATAN SUNGAI MAS',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN SUNGAI MAS',
    ],
    359 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'KECAMATAN SUNGAI MAS',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN SUNGAI MAS',
    ],
    360 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'KECAMATAN SAMATIGA',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN SAMATIGA',
    ],
    361 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'KECAMATAN SAMATIGA',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN SAMATIGA',
    ],
    362 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'KECAMATAN BUBON',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN BUBON',
    ],
    363 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'KECAMATAN BUBON',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'KECAMATAN BUBON',
    ],
    364 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'BLUD RSUD CUT NYAK DHIEN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BLUD RSUD CUT NYAK DHIEN',
    ],
    365 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Maturitas SPIP',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '2',
        'SATUAN IK PROGRAM' => 'Indeks',
        'OPD IK PROGRAM' => 'BLUD RSUD CUT NYAK DHIEN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BLUD RSUD CUT NYAK DHIEN',
    ],
    366 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemenuhan Upaya Kesehatan Perorangan dan Upaya Kesehatan Masyarakat',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Kesehatan Perorangan dan Masyarakat',
        'IK PROGRAM' => 'Akreditasi Rumah Sakit',
        'BASELINE IK PROGRAM' => 'Paripurna',
        'TARGET IK PROGRAM' => 'Paripurna',
        'SATUAN IK PROGRAM' => 'Kategori',
        'OPD IK PROGRAM' => 'BLUD RSUD CUT NYAK DHIEN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BLUD RSUD CUT NYAK DHIEN',
    ],
    367 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemenuhan Upaya Kesehatan Perorangan dan Upaya Kesehatan Masyarakat',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Kesehatan Perorangan dan Masyarakat',
        'IK PROGRAM' => 'Kelas Rumah Sakit',
        'BASELINE IK PROGRAM' => 'B Pendidikan',
        'TARGET IK PROGRAM' => 'B Pendidikan',
        'SATUAN IK PROGRAM' => 'Kategori',
        'OPD IK PROGRAM' => 'BLUD RSUD CUT NYAK DHIEN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BLUD RSUD CUT NYAK DHIEN',
    ],
    368 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemenuhan Upaya Kesehatan Perorangan dan Upaya Kesehatan Masyarakat',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Kesehatan Perorangan dan Masyarakat',
        'IK PROGRAM' => 'Indeks Kepuasan Masyarakat Terhadap Pelayanan RSUD Cut Nyak Dhien Meulaboh',
        'BASELINE IK PROGRAM' => '76,53',
        'TARGET IK PROGRAM' => '86,00',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD IK PROGRAM' => 'BLUD RSUD CUT NYAK DHIEN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BLUD RSUD CUT NYAK DHIEN',
    ],
    369 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemenuhan Upaya Kesehatan Perorangan dan Upaya Kesehatan Masyarakat',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Kesehatan Perorangan dan Masyarakat',
        'IK PROGRAM' => 'Persentase Kelengkapan Sarana, Prasarana dan Alat Kesehatan (SPA) Sesuai Standar',
        'BASELINE IK PROGRAM' => '78,50',
        'TARGET IK PROGRAM' => '88,50',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD IK PROGRAM' => 'BLUD RSUD CUT NYAK DHIEN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BLUD RSUD CUT NYAK DHIEN',
    ],
    370 => [
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Pemenuhan Upaya Kesehatan Perorangan dan Upaya Kesehatan Masyarakat',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Kesehatan Perorangan dan Masyarakat',
        'IK PROGRAM' => 'Rasio SDM Kesehatan Terhadap Standar Pelayanan Minimal',
        'BASELINE IK PROGRAM' => 'N/A',
        'TARGET IK PROGRAM' => '88,00',
        'SATUAN IK PROGRAM' => 'Persen',
        'OPD IK PROGRAM' => 'BLUD RSUD CUT NYAK DHIEN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'BLUD RSUD CUT NYAK DHIEN',
    ],
    371 => [
        'MISI' => 'Mengembangkan dan Melestarikan Budaya Aceh',
        'PERIODE PENILAIAN' => '2025-2029',
        'PROGRAM PRIORITAS' => 'Program Penunjang Urusan Pemerintahan Daerah Kabupaten/Kota',
        'OUTCOME PROGRAM PRIORITAS' => 'Meningkatnya Kualitas Layanan Pendukung Administrasi Pemerintahan',
        'IK PROGRAM' => 'Jumlah Inovasi',
        'BASELINE IK PROGRAM' => '1',
        'TARGET IK PROGRAM' => '1',
        'SATUAN IK PROGRAM' => 'Inovasi',
        'OPD IK PROGRAM' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
        'OPD PENANGGUNGJAWAB PROGRAM' => 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    ],
];
