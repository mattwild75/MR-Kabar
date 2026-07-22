// Teks info popover utk Form Input 8-9 (Monitoring RTP: Pengkomunikasian &
// Pemantauan) — mengikuti pola irs-field-info.ts, disesuaikan terminologi
// Lampiran 5 Form 8 & Form 9 Perdep PPKD No.4/2019.
export const MONITORING_RTP_FIELD_INFO: Record<string, string> = {
  media_komunikasi: `Definisi: Sarana yang dipakai untuk mengomunikasikan Kegiatan Pengendalian (RTP) kepada pihak-pihak terkait — kolom (c) Form 8, sesuai Tahap 4 Perdep Bab III (Informasi & Komunikasi).

Fungsi: Memastikan RTP yang sudah direncanakan diketahui pihak yang perlu menindaklanjuti/menyediakan dukungan — bukan hanya rencana di atas kertas yang tidak pernah dikomunikasikan.

Cara mengisi: tulis bentuk media komunikasinya secara singkat.

Contoh: "Rapat", "Rapat/Surat Edaran", "Surat usulan penambahan nakes dari BKD ke BKN", "Surat/nota dinas usulan pelatihan nakes dari Kepala Bidang kepada Kepala Dinas"`,

  penyedia_informasi: `Definisi: Pihak/jabatan yang MENYEDIAKAN/menyampaikan informasi tentang Kegiatan Pengendalian ini — kolom (d) Form 8.

Fungsi: Menunjukkan sumber informasi RTP, dicetak berdampingan dengan Penerima Informasi supaya alur komunikasi (siapa ke siapa) terlihat jelas di Form Cetak 8.

Cara mengisi: tulis jabatan/unit yang menyampaikan informasi — biasanya pihak yang menyusun/mengusulkan RTP.

Contoh: "Sekda/Bappeda", "BKD", "Dinas Kesehatan", "Kepala Bidang"`,

  penerima_informasi: `Definisi: Pihak/jabatan yang MENERIMA informasi tentang Kegiatan Pengendalian ini — kolom (e) Form 8, pasangan dari Penyedia Informasi.

Fungsi: Menunjukkan siapa yang perlu tahu/menindaklanjuti RTP ini, sehingga bisa dipantau apakah informasi benar-benar sampai ke pihak yang tepat.

Cara mengisi: tulis jabatan/unit yang menerima informasi — biasanya pihak yang akan melaksanakan atau mendukung pelaksanaan RTP.

Contoh: "Dinas Kesehatan BKPSDM", "BKN", "Staf Dinas Kesehatan terkait", "Kepala Dinkes"`,

  rencana_waktu_komunikasi: `Definisi: Triwulan & tahun target dilaksanakannya pengkomunikasian RTP ini — kolom (f) Form 8.

Fungsi: Menjadi acuan bagi Unit Kepatuhan/Inspektorat untuk memantau apakah pengkomunikasian RTP terlaksana tepat waktu.

Cara mengisi: pilih Triwulan (I-IV) lalu isi Tahun secara terpisah.

Contoh: Triwulan I 2026 (target dikomunikasikan antara Januari-Maret 2026)`,

  realisasi_waktu_komunikasi: `Definisi: Waktu REALISASI pengkomunikasian RTP ini benar-benar dilaksanakan — kolom (g) Form 8, dibandingkan dengan Rencana Waktu di atas untuk menilai ketepatan waktu.

Fungsi: Menjadi bukti komunikasi benar-benar terjadi (bukan sekadar rencana), dicetak berdampingan dengan Rencana Waktu pada Form Cetak 8.

Cara mengisi: kosongkan dulu bila belum terlaksana — isi setelah pengkomunikasian benar-benar terjadi, boleh berupa bulan/tahun bebas (tidak harus format Triwulan seperti Rencana).

Contoh: "Februari 2019", "Triwulan I 2026"`,

  keterangan_komunikasi: `Definisi: Catatan tambahan seputar pelaksanaan pengkomunikasian RTP ini — kolom (h) Form 8, opsional.

Fungsi: Memberi konteks tambahan yang tidak tertampung di kolom lain, mis. bentuk bukti dokumentasinya.

Cara mengisi: opsional — tulis catatan singkat bila perlu.

Contoh: "Telah dilaksanakan dan ditindaklanjuti. Dokumentasi berupa notulen."`,

  metode_pemantauan: `Definisi: Bentuk/metode yang dipakai untuk memantau pelaksanaan Kegiatan Pengendalian (RTP) ini — kolom (c) Form 9, sesuai Tahap 5 Perdep Bab III (Pemantauan).

Fungsi: Menunjukkan cara Penanggung Jawab Pemantauan mengecek progres RTP — beda dari pengkomunikasian (Form 8) yang sekadar menyampaikan info, ini soal MENGAWASI apakah RTP benar-benar berjalan.

Cara mengisi: tulis bentuk/metode pemantauannya secara singkat.

Contoh: "Konfirmasi persiapan dan laporan pelaksanaan kegiatan", "Konfirmasi/pemantauan berkelanjutan", "Konfirmasi pelaksanaan, Laporan pelaksanaan kegiatan"`,

  penanggung_jawab_pemantauan: `Definisi: Jabatan/pejabat yang bertanggung jawab MEMANTAU pelaksanaan RTP ini — kolom (d) Form 9.

Fungsi: Berbeda dari Penanggung Jawab Pengendalian (yang MELAKSANAKAN RTP, diisi di Form Input Risiko/CEE) — field ini adalah pihak yang MENGAWASI apakah pelaksanaan itu berjalan sesuai rencana, biasanya jabatan lebih senior dari pelaksana.

Cara mengisi: tulis nama jabatan (bukan nama orang).

Contoh: "Kepala Dinas Kesehatan", "Direktur RSUD", "BKD"`,

  rencana_waktu_pemantauan: `Definisi: Triwulan & tahun target dilaksanakannya pemantauan RTP ini — kolom (e) Form 9.

Fungsi: Menjadi jadwal acuan kapan Penanggung Jawab Pemantauan harus mengecek progres RTP — bisa lebih dari satu kali (mis. per triwulan) selama RTP belum sepenuhnya selesai.

Cara mengisi: pilih Triwulan (I-IV) lalu isi Tahun secara terpisah — boleh berbeda dari Rencana Waktu Komunikasi di Form 8, karena pemantauan biasanya berjalan setelah/berdampingan dengan komunikasi.

Contoh: Semester I 2019 (kalau memakai satuan semester, tulis di kolom Realisasi; kolom Rencana tetap pilih Triwulan terdekat, mis. Triwulan II 2019)`,

  realisasi_waktu_pemantauan: `Definisi: Waktu REALISASI pemantauan RTP ini benar-benar dilaksanakan — kolom (f) Form 9, dibandingkan dengan Rencana Waktu di atas.

Fungsi: Menjadi bukti pemantauan benar-benar terjadi, dasar penilaian Unit Kepatuhan/Inspektorat atas efektivitas pengawasan berjenjang (Tahap 5 Perdep).

Cara mengisi: kosongkan dulu bila belum terlaksana — isi setelah pemantauan benar-benar terjadi, boleh bulan/tahun bebas.

Contoh: "Juni 2019", "Oktober, November, Desember 2019"`,

  keterangan_pemantauan: `Definisi: Catatan tambahan seputar hasil pemantauan RTP ini — kolom (g) Form 9, opsional.

Fungsi: Memberi konteks hasil pemantauan yang tidak tertampung di kolom lain — mis. apakah pemantauan sudah didokumentasikan/didistribusikan ke pihak terkait.

Cara mengisi: opsional — tulis catatan singkat bila perlu.

Contoh: "Monitoring telah dilaksanakan, didokumentasikan, dan didistribusikan."`,

  kategori_existing_control_aktual: `Definisi: Efektivitas RIIL yang teramati SAAT PEMANTAUAN setelah RTP berjalan — dipakai menghitung Skala Risiko Aktual/Treated. Informasi tambahan di luar format baku Lampiran 5 Form 9 (tidak dicetak di kolom a-g resmi).

Fungsi: Faktor kategori dikalikan ke Skala Kemungkinan Inheren (RTP Avoid/Abate) atau Skala Dampak Inheren (RTP Mitigate/Share-Transfer) risiko sumber, sesuai jenis respon risiko pada RTP-nya — sama logika dengan Skala Target di Form Input Risiko. Membandingkan Target vs Aktual: bila Aktual lebih tinggi dari Target, berarti RTP tidak berjalan seefektif rencana (butuh tindak lanjut). Nilai Aktual BOLEH lebih tinggi dari Target — itu justru insight utamanya.

Cara mengisi: pilih efektivitas sebenarnya berdasarkan bukti pemantauan lapangan, sesudah RTP ini berjalan. Perlu Skala Kemungkinan Inheren risiko sumber sudah terisi (di Form Input Risiko) supaya bisa dihitung. Bisa di-override manual.`,
};
