// Teks info popover utk Form Input 10 (Pencatatan Kejadian Risiko &
// Pelaksanaan RTP) — mengikuti pola irs-field-info.ts, disesuaikan
// terminologi Lampiran 5 Form 10 Perdep PPKD No.4/2019.
export const PENCATATAN_KEJADIAN_FIELD_INFO: Record<string, string> = {
  tanggal_terjadi: `Definisi: Tanggal risiko yang teridentifikasi ini BENAR-BENAR TERJADI pada tahun penilaian berjalan — bagian dari kolom "Kejadian Risiko" (d) Form 10.

Fungsi: Membedakan risiko yang sekadar diperkirakan/berpotensi (saat identifikasi di IRS/IRO) dari risiko yang sudah benar-benar terealisasi menjadi kejadian nyata — dasar evaluasi apakah RTP yang disusun sebelumnya efektif mencegah/menangani kejadian ini.

Cara mengisi: kosongkan bila risiko ini BELUM terjadi sepanjang tahun berjalan (akan tercetak "Tidak Terjadi" di Form Cetak 10) — isi tanggal begitu risiko benar-benar terjadi.

Contoh: 15 Maret 2026`,

  sebab_saat_kejadian: `Definisi: Penyebab AKTUAL risiko ini terjadi pada tahun berjalan — kolom (e) Form 10, BERBEDA dari "Uraian Penyebab Risiko" di Form Input IRS/IRO (yang itu penyebab PERKIRAAN saat risiko diidentifikasi, bukan penyebab riil setelah kejadian benar-benar terjadi).

Fungsi: Memberi data nyata untuk mengevaluasi apakah penyebab yang diperkirakan sebelumnya cocok dengan penyebab sebenarnya — bisa jadi bahan perbaikan identifikasi risiko di tahun berikutnya.

Cara mengisi: kosongkan bila risiko belum terjadi — isi penyebab spesifik begitu kejadian benar-benar terjadi.

Contoh: "Jumlah tenaga kesehatan belum memadai (tenaga laboratorium, dokter, tenaga kesehatan)"`,

  dampak_saat_kejadian: `Definisi: Dampak AKTUAL yang timbul akibat risiko ini terjadi — kolom (f) Form 10, BERBEDA dari "Uraian Dampak Risiko" di Form Input IRS/IRO (yang itu dampak PERKIRAAN, bukan dampak riil).

Fungsi: Mencatat konsekuensi nyata yang benar-benar dialami, menjadi bukti seberapa serius kejadian ini dan dasar prioritas RTP lanjutan.

Cara mengisi: kosongkan bila risiko belum terjadi — isi dampak spesifik yang benar-benar dialami begitu kejadian terjadi.

Contoh: "Kematian Bayi"`,

  keterangan_kejadian: `Definisi: Catatan tambahan seputar kejadian risiko ini — kolom (g) Form 10, opsional.

Fungsi: Memberi konteks tambahan tentang kejadian yang tidak tertampung di kolom Sebab/Dampak, mis. sumber informasi kejadian atau eskalasi yang dilakukan.

Cara mengisi: opsional — tulis catatan singkat bila perlu.

Contoh: "Diisi dengan keterangan tambahan"`,

  rencana_pelaksanaan_rtp: `Definisi: Triwulan & tahun rencana RTP (yang sudah disusun di Form Input Risiko/CEE) dilaksanakan — kolom (i) Form 10.

Fungsi: Menghubungkan kejadian risiko yang tercatat dengan RTP yang direncanakan untuk mengatasinya, menjadi acuan pemantauan berjenjang.

Cara mengisi: pilih Triwulan (I-IV) lalu isi Tahun secara terpisah, sesuaikan dengan target waktu RTP yang relevan.

Contoh: Triwulan IV 2026`,

  realisasi_pelaksanaan_rtp: `Definisi: Waktu REALISASI RTP untuk risiko ini benar-benar dilaksanakan — kolom (j) Form 10, dibandingkan dengan Rencana Pelaksanaan di atas.

Fungsi: Bukti tindak lanjut nyata pasca kejadian risiko terjadi — kalau realisasi jauh dari rencana, bisa jadi sinyal RTP perlu dievaluasi ulang.

Cara mengisi: kosongkan dulu bila RTP belum selesai dilaksanakan — isi setelah RTP benar-benar terealisasi, boleh bulan/tahun bebas.

Contoh: "Oktober 2026"`,

  keterangan_rtp: `Definisi: Catatan tambahan seputar realisasi RTP untuk kejadian risiko ini — kolom (k) Form 10, opsional.

Fungsi: Mencatat hasil/efektivitas RTP secara kualitatif, mis. apakah RTP sudah terbukti efektif atau efektivitasnya belum bisa diukur.

Cara mengisi: opsional — tulis catatan singkat bila perlu.

Contoh: "Telah dilaksanakan, efektifitas RTP belum dapat diukur", "Telah dilaksanakan dan ditindaklanjuti"`,
};
