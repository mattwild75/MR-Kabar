// Teks info popover utk form Input CEE 1b (CEE Berdasarkan Dokumen) —
// mengikuti pola krs-field-info.ts, disesuaikan ke terminologi Lampiran 5
// Form 1b Perdep PPKD No.4/2019 (reviu dokumen: LHP BPK/Inspektorat, media
// massa, dsb, bukan persepsi pegawai seperti Form 1a).
export const CEE_FORM1B_FIELD_INFO: Record<string, string> = {
  PENGISI_NAMA: `Definisi: Nama lengkap pegawai yang melakukan reviu dokumen & mencatat kelemahan Lingkungan Pengendalian utk OPD ini.

Fungsi: Mengidentifikasi penanggung jawab hasil reviu dokumen, umumnya berbeda dari responden kuesioner Form 1a karena Form 1b butuh analisis dokumen (Renstra, SOP, LHP), bukan sekadar persepsi.

Cara mengisi: ketik nama lengkap sesuai KTP/SK.

Contoh:
Cut Rahmawati, S.E.`,

  PENGISI_JABATAN: `Definisi: Jabatan pengisi Form 1b — Pengisi Teknis Terbaik menurut Perdep adalah Kasubag Perencanaan (Perencana Ahli) bersama Pengelola Kepegawaian, karena memahami dokumen tata laksana, Renstra, indikator kinerja, dan aturan disiplin pegawai.

Fungsi: Menunjukkan kompetensi pengisi dalam menilai dokumen sumber kelemahan.

Cara mengisi: tulis nama jabatan resmi sesuai SK penempatan.

Contoh:
Kasubag Perencanaan`,

  SUB_UNSUR: `Definisi: Salah satu dari 8 sub unsur Lingkungan Pengendalian (A–H) sesuai PP 60/2008 yang paling relevan dengan kelemahan yang ditemukan pada dokumen.

Fungsi: Mengelompokkan temuan kelemahan ke unsur yang tepat, supaya bisa digabungkan dengan hasil Form 1a saat menyusun Simpulan Form 1c per unsur.

Cara mengisi: pilih dari daftar dropdown sesuai isi Uraian Kelemahan — mis. temuan soal SOP/kebijakan pilih unsur "Struktur Organisasi", temuan soal audit internal pilih "Kepemimpinan yang Kondusif".

Contoh: Temuan LHP tentang audit kinerja yang belum dilakukan Inspektorat → pilih unsur "Peran Aparat Pengawasan Intern Pemerintah yang Efektif"; temuan soal pakta integritas pegawai yang belum ditandatangani → pilih unsur "Penegakan Integritas dan Nilai Etika".`,

  SUMBER_DATA: `Definisi: Dokumen/referensi asal ditemukannya kelemahan Lingkungan Pengendalian — LHP BPK, SK Inspektur, hasil reviu SPIP Inspektorat, media massa, dsb.

Fungsi: Menjadi bukti tertelusur (auditable) atas setiap temuan kelemahan, sesuai prinsip Form 1b yang berbasis dokumen (bukan opini).

Cara mengisi: tulis nomor & tanggal dokumen bila ada, atau nama sumber media bila dari media massa.

Contoh:
LHP BPK No. 12/LHP/XVIII.ACE/05/2025 tanggal 20 Mei 2025`,

  URAIAN_KELEMAHAN: `Definisi: Penjelasan singkat kelemahan Lingkungan Pengendalian yang ditemukan dari dokumen sumber di atas.

Fungsi: Menjadi dasar penilaian "Kurang Memadai" pada Hasil Reviu Dokumen di Form 1c — jika ada minimal satu kelemahan pada sub unsur tsb, sub unsur itu otomatis dinilai "Kurang Memadai" dari sisi dokumen.

Cara mengisi: tulis dalam satu-dua kalimat, jelas & spesifik, hindari opini tanpa dasar.

Contoh:
Inspektorat Daerah belum melakukan audit kinerja atas penyelenggaraan Urusan Kesehatan pada tingkat strategis selama tahun berjalan.`,
};
