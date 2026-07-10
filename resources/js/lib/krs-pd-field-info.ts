// Teks info popover untuk form Tambah/Edit II_a_KRS_PD — mengikuti pola
// krs-field-info.ts (KRS_Pemda), diadaptasi ke terminologi Risiko Strategis
// Perangkat Daerah (dasarnya Renstra OPD, bukan RPJMD) dengan dua level
// tambahan (Kegiatan, SubKegiatan) yang tidak ada di KRS_Pemda.
export const KRS_PD_FIELD_INFO: Record<string, string> = {
  'SASARAN RPJMD': `Definisi: Sasaran RPJMD Pemda yang menjadi induk/rujukan bagi Tujuan Strategis Perangkat Daerah ini — BUKAN input bebas, melainkan pilihan dari Sasaran RPJMD yang sudah dibuat di halaman I_a_KRS_Pemda.

Fungsi: Menjaga keterhubungan (cascading) antara Risiko Strategis PD dengan Risiko Strategis Pemda, supaya diagram visualisasi bisa naik sampai ke VISI Pemda.

Cara mengisi: pilih dari daftar dropdown, bukan mengetik teks baru. Jika Sasaran RPJMD yang dibutuhkan belum ada di daftar, tambahkan dulu di halaman I_a_KRS_Pemda.`,

  'TUJUAN STRATEGIS PD': `Definisi: Hasil akhir yang ingin dicapai Perangkat Daerah dalam periode Renstra (5 tahun), turunan dari Sasaran RPJMD yang dirujuk.

Fungsi: Menjadi pedoman capaian Perangkat Daerah yang jelas dan terukur, selaras dengan Sasaran RPJMD Pemda.

Contoh:
Terwujudnya Tata Kelola Pemerintahan yang Baik serta Profesionalitas ASN yang Berkompetensi dan Berintegrasi Tinggi.`,

  'IK TUJUAN STRATEGIS PD': `Definisi: Ukuran keberhasilan pencapaian Tujuan Strategis Perangkat Daerah.

Fungsi: Menjadi "alat ukur" apakah Tujuan Strategis PD (yang masih bersifat umum) benar-benar tercapai.

Contoh:
Tujuan: Terwujudnya Tata Kelola Pemerintahan yang Baik.
IK Tujuan: Indeks Profesionalitas ASN.

Jika ada lebih dari 1 indikator, tulis satu indikator per baris (tekan Shift+Enter untuk baris baru).

Urutan baris harus sama dengan urutan baris di Baseline/Target/Satuan IK Tujuan (baris ke-1 harus pasangan, baris ke-2 harus pasangan, dst). Jika salah satu indikator tidak punya nilai di kolom lain, kosongkan barisnya saja (jangan digeser) supaya pasangannya tetap sejajar.`,

  'BASELINE IK TUJUAN STRATEGIS PD': `Definisi: Nilai awal dari indikator kinerja Tujuan Strategis PD pada tahun pertama penyusunan Renstra.

Fungsi: Menjadi titik tolak untuk mengukur kemajuan.

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Tujuan.

Baris harus sejajar dengan IK Tujuan yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya baseline.`,

  'TARGET IK TUJUAN STRATEGIS PD': `Definisi: Nilai yang ingin dicapai pada akhir periode Renstra (tahun ke-5).

Fungsi: Menjadi tolok ukur keberhasilan Perangkat Daerah jangka menengah.

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Tujuan.

Baris harus sejajar dengan IK Tujuan yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya target.`,

  'SATUAN IK TUJUAN STRATEGIS PD': `Definisi: Unit ukuran yang digunakan untuk indikator, agar jelas cara mengukurnya.

Jika ada lebih dari 1 nilai satuan IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Tujuan.

Baris harus sejajar dengan IK Tujuan yang bersangkutan.`,

  'SASARAN STRATEGIS PD': `Definisi: Hasil yang lebih spesifik, kuantitatif, dan dapat diukur dari Tujuan Strategis PD.

Fungsi: Menjadi indikator utama keberhasilan Perangkat Daerah.

Contoh:
Meningkatnya Pengetahuan, Keahlian dan Ketrampilan ASN.`,

  'IK SASARAN STRATEGIS PD': `Definisi: Ukuran keberhasilan pencapaian Sasaran Strategis PD (lebih spesifik dibanding Tujuan).

Contoh:
Sasaran: Meningkatnya Pengetahuan, Keahlian dan Ketrampilan ASN.
IK Sasaran: Nilai Norma Standar Prosedur dan Kriteria (NSPK).

Jika ada lebih dari 1 indikator, tulis satu indikator per baris (tekan Shift+Enter untuk baris baru).

Urutan baris harus sama dengan urutan baris di Baseline/Target/Satuan IK Sasaran. Jika salah satu indikator tidak punya nilai di kolom lain, kosongkan barisnya saja (jangan digeser) supaya pasangannya tetap sejajar.`,

  'BASELINE IK SASARAN STRATEGIS PD': `Definisi: Nilai awal indikator kinerja Sasaran Strategis PD pada tahun pertama penyusunan Renstra.

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Sasaran.

Baris harus sejajar dengan IK Sasaran yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya baseline.`,

  'TARGET IK SASARAN STRATEGIS PD': `Definisi: Nilai indikator yang ingin dicapai pada akhir periode Renstra (tahun ke-5).

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Sasaran.

Baris harus sejajar dengan IK Sasaran yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya target.`,

  'SATUAN IK SASARAN STRATEGIS PD': `Definisi: Unit ukuran indikator kinerja Sasaran Strategis PD.

Jika ada lebih dari 1 nilai satuan IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Sasaran.

Baris harus sejajar dengan IK Sasaran yang bersangkutan.`,

  'PROGRAM PD': `Definisi: Program Perangkat Daerah yang dipilih untuk mewujudkan Sasaran Strategis PD.

Fungsi: Menjadi fokus penggunaan anggaran Perangkat Daerah dan dasar penyusunan RKA/DPA tahunan.

Contoh:
Program Pengembangan Sumber Daya Manusia.`,

  'IK PROGRAM PD': `Definisi: Ukuran keberhasilan pencapaian dari Program PD.

Contoh:
Program: Program Pengembangan Sumber Daya Manusia.
IK Program: Persentase ASN yang mendapatkan Pengembangan Kompetensi Dasar, Manajerial dan Fungsional.

Jika ada lebih dari 1 indikator, tulis satu indikator per baris (tekan Shift+Enter untuk baris baru).

Urutan baris harus sama dengan urutan baris di Baseline/Target/Satuan IK Program. Jika salah satu indikator tidak punya nilai di kolom lain, kosongkan barisnya saja (jangan digeser) supaya pasangannya tetap sejajar.`,

  'BASELINE IK PROGRAM PD': `Definisi: Nilai awal indikator Program PD pada tahun pertama Renstra.

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Program.

Baris harus sejajar dengan IK Program yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya baseline.`,

  'TARGET IK PROGRAM PD': `Definisi: Nilai capaian indikator Program PD yang diharapkan pada akhir periode Renstra (tahun ke-5).

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Program.

Baris harus sejajar dengan IK Program yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya target.`,

  'SATUAN IK PROGRAM PD': `Definisi: Unit ukuran indikator Program PD yang dipakai agar jelas dan konsisten.

Jika ada lebih dari 1 nilai satuan IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Program.

Baris harus sejajar dengan IK Program yang bersangkutan.`,

  'KEGIATAN PD': `Definisi: Kegiatan di bawah Program PD, sesuai struktur Renstra OPD (level lebih rinci dibanding KRS_Pemda, yang berhenti di Program).

Fungsi: Menjadi rincian pelaksanaan Program PD.

Contoh:
Sertifikasi, Kelembagaan, Pengembangan Kompetensi Manajerial dan Fungsional.`,

  'IK KEGIATAN PD': `Definisi: Ukuran keberhasilan pencapaian dari Kegiatan PD.

Contoh:
Kegiatan: Sertifikasi, Kelembagaan, Pengembangan Kompetensi Manajerial dan Fungsional.
IK Kegiatan: Jumlah Dokumen dan Laporan Pelaksanaan Sertifikasi, Kelembagaan, Pengembangan Kompetensi Manajerial dan Fungsional.

Jika ada lebih dari 1 indikator, tulis satu indikator per baris (tekan Shift+Enter untuk baris baru).

Urutan baris harus sama dengan urutan baris di Baseline/Target/Satuan IK Kegiatan.`,

  'BASELINE IK KEGIATAN PD': `Definisi: Nilai awal indikator Kegiatan PD pada tahun pertama Renstra.

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Kegiatan.

Baris harus sejajar dengan IK Kegiatan yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya baseline.`,

  'TARGET IK KEGIATAN PD': `Definisi: Nilai capaian indikator Kegiatan PD yang diharapkan pada akhir periode Renstra.

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Kegiatan.

Baris harus sejajar dengan IK Kegiatan yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya target.`,

  'SATUAN IK KEGIATAN PD': `Definisi: Unit ukuran indikator Kegiatan PD yang dipakai agar jelas dan konsisten.

Jika ada lebih dari 1 nilai satuan IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Kegiatan.

Baris harus sejajar dengan IK Kegiatan yang bersangkutan.`,

  'SUBKEGIATAN PD': `Definisi: SubKegiatan di bawah Kegiatan PD — unit TERKECIL dalam hierarki Risiko Strategis PD, satu baris tabel data mewakili satu SubKegiatan.

Fungsi: Menjadi rincian pelaksanaan Kegiatan PD yang paling operasional.

Contoh:
Penyelenggaraan Pengembangan Kompetensi bagi Pimpinan Daerah, Jabatan Pimpinan Tinggi, Jabatan Fungsional, Kepemimpinan, dan Prajabatan.`,

  'IK SUBKEGIATAN PD': `Definisi: Ukuran keberhasilan pencapaian dari SubKegiatan PD.

Contoh:
SubKegiatan: Penyelenggaraan Pengembangan Kompetensi bagi Pimpinan Daerah.
IK SubKegiatan: Jumlah Laporan Hasil Penyelenggaraan Pengembangan Kompetensi bagi Pimpinan Daerah.`,

  'BASELINE IK SUBKEGIATAN PD': `Definisi: Nilai awal indikator SubKegiatan PD pada tahun pertama Renstra.

Contoh:
5 Laporan.`,

  'TARGET IK SUBKEGIATAN PD': `Definisi: Nilai capaian indikator SubKegiatan PD yang diharapkan pada akhir periode Renstra.

Contoh:
2 Laporan.`,

  'SATUAN IK SUBKEGIATAN PD': `Definisi: Unit ukuran indikator SubKegiatan PD yang dipakai agar jelas dan konsisten.

Contoh:
Laporan.`,

  'OPD PENANGGUNG JAWAB KEGIATAN': `Definisi: Perangkat Daerah (OPD/SKPK/Dinas) yang bertanggung jawab melaksanakan dan mencapai target SubKegiatan PD ini.

Fungsi: Memberikan kejelasan siapa yang harus memastikan SubKegiatan berjalan & target tercapai.

Contoh:
BKPSDM

Jika SubKegiatan dilaksanakan lebih dari 1 OPD (masing-masing dengan baseline/target/satuan sendiri), tulis satu OPD per baris (Shift+Enter untuk baris baru) — urutannya harus sejajar dengan baris Baseline/Target/Satuan IK SubKegiatan.`,
};
