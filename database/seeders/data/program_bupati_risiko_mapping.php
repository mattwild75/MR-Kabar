<?php

/**
 * Pemetaan analitis: 258 risiko teridentifikasi tahun 2025 (IRS Pemda/IRS
 * PD/IRO PD, tabel gaya #1 SPASI DAN KAPITAL) -> 100 Program Pembangunan
 * Bupati (Tabel 3.7 RPJM Kabupaten Aceh Barat 2025-2029). Dipakai
 * ProgramBupatiRisikoSeeder utk mengisi tabel pivot program_bupati_risiko
 * — dasar halaman "Miscellaneous > Risiko 100 Program Bupati".
 *
 * key = nomor program (1-100, WAJIB semua ada meski array kosong []).
 * value = list risiko relevan: ['tipe' => 'irs_pemda'|'irs_pd'|'iro_pd', 'id' => int].
 *
 * Pemetaan BUKAN sekadar mencocokkan nama OPD secara mekanis — tiap
 * pasangan dipilih berdasarkan kecocokan SUBSTANSI antara uraian risiko
 * dan tujuan program (mis. risiko "Wabah/Penyakit Menular" dikaitkan ke
 * program promosi/pelayanan kesehatan, BUKAN ke semua program Dinas
 * Kesehatan tanpa pandang isi). Satu risiko boleh terkait >1 program;
 * program yang OPD-nya tidak punya risiko relevan di data dibiarkan array
 * kosong (BUKAN dipaksakan) — 88 dari 100 program mendapat >=1 risiko,
 * 237 dari 258 risiko berhasil terpetakan (21 sisanya sengaja dilewati:
 * urusan Pertanahan/Dukcapil/Perpustakaan tidak tersentuh satupun dari
 * 100 program Bupati).
 */
return [
    // ===== MISI 1 =====
    1 => [ // Bantuan Dana Keluarga Pasien Dirujuk (BPKD, RSUD) -> kapasitas rujukan/kesehatan
        ['tipe' => 'irs_pd', 'id' => 20],
        ['tipe' => 'iro_pd', 'id' => 17],
    ],
    2 => [ // Rumah Singgah (Dinkes)
        ['tipe' => 'irs_pd', 'id' => 23],
    ],
    3 => [ // Ambulan Gratis (Dinkes)
        ['tipe' => 'iro_pd', 'id' => 16],
        ['tipe' => 'irs_pd', 'id' => 22],
    ],
    4 => [ // Sarpras & Alkes (Dinkes)
        ['tipe' => 'irs_pd', 'id' => 22],
        ['tipe' => 'iro_pd', 'id' => 16],
    ],
    5 => [ // Percepatan RS Regional (Dinkes)
        ['tipe' => 'iro_pd', 'id' => 17],
        ['tipe' => 'iro_pd', 'id' => 19],
    ],
    6 => [ // Promosi Kesehatan Berkualitas (Dinkes)
        ['tipe' => 'irs_pd', 'id' => 23],
        ['tipe' => 'iro_pd', 'id' => 22],
        ['tipe' => 'iro_pd', 'id' => 29],
        ['tipe' => 'iro_pd', 'id' => 30],
        ['tipe' => 'iro_pd', 'id' => 31],
    ],
    7 => [ // Dokter Spesialis (BKPSDM)
        ['tipe' => 'irs_pd', 'id' => 19],
        ['tipe' => 'iro_pd', 'id' => 21],
    ],
    8 => [ // Dokter Masuk Rumah (Dinkes)
        ['tipe' => 'irs_pd', 'id' => 19],
        ['tipe' => 'iro_pd', 'id' => 21],
    ],
    9 => [ // Pemeriksaan & Perawatan Gratis di Rumah (Dinkes)
        ['tipe' => 'irs_pd', 'id' => 21],
        ['tipe' => 'iro_pd', 'id' => 17],
        ['tipe' => 'iro_pd', 'id' => 23],
    ],
    10 => [ // Pendampingan Ibu Hamil & 1000 HPK (Dinkes)
        ['tipe' => 'irs_pd', 'id' => 88],
        ['tipe' => 'iro_pd', 'id' => 126],
        ['tipe' => 'iro_pd', 'id' => 134],
        ['tipe' => 'iro_pd', 'id' => 137],
        ['tipe' => 'iro_pd', 'id' => 138],
    ],
    11 => [ // Makanan Bergizi Balita (Dinkes)
        ['tipe' => 'irs_pd', 'id' => 88],
        ['tipe' => 'iro_pd', 'id' => 141],
    ],
    12 => [ // Kualitas Pelayanan BLUD RSCD (Dinkes)
        ['tipe' => 'irs_pd', 'id' => 22],
        ['tipe' => 'iro_pd', 'id' => 16],
        ['tipe' => 'iro_pd', 'id' => 18],
        ['tipe' => 'iro_pd', 'id' => 20],
        ['tipe' => 'iro_pd', 'id' => 24],
        ['tipe' => 'iro_pd', 'id' => 25],
        ['tipe' => 'iro_pd', 'id' => 26],
        ['tipe' => 'iro_pd', 'id' => 27],
        ['tipe' => 'iro_pd', 'id' => 28],
    ],
    13 => [ // Peningkatan Kompetensi Guru (Disdikbud)
        ['tipe' => 'iro_pd', 'id' => 167],
        ['tipe' => 'iro_pd', 'id' => 168],
        ['tipe' => 'irs_pd', 'id' => 68],
    ],
    14 => [ // Pendamping Guru (Disdikbud)
        ['tipe' => 'iro_pd', 'id' => 168],
    ],
    15 => [ // Sarpras Sekolah (Disdikbud)
        ['tipe' => 'iro_pd', 'id' => 111],
    ],
    16 => [// Bus Gratis (Dishub)
    ],
    17 => [ // Bimbel Gratis SMP/SMA (Disdikbud)
        ['tipe' => 'iro_pd', 'id' => 167],
    ],
    18 => [ // Beasiswa Siswa Miskin Berprestasi (Disdikbud, Setda)
        ['tipe' => 'irs_pd', 'id' => 30],
    ],
    19 => [ // Pemerataan Guru (Disdikbud)
        ['tipe' => 'iro_pd', 'id' => 168],
    ],
    20 => [ // Bantuan Alat Sekolah Keluarga Miskin (Disdikbud)
        ['tipe' => 'irs_pd', 'id' => 24],
    ],
    21 => [ // Tunjangan Guru & Nakes Terpencil (Disdikbud)
        ['tipe' => 'irs_pd', 'id' => 19],
        ['tipe' => 'iro_pd', 'id' => 21],
    ],
    22 => [ // Sekolah Unggul dan Merata (Disdikbud)
        ['tipe' => 'iro_pd', 'id' => 167],
        ['tipe' => 'iro_pd', 'id' => 168],
        ['tipe' => 'iro_pd', 'id' => 166],
        ['tipe' => 'iro_pd', 'id' => 169],
    ],
    23 => [ // Premi Asuransi Ketenagakerjaan Pekerja Rentan (Disnakertrans)
        ['tipe' => 'iro_pd', 'id' => 88],
        ['tipe' => 'iro_pd', 'id' => 89],
    ],
    24 => [ // Santunan Sosial Masyarakat Miskin (Dinsos)
        ['tipe' => 'irs_pd', 'id' => 24],
        ['tipe' => 'iro_pd', 'id' => 32],
        ['tipe' => 'iro_pd', 'id' => 33],
        ['tipe' => 'iro_pd', 'id' => 39],
        ['tipe' => 'iro_pd', 'id' => 34],
        ['tipe' => 'iro_pd', 'id' => 35],
        ['tipe' => 'iro_pd', 'id' => 36],
        ['tipe' => 'iro_pd', 'id' => 37],
        ['tipe' => 'iro_pd', 'id' => 38],
        ['tipe' => 'iro_pd', 'id' => 129],
        ['tipe' => 'iro_pd', 'id' => 131],
        ['tipe' => 'iro_pd', 'id' => 132],
        ['tipe' => 'iro_pd', 'id' => 133],
        ['tipe' => 'iro_pd', 'id' => 135],
        ['tipe' => 'iro_pd', 'id' => 136],
    ],
    25 => [// Subsidi Energi Terjangkau (Perkim)
    ],
    26 => [ // BBM Bersubsidi Abang Becak (Dinsos)
        ['tipe' => 'irs_pd', 'id' => 24],
        ['tipe' => 'iro_pd', 'id' => 39],
    ],
    27 => [ // Kelompok Usaha Ibu-ibu (Dinsos, Pertanian, Peternakan, Perikanan, DPMG)
        ['tipe' => 'irs_pd', 'id' => 89],
        ['tipe' => 'iro_pd', 'id' => 85],
        ['tipe' => 'iro_pd', 'id' => 151],
        ['tipe' => 'iro_pd', 'id' => 127],
        ['tipe' => 'iro_pd', 'id' => 128],
        ['tipe' => 'iro_pd', 'id' => 130],
    ],
    28 => [ // Akses Permodalan Petani/Peternak/Nelayan/UKM (DKP, Perindagkop)
        ['tipe' => 'iro_pd', 'id' => 98],
        ['tipe' => 'iro_pd', 'id' => 153],
        ['tipe' => 'iro_pd', 'id' => 154],
        ['tipe' => 'irs_pd', 'id' => 52],
        ['tipe' => 'iro_pd', 'id' => 73],
        ['tipe' => 'iro_pd', 'id' => 75],
    ],
    29 => [ // Bantuan Sarana Produksi Pertanian/Perikanan/Peternakan
        ['tipe' => 'irs_pd', 'id' => 43],
        ['tipe' => 'iro_pd', 'id' => 79],
        ['tipe' => 'irs_pd', 'id' => 44],
        ['tipe' => 'irs_pd', 'id' => 45],
        ['tipe' => 'irs_pd', 'id' => 40],
        ['tipe' => 'irs_pd', 'id' => 41],
        ['tipe' => 'irs_pd', 'id' => 42],
        ['tipe' => 'iro_pd', 'id' => 67],
        ['tipe' => 'iro_pd', 'id' => 68],
        ['tipe' => 'iro_pd', 'id' => 69],
        ['tipe' => 'iro_pd', 'id' => 70],
        ['tipe' => 'iro_pd', 'id' => 71],
    ],
    30 => [ // Training Tenaga Kerja & Pelaku Usaha (Disnakertrans, Disparpora, Perindagkop, DKP)
        ['tipe' => 'irs_pd', 'id' => 60],
        ['tipe' => 'iro_pd', 'id' => 86],
        ['tipe' => 'iro_pd', 'id' => 87],
        ['tipe' => 'iro_pd', 'id' => 91],
    ],
    31 => [ // Kerja Sama Dunia Usaha Penyerapan Tenaga Kerja (Disnakertrans)
        ['tipe' => 'irs_pd', 'id' => 61],
        ['tipe' => 'iro_pd', 'id' => 88],
        ['tipe' => 'iro_pd', 'id' => 90],
    ],
    32 => [ // Kemitraan Pemasaran Produk UKM/IKM/Pertanian (Perindagkop)
        ['tipe' => 'irs_pd', 'id' => 62],
        ['tipe' => 'irs_pd', 'id' => 52],
        ['tipe' => 'irs_pd', 'id' => 53],
        ['tipe' => 'irs_pd', 'id' => 54],
        ['tipe' => 'irs_pd', 'id' => 55],
    ],
    33 => [ // Investasi Perikanan/Pertanian/Peternakan/Pariwisata/Pendidikan (DPMPTSP)
        ['tipe' => 'iro_pd', 'id' => 153],
        ['tipe' => 'iro_pd', 'id' => 154],
        ['tipe' => 'irs_pd', 'id' => 98],
        ['tipe' => 'irs_pd', 'id' => 99],
    ],
    34 => [ // Proyek Pemerintah Tenaga Lokal Min. 30% (Disnakertrans)
        ['tipe' => 'irs_pd', 'id' => 63],
    ],
    35 => [ // Penguatan BUMG (DPMG)
        ['tipe' => 'iro_pd', 'id' => 149],
        ['tipe' => 'iro_pd', 'id' => 151],
    ],
    36 => [ // Ekonomi Kreatif untuk Kesejahteraan (Disparpora)
        ['tipe' => 'irs_pemda', 'id' => 37],
        ['tipe' => 'irs_pemda', 'id' => 38],
        ['tipe' => 'irs_pd', 'id' => 59],
        ['tipe' => 'iro_pd', 'id' => 85],
    ],
    37 => [ // Koperasi Petani (Perindagkop)
        ['tipe' => 'irs_pd', 'id' => 39],
        ['tipe' => 'iro_pd', 'id' => 66],
    ],
    38 => [ // Subsidi Transportasi Komoditi Tertentu (Dinas Pangan)
        ['tipe' => 'iro_pd', 'id' => 139],
        ['tipe' => 'irs_pd', 'id' => 90],
        ['tipe' => 'irs_pd', 'id' => 91],
        ['tipe' => 'iro_pd', 'id' => 140],
        ['tipe' => 'iro_pd', 'id' => 142],
        ['tipe' => 'iro_pd', 'id' => 144],
    ],
    39 => [ // Pasar Murah / Operasi Pasar Murah (Perindagkop)
        ['tipe' => 'irs_pd', 'id' => 39],
        ['tipe' => 'iro_pd', 'id' => 139],
    ],

    // ===== MISI 2 (Tata Kelola) =====
    40 => [ // Pemerintahan Bersih, Transparan, Akuntabel (Setda)
        ['tipe' => 'irs_pemda', 'id' => 33],
        ['tipe' => 'irs_pemda', 'id' => 35],
        ['tipe' => 'irs_pd', 'id' => 30],
        ['tipe' => 'iro_pd', 'id' => 46],
        ['tipe' => 'irs_pd', 'id' => 83],
        ['tipe' => 'iro_pd', 'id' => 112],
        ['tipe' => 'iro_pd', 'id' => 113],
        ['tipe' => 'iro_pd', 'id' => 114],
        ['tipe' => 'irs_pd', 'id' => 107],
        ['tipe' => 'irs_pd', 'id' => 109],
        ['tipe' => 'irs_pd', 'id' => 110],
        ['tipe' => 'iro_pd', 'id' => 161],
        ['tipe' => 'iro_pd', 'id' => 162],
        ['tipe' => 'iro_pd', 'id' => 163],
    ],
    41 => [ // Satu Data Indonesia (Diskominfo)
        ['tipe' => 'irs_pd', 'id' => 39],
        ['tipe' => 'irs_pd', 'id' => 46],
        ['tipe' => 'iro_pd', 'id' => 143],
    ],
    42 => [ // Diklat ASN Profesional (BKPSDM)
        ['tipe' => 'irs_pd', 'id' => 36],
        ['tipe' => 'irs_pd', 'id' => 37],
        ['tipe' => 'iro_pd', 'id' => 61],
        ['tipe' => 'iro_pd', 'id' => 64],
    ],
    43 => [ // Sistem Merit Konsisten (BKPSDM)
        ['tipe' => 'irs_pd', 'id' => 37],
        ['tipe' => 'iro_pd', 'id' => 63],
        ['tipe' => 'iro_pd', 'id' => 62],
    ],
    44 => [ // Indikator Kinerja Jelas & Terukur (Setda)
        ['tipe' => 'irs_pemda', 'id' => 36],
        ['tipe' => 'irs_pd', 'id' => 25],
        ['tipe' => 'irs_pd', 'id' => 27],
        ['tipe' => 'iro_pd', 'id' => 45],
        ['tipe' => 'iro_pd', 'id' => 46],
        ['tipe' => 'irs_pemda', 'id' => 34],
        ['tipe' => 'irs_pd', 'id' => 28],
        ['tipe' => 'irs_pd', 'id' => 29],
        ['tipe' => 'iro_pd', 'id' => 40],
        ['tipe' => 'iro_pd', 'id' => 41],
        ['tipe' => 'iro_pd', 'id' => 42],
        ['tipe' => 'iro_pd', 'id' => 43],
        ['tipe' => 'iro_pd', 'id' => 44],
        ['tipe' => 'iro_pd', 'id' => 47],
    ],
    45 => [ // Akses Internet SPBE (Diskominfo)
        ['tipe' => 'irs_pd', 'id' => 26],
        ['tipe' => 'iro_pd', 'id' => 52],
    ],
    46 => [ // Peningkatan TPP ASN (BPKD)
        ['tipe' => 'iro_pd', 'id' => 49],
        ['tipe' => 'irs_pd', 'id' => 32],
        ['tipe' => 'iro_pd', 'id' => 48],
        ['tipe' => 'iro_pd', 'id' => 50],
        ['tipe' => 'iro_pd', 'id' => 51],
    ],
    47 => [ // Pendampingan Hukum Nelayan (Setda)
        ['tipe' => 'irs_pd', 'id' => 30],
        ['tipe' => 'irs_pd', 'id' => 38],
        ['tipe' => 'iro_pd', 'id' => 65],
    ],
    48 => [ // Optimalisasi Dana CSR (Bappeda)
        ['tipe' => 'irs_pd', 'id' => 31],
        ['tipe' => 'irs_pd', 'id' => 105],
        ['tipe' => 'irs_pd', 'id' => 111],
        ['tipe' => 'irs_pd', 'id' => 112],
        ['tipe' => 'irs_pd', 'id' => 113],
        ['tipe' => 'iro_pd', 'id' => 160],
        ['tipe' => 'iro_pd', 'id' => 164],
        ['tipe' => 'iro_pd', 'id' => 165],
        ['tipe' => 'iro_pd', 'id' => 170],
    ],
    49 => [ // Penguatan Pendamping Desa & PKH (DPMG)
        ['tipe' => 'iro_pd', 'id' => 150],
    ],
    50 => [ // Optimalisasi Dana Desa (DPMG)
        ['tipe' => 'iro_pd', 'id' => 149],
        ['tipe' => 'iro_pd', 'id' => 151],
    ],
    51 => [ // Insentif Kinerja Gampong (DPMG)
        ['tipe' => 'iro_pd', 'id' => 152],
    ],
    52 => [ // Siltap Aparatur Gampong (BPKD)
        ['tipe' => 'iro_pd', 'id' => 57],
        ['tipe' => 'iro_pd', 'id' => 49],
        ['tipe' => 'iro_pd', 'id' => 53],
    ],
    53 => [ // Produk Unggulan PKK (DPMG)
        ['tipe' => 'iro_pd', 'id' => 152],
    ],
    54 => [ // Kerjasama Stakeholder Pengelolaan PAD (BPKD)
        ['tipe' => 'irs_pd', 'id' => 35],
        ['tipe' => 'iro_pd', 'id' => 60],
        ['tipe' => 'irs_pd', 'id' => 33],
        ['tipe' => 'iro_pd', 'id' => 54],
        ['tipe' => 'iro_pd', 'id' => 55],
    ],
    55 => [ // Teknologi Informasi Pengelolaan PAD (BPKD)
        ['tipe' => 'irs_pd', 'id' => 35],
        ['tipe' => 'iro_pd', 'id' => 58],
        ['tipe' => 'iro_pd', 'id' => 60],
        ['tipe' => 'iro_pd', 'id' => 56],
    ],
    56 => [ // Optimalisasi Sumber PAD (BPKD)
        ['tipe' => 'irs_pd', 'id' => 35],
        ['tipe' => 'iro_pd', 'id' => 60],
        ['tipe' => 'irs_pd', 'id' => 34],
        ['tipe' => 'iro_pd', 'id' => 59],
    ],

    // ===== MISI 3 (Syariat Islam / Keagamaan) =====
    57 => [], // Pelatihan Fungsi Kemesjidan BKM (Dinas Syariat Islam)
    58 => [], // Majelis Taklim Berkala (Dinas Syariat Islam)
    59 => [], // Insentif Imum Chik & Guru TPA (Dinas Syariat Islam)
    60 => [], // Ketersediaan Tenaga Keagamaan (Dinas Syariat Islam)
    61 => [ // Muzakarah Ulama Dayah (Dinas Pendidikan Dayah)
        ['tipe' => 'irs_pemda', 'id' => 40],
        ['tipe' => 'iro_pd', 'id' => 93],
        ['tipe' => 'irs_pd', 'id' => 65],
        ['tipe' => 'irs_pd', 'id' => 68],
    ],
    62 => [ // Alumni Dayah Masuk Gampong (Dinas Pendidikan Dayah)
        ['tipe' => 'iro_pd', 'id' => 94],
        ['tipe' => 'iro_pd', 'id' => 96],
        ['tipe' => 'irs_pd', 'id' => 66],
    ],
    63 => [ // Satu Gampong Satu Da'i (Dinas Pendidikan Dayah)
        ['tipe' => 'iro_pd', 'id' => 96],
        ['tipe' => 'iro_pd', 'id' => 95],
        ['tipe' => 'irs_pd', 'id' => 64],
    ],
    64 => [ // Satgas Pencegahan Penyakit Masyarakat (DPMG)
        ['tipe' => 'irs_pd', 'id' => 106],
        ['tipe' => 'irs_pd', 'id' => 108],
        ['tipe' => 'irs_pd', 'id' => 82],
        ['tipe' => 'irs_pd', 'id' => 85],
    ],
    65 => [], // Mencetak Qari Internasional (Dinas Syariat Islam)
    66 => [ // Gerakan Maghrib Mengaji (Dinas Syariat Islam)
        ['tipe' => 'iro_pd', 'id' => 92],
        ['tipe' => 'irs_pd', 'id' => 84],
    ],

    // ===== MISI 4 (Infrastruktur) =====
    67 => [ // Sarpras Layanan Dasar Mantap (PUPR)
        ['tipe' => 'irs_pd', 'id' => 69],
        ['tipe' => 'irs_pd', 'id' => 77],
        ['tipe' => 'iro_pd', 'id' => 97],
        ['tipe' => 'iro_pd', 'id' => 107],
        ['tipe' => 'irs_pd', 'id' => 73],
        ['tipe' => 'irs_pd', 'id' => 74],
        ['tipe' => 'irs_pd', 'id' => 75],
        ['tipe' => 'irs_pd', 'id' => 76],
        ['tipe' => 'irs_pd', 'id' => 78],
        ['tipe' => 'iro_pd', 'id' => 101],
        ['tipe' => 'iro_pd', 'id' => 102],
        ['tipe' => 'iro_pd', 'id' => 103],
        ['tipe' => 'iro_pd', 'id' => 104],
        ['tipe' => 'iro_pd', 'id' => 105],
        ['tipe' => 'iro_pd', 'id' => 106],
    ],
    68 => [ // Drainase Perkotaan Meulaboh (PUPR)
        ['tipe' => 'irs_pd', 'id' => 72],
        ['tipe' => 'iro_pd', 'id' => 100],
        ['tipe' => 'irs_pd', 'id' => 71],
        ['tipe' => 'iro_pd', 'id' => 99],
    ],
    69 => [ // WC Rumah Tangga Miskin (PUPR)
        ['tipe' => 'irs_pd', 'id' => 80],
        ['tipe' => 'iro_pd', 'id' => 110],
        ['tipe' => 'iro_pd', 'id' => 108],
        ['tipe' => 'iro_pd', 'id' => 109],
    ],
    70 => [ // Normalisasi Saluran Lhueng Aneuk Ayeu (PUPR)
        ['tipe' => 'irs_pd', 'id' => 72],
        ['tipe' => 'iro_pd', 'id' => 100],
    ],
    71 => [ // Kolam Retensi Antisipasi Banjir (PUPR)
        ['tipe' => 'irs_pd', 'id' => 72],
        ['tipe' => 'iro_pd', 'id' => 100],
    ],
    72 => [ // Air Bersih Seluruh Wilayah (PUPR)
        ['tipe' => 'irs_pd', 'id' => 69],
        ['tipe' => 'iro_pd', 'id' => 97],
    ],
    73 => [ // Lampu Penerangan Jalan (Perkim)
        ['tipe' => 'irs_pd', 'id' => 81],
        ['tipe' => 'iro_pd', 'id' => 111],
    ],
    74 => [ // Percepatan Irigasi Lhok Guci (PUPR)
        ['tipe' => 'irs_pd', 'id' => 79],
        ['tipe' => 'iro_pd', 'id' => 107],
    ],

    // ===== MISI 5 (Pertanian, Lingkungan, Bencana) =====
    75 => [ // Pemberdayaan Kajreun Blang (Pertanian TPH)
        ['tipe' => 'iro_pd', 'id' => 149],
    ],
    76 => [], // Penyuluhan Pertanian (Pertanian TPH)
    77 => [ // Hilirisasi Komoditi Pertanian/Perikanan/Peternakan (DKP dkk)
        ['tipe' => 'irs_pd', 'id' => 43],
        ['tipe' => 'iro_pd', 'id' => 79],
    ],
    78 => [ // Pemberdayaan Keluarga Nelayan (DKP)
        ['tipe' => 'iro_pd', 'id' => 78],
        ['tipe' => 'iro_pd', 'id' => 73],
        ['tipe' => 'iro_pd', 'id' => 75],
    ],
    79 => [ // Fasilitasi Perizinan Nelayan (DKP)
        ['tipe' => 'irs_pd', 'id' => 49],
        ['tipe' => 'iro_pd', 'id' => 72],
        ['tipe' => 'irs_pd', 'id' => 48],
        ['tipe' => 'irs_pd', 'id' => 50],
        ['tipe' => 'irs_pd', 'id' => 51],
        ['tipe' => 'iro_pd', 'id' => 74],
        ['tipe' => 'iro_pd', 'id' => 77],
    ],
    80 => [ // Kawasan Sentra Pertanian/Peternakan (Peternakan, Pertanian TPH)
        ['tipe' => 'iro_pd', 'id' => 76],
    ],
    81 => [], // Cetak Sawah Baru (Pertanian TPH)
    82 => [ // Mekanisasi & Teknologi Pertanian (Pertanian TPH)
        ['tipe' => 'irs_pd', 'id' => 45],
        ['tipe' => 'iro_pd', 'id' => 76],
    ],
    83 => [ // Pengawasan Lingkungan Profesional (DLH)
        // KOREKSI (audit manual): iro_pd#93 SEBELUMNYA ikut disertakan di
        // sini — itu SALAH, iro_pd#93 = "Ketidaksesuaian Kurikulum dengan
        // Perkembangan Zaman" milik Dinas Pendidikan Dayah, TIDAK ada
        // hubungan substansi dengan pengawasan lingkungan (id 93 di
        // irs_pd vs iro_pd kebetulan sama, tapi baris & OPD-nya berbeda
        // total — lihat irs_pd#93 = "Pengelolaan Persampahan" DLH, yg
        // memang relevan). Dipindah ke #61 (Muzakarah Ulama Dayah).
        ['tipe' => 'irs_pd', 'id' => 93],
    ],
    84 => [ // Kemitraan Swasta Pengelolaan TPA Sampah (DLH)
        ['tipe' => 'irs_pd', 'id' => 93],
        ['tipe' => 'irs_pd', 'id' => 70],
        ['tipe' => 'iro_pd', 'id' => 98],
    ],
    85 => [ // Unit Layanan Sampah Gampong via BUMG (DPMG)
        ['tipe' => 'irs_pd', 'id' => 93],
    ],
    86 => [ // Adipura Kota Meulaboh (DLH)
        ['tipe' => 'irs_pd', 'id' => 93],
    ],
    87 => [ // Desa Tangguh Bencana & Sekolah Siaga Bencana (BPBD)
        ['tipe' => 'irs_pd', 'id' => 86],
        ['tipe' => 'irs_pd', 'id' => 87],
        ['tipe' => 'iro_pd', 'id' => 115],
        ['tipe' => 'iro_pd', 'id' => 120],
    ],
    88 => [// Lubang Biopori (Perkim)
    ],
    89 => [ // Sarpras Penanganan Bencana Memadai (BPBD)
        ['tipe' => 'irs_pd', 'id' => 87],
        ['tipe' => 'iro_pd', 'id' => 116],
        ['tipe' => 'iro_pd', 'id' => 117],
        ['tipe' => 'iro_pd', 'id' => 118],
        ['tipe' => 'iro_pd', 'id' => 119],
        ['tipe' => 'iro_pd', 'id' => 121],
        ['tipe' => 'iro_pd', 'id' => 122],
        ['tipe' => 'iro_pd', 'id' => 123],
        ['tipe' => 'iro_pd', 'id' => 124],
        ['tipe' => 'iro_pd', 'id' => 125],
    ],

    // ===== MISI 6 (Budaya) =====
    // KOREKSI (audit manual): iro_pd#168 ("Data kebutuhan pendidik dan
    // tenaga kependidikan tidak akurat") SEBELUMNYA dikaitkan ke sini —
    // itu SALAH, tidak ada hubungan substansi antara data kepegawaian
    // guru dengan pameran budaya. iro_pd#168 sudah cukup relevan di
    // program #13/14/19/22 (soal guru), tidak perlu dipaksakan ke sini.
    90 => [], // Pameran Budaya Aceh Berkala (Disdikbud)
    91 => [], // Sanggar Seni Representatif (Disdikbud)
    92 => [ // Kerjasama Stakeholder Adat & Budaya (Disparpora)
        ['tipe' => 'irs_pd', 'id' => 58],
        ['tipe' => 'iro_pd', 'id' => 83],
        ['tipe' => 'iro_pd', 'id' => 84],
    ],
    93 => [], // Museum & Galeri Seni Budaya (Disdikbud)

    // ===== MISI 7 (Pemuda & Olahraga) =====
    94 => [ // Forum Diskusi Pemuda / Kritik Dibayar (Disparpora)
        ['tipe' => 'irs_pemda', 'id' => 39],
        ['tipe' => 'irs_pd', 'id' => 56],
    ],
    95 => [ // Sarjana Membangun Gampong (DPMG)
        ['tipe' => 'iro_pd', 'id' => 150],
    ],
    96 => [ // Petani Millenial (Pertanian TPH)
        ['tipe' => 'iro_pd', 'id' => 149],
    ],
    97 => [ // Jejaring Pemantauan Minat/Bakat Olahraga (Disparpora)
        ['tipe' => 'irs_pd', 'id' => 57],
        ['tipe' => 'iro_pd', 'id' => 81],
        ['tipe' => 'iro_pd', 'id' => 82],
    ],
    98 => [ // Pelatih Profesional (Disparpora)
        ['tipe' => 'irs_pd', 'id' => 57],
        ['tipe' => 'iro_pd', 'id' => 81],
        ['tipe' => 'iro_pd', 'id' => 80],
    ],
    99 => [ // Sarpras Olahraga & Rekreasi (Disparpora, PUPR, Perindagkop)
        ['tipe' => 'iro_pd', 'id' => 81],
    ],
    100 => [ // Turnamen Piala Bupati Berkala (Disparpora)
        ['tipe' => 'irs_pd', 'id' => 57],
        ['tipe' => 'iro_pd', 'id' => 81],
    ],
];
