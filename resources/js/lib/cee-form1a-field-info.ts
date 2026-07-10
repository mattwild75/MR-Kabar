// Teks info popover utk form Input CEE 1a (Kuesioner) — mengikuti pola
// krs-field-info.ts (Definisi / Fungsi / Cara mengisi / Contoh), disesuaikan
// ke terminologi Lampiran 5 Form 1a Perdep PPKD No.4/2019.
export const CEE_FORM1A_FIELD_INFO: Record<string, string> = {
  RESPONDEN_NAMA: `Definisi: Nama lengkap pegawai yang mengisi kuesioner persepsi Lingkungan Pengendalian utk OPD ini.

Fungsi: Mengidentifikasi siapa saja yang sudah menjadi responden — dipakai jg utk mencegah 1 orang tercatat dobel (mengisi ulang dgn nama yang sama akan MENIMPA jawaban lamanya, bukan menambah baris baru).

Cara mengisi: ketik nama lengkap sesuai KTP/SK, tanpa gelar berlebihan.

Contoh:
dr. Marlina Yusuf, Sp.PD`,

  RESPONDEN_JABATAN: `Definisi: Jabatan struktural/fungsional responden saat mengisi kuesioner — minimal Eselon IV, sesuai ketentuan Perdep bahwa responden CEE adalah pejabat yang memahami kondisi lingkungan pengendalian OPD.

Fungsi: Menjadi bukti bahwa responden memenuhi syarat minimal eselon, dan membantu Sekretaris/Kepala OPD menilai keterwakilan unit kerja saat menyusun Form 1c.

Cara mengisi: tulis nama jabatan resmi sesuai SK penempatan.

Contoh:
Kasubag Umum dan Kepegawaian`,

  JAWABAN: `Definisi: Nilai persepsi responden atas tiap pertanyaan kuesioner, skala 1–4:
1 = Tidak Setuju/Belum ada/belum dibangun
2 = Kurang Setuju/sudah dibangun tapi belum konsisten
3 = Setuju/sudah dibangun dengan baik, masih bisa ditingkatkan
4 = Sangat Setuju/sudah dibangun dengan baik & dapat ditularkan ke organisasi lain

Fungsi: Menjadi dasar perhitungan Modus (nilai yang paling sering muncul dari seluruh responden) per pertanyaan — Modus 3 atau 4 disimpulkan "Memadai", Modus 1 atau 2 disimpulkan "Kurang Memadai".

Cara mengisi: klik salah satu angka 1–4 utk tiap pertanyaan sesuai penilaian jujur responden terhadap kondisi riil di OPD, BUKAN kondisi ideal yang diharapkan.`,
};
