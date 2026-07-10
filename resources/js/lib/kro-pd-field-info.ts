// Teks info popover untuk form Tambah/Edit III_a_KRO_PD — mengikuti pola
// krs-pd-field-info.ts (KRS_PD), diadaptasi ke terminologi Risiko
// Operasional Perangkat Daerah (dasarnya Renja/RKA, bukan Renstra
// langsung), tapi tetap berakar ke Sasaran Renstra yang sudah ada di
// KRS_PD — satu level lebih sedikit (tidak ada Tujuan/Sasaran Strategis
// PD, karena sudah cukup dirujuk lewat Sasaran Renstra).
export const KRO_PD_FIELD_INFO: Record<string, string> = {
  'SASARAN RENSTRA': `Definisi: Sasaran Renstra Perangkat Daerah yang menjadi induk/rujukan bagi Program pada Renja/RKA ini — BUKAN input bebas, melainkan pilihan dari Sasaran Strategis PD yang sudah dibuat di halaman II_a_KRS_PD.

Fungsi: Menjaga keterhubungan (cascading) antara Risiko Operasional PD dengan Risiko Strategis PD, supaya diagram visualisasi bisa naik sampai ke VISI Pemda.

Cara mengisi: pilih dari daftar dropdown, bukan mengetik teks baru. Jika Sasaran Renstra yang dibutuhkan belum ada di daftar, tambahkan dulu di halaman II_a_KRS_PD.`,

  'PROGRAM PD': `Definisi: Program Perangkat Daerah yang dipilih untuk mewujudkan Sasaran Renstra yang dirujuk, dilaksanakan lewat Kegiatan-Kegiatan pada Renja/RKA tahun berjalan.

Fungsi: Menjadi fokus penggunaan anggaran Perangkat Daerah dan dasar penyusunan RKA/DPA tahunan.

Contoh:
Program Pengembangan Sumber Daya Manusia.`,

  'IK PROGRAM PD': `Definisi: Ukuran keberhasilan pencapaian dari Program PD.

Contoh:
Program: Program Pengembangan Sumber Daya Manusia.
IK Program: Persentase ASN yang mendapatkan Pengembangan Kompetensi Dasar, Manajerial dan Fungsional.

Jika ada lebih dari 1 indikator, tulis satu indikator per baris (tekan Shift+Enter untuk baris baru).

Urutan baris harus sama dengan urutan baris di Baseline/Target/Satuan IK Program. Jika salah satu indikator tidak punya nilai di kolom lain, kosongkan barisnya saja (jangan digeser) supaya pasangannya tetap sejajar.`,

  'BASELINE IK PROGRAM PD': `Definisi: Nilai awal indikator Program PD pada tahun pertama Renja/RKA berjalan.

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Program.

Baris harus sejajar dengan IK Program yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya baseline.`,

  'TARGET IK PROGRAM PD': `Definisi: Nilai capaian indikator Program PD yang diharapkan pada akhir tahun anggaran berjalan.

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Program.

Baris harus sejajar dengan IK Program yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya target.`,

  'SATUAN IK PROGRAM PD': `Definisi: Unit ukuran indikator Program PD yang dipakai agar jelas dan konsisten.

Jika ada lebih dari 1 nilai satuan IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Program.

Baris harus sejajar dengan IK Program yang bersangkutan.`,

  'KEGIATAN PD': `Definisi: Kegiatan pada Renja/RKA Perangkat Daerah tahun berjalan, di bawah Program PD — INI ADALAH BASIS objek Risiko Operasional (sesuai Perdep PPKD No.4/2019 BPKP): setiap Risiko pada II_b_IRO_PD dikaitkan ke Kegiatan, bukan ke Sasaran atau SubKegiatan.

Fungsi: Menjadi rincian pelaksanaan Program PD yang dianggarkan dan dilaksanakan tahun berjalan.

Contoh:
Sertifikasi, Kelembagaan, Pengembangan Kompetensi Manajerial dan Fungsional.`,

  'IK KEGIATAN PD': `Definisi: Ukuran keberhasilan pencapaian dari Kegiatan PD.

Contoh:
Kegiatan: Sertifikasi, Kelembagaan, Pengembangan Kompetensi Manajerial dan Fungsional.
IK Kegiatan: Jumlah Dokumen dan Laporan Pelaksanaan Sertifikasi, Kelembagaan, Pengembangan Kompetensi Manajerial dan Fungsional.

Jika ada lebih dari 1 indikator, tulis satu indikator per baris (tekan Shift+Enter untuk baris baru).

Urutan baris harus sama dengan urutan baris di Baseline/Target/Satuan IK Kegiatan.`,

  'BASELINE IK KEGIATAN PD': `Definisi: Nilai awal indikator Kegiatan PD pada tahun berjalan.

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Kegiatan.

Baris harus sejajar dengan IK Kegiatan yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya baseline.`,

  'TARGET IK KEGIATAN PD': `Definisi: Nilai capaian indikator Kegiatan PD yang diharapkan pada akhir tahun anggaran berjalan.

Jika ada lebih dari 1 nilai IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Kegiatan.

Baris harus sejajar dengan IK Kegiatan yang bersangkutan — kosongkan barisnya (bukan menghapus barisnya) jika IK tersebut tidak punya target.`,

  'SATUAN IK KEGIATAN PD': `Definisi: Unit ukuran indikator Kegiatan PD yang dipakai agar jelas dan konsisten.

Jika ada lebih dari 1 nilai satuan IK, tulis satu nilai per baris (Shift+Enter) sesuai urutan baris di IK Kegiatan.

Baris harus sejajar dengan IK Kegiatan yang bersangkutan.`,

  'SUBKEGIATAN PD': `Definisi: SubKegiatan di bawah Kegiatan PD — unit TERKECIL dalam hierarki Risiko Operasional PD (level DPA), satu baris tabel data mewakili satu SubKegiatan. Dicatat untuk kelengkapan struktur Renja/RKA, TAPI Risiko (II_b_IRO_PD) tetap dikaitkan ke level Kegiatan, bukan ke SubKegiatan ini.

Fungsi: Menjadi rincian pelaksanaan Kegiatan PD yang paling operasional.

Contoh:
Penyelenggaraan Pengembangan Kompetensi bagi Pimpinan Daerah, Jabatan Pimpinan Tinggi, Jabatan Fungsional, Kepemimpinan, dan Prajabatan.`,

  'IK SUBKEGIATAN PD': `Definisi: Ukuran keberhasilan pencapaian dari SubKegiatan PD.

Contoh:
SubKegiatan: Penyelenggaraan Pengembangan Kompetensi bagi Pimpinan Daerah.
IK SubKegiatan: Jumlah Laporan Hasil Penyelenggaraan Pengembangan Kompetensi bagi Pimpinan Daerah.`,

  'BASELINE IK SUBKEGIATAN PD': `Definisi: Nilai awal indikator SubKegiatan PD pada tahun berjalan.

Contoh:
5 Laporan.`,

  'TARGET IK SUBKEGIATAN PD': `Definisi: Nilai capaian indikator SubKegiatan PD yang diharapkan pada akhir tahun anggaran berjalan.

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
