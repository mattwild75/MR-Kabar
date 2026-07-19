// Teks info popover utk form Input CEE 1d (RTP CEE) — mengikuti pola
// krs-field-info.ts, disesuaikan ke terminologi Lampiran 5 Form 6 Perdep
// PPKD No.4/2019 (RTP atas Kelemahan Lingkungan Pengendalian).
export const CEE_FORM1D_FIELD_INFO: Record<string, string> = {
  UNSUR: `Definisi: Salah satu dari 8 unsur Lingkungan Pengendalian (A–H) sesuai PP 60/2008 yang simpulan akhirnya di Form 1c berstatus "Kurang Memadai" — hanya unsur berstatus ini yang muncul di daftar pilihan, karena unsur "Memadai" tidak perlu RTP.

Fungsi: Mengaitkan RTP ini ke unsur Lingkungan Pengendalian yang tepat, supaya Form Cetak 6 (RTP atas CEE) mengelompokkan RTP per unsur secara otomatis sesuai urutan Perdep (A-H).

Cara mengisi: pilih dari dropdown — begitu dipilih, field "Kondisi Lingkungan Pengendalian yang Kurang Memadai" di bawah otomatis terisi dari Penjelasan Simpulan yang sudah ditulis di 1c untuk unsur tsb.

Contoh: Jika Form 1c menyimpulkan unsur "Penegakan Integritas dan Nilai Etika" berstatus "Kurang Memadai" (mis. karena belum seluruh pegawai menandatangani pakta integritas), unsur itu akan muncul di daftar pilihan di sini.`,

  KONDISI_KURANG_MEMADAI: `Definisi: Uraian kondisi/kelemahan Lingkungan Pengendalian pada unsur terpilih yang menjadi dasar/alasan disusunnya RTP ini — sama isinya dengan Penjelasan Simpulan yang sudah ditulis Sekretaris Dinas/Badan di Form 1c untuk unsur tsb.

Fungsi: Menjadi konteks "masalah apa yang sedang diperbaiki" pada Form Cetak 6 kolom (b) — pembaca (Inspektorat/pimpinan) bisa langsung memahami hubungan antara kelemahan yang ditemukan dan RTP yang direncanakan untuk mengatasinya.

Cara mengisi: terisi OTOMATIS begitu memilih Unsur di atas (diambil dari Penjelasan Simpulan 1c) — boleh disunting/dipersingkat bila perlu, tapi jangan sampai mengubah makna aslinya dari 1c.

Contoh: "Belum seluruh pegawai menandatangani pakta integritas terbaru pasca reorganisasi unit penanganan PMKS."`,

  RENCANA_TINDAK_PENGENDALIAN: `Definisi: Aksi konkret yang direncanakan untuk memperbaiki kondisi Lingkungan Pengendalian yang kurang memadai di atas — setara dengan RTP pada Form Input Risiko (IRS/IRO), tapi levelnya lingkungan pengendalian (unsur), bukan risiko individual.

Fungsi: Menjadi rencana tindak yang dicetak di Form Cetak 6 kolom (c) — dasar bagi Unit Kepatuhan/Inspektorat memantau apakah kelemahan Lingkungan Pengendalian sudah ditindaklanjuti sesuai Tahap 3 (Kegiatan Pengendalian) Perdep Bab III.

Cara mengisi: tulis aksi yang jelas & terukur, sebaiknya bisa diverifikasi realisasinya (bukan sekadar niat).

Contoh: "Sosialisasi ulang pakta integritas & penandatanganan bagi pegawai baru/mutasi di unit penanganan PMKS."`,

  PENANGGUNG_JAWAB: `Definisi: Jabatan/unit yang bertugas melaksanakan RTP di atas — sama konsepnya dengan "Unit/OPD Penanggung Jawab Pengendalian" pada Form Input Risiko, tapi di sini levelnya lingkungan pengendalian (unsur CEE), bukan risiko individual.

Fungsi: Menunjukkan siapa yang bisa dimintai pertanggungjawaban/progres oleh Kepala OPD atau Inspektorat atas realisasi RTP unsur ini.

Cara mengisi: tulis nama jabatan atau unit kerja, bukan nama orang.

Contoh: "Sekretaris Dinas Sosial", "Kepala Bidang Kepegawaian", "Inspektorat".`,

  TARGET_WAKTU_PENYELESAIAN: `Definisi: Triwulan & tahun target selesainya RTP ini dilaksanakan — dipasangkan (Triwulan + Tahun) sama seperti field Target Waktu Penyelesaian pada Form Input Risiko (IRS/IRO).

Fungsi: Menjadi acuan pemantauan berjenjang (Tahap 5 Perdep) untuk menilai apakah RTP terlaksana tepat waktu — dicetak di Form Cetak 6 kolom (e).

Cara mengisi: pilih Triwulan (I-IV) lalu isi Tahun secara terpisah — mis. Triwulan II 2026 berarti target selesai antara April-Juni 2026.`,

  REALISASI_PENYELESAIAN: `Definisi: Triwulan & tahun REALISASI RTP ini benar-benar selesai dilaksanakan — dibandingkan dengan Target Waktu Penyelesaian di atas untuk menilai ketepatan waktu.

Fungsi: Menjadi bukti tindak lanjut nyata (bukan sekadar rencana), dicetak di Form Cetak 6 kolom (f) — kolom ini sengaja terpisah dari Target supaya perbedaan rencana vs realisasi terlihat jelas saat dipantau Unit Kepatuhan/Inspektorat.

Cara mengisi: kosongkan dulu bila RTP belum selesai dilaksanakan — isi Triwulan & Tahun setelah RTP benar-benar terealisasi, boleh diedit kapan saja dari daftar RTP di bawah form.`,
};
