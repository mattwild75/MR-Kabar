// Transkrip teks MsgBox dari VBA (I_a_IRS_Pemda / I_b_IRS_Pemda) — ditampilkan
// sebagai info popover di samping label tiap field pada form Tambah/Edit Data.
export const IRS_FIELD_INFO: Record<string, string> = {
  'SASARAN RPJMD': `Definisi: Sasaran RPJMD adalah hasil spesifik yang ingin dicapai pemerintah kabupaten dalam periode 5 tahun.

Fungsinya dalam Risiko Strategis: Menjadi objek yang dilindungi => karena risiko muncul ketika ada ancaman terhadap tercapainya sasaran.

Setiap sasaran harus dianalisis apakah ada potensi hambatan, ancaman, atau ketidakpastian yang bisa menggagalkan pencapaiannya.`,

  'URAIAN RISIKO': `Definisi: Penjelasan mengenai peristiwa atau kondisi yang berpotensi menghambat tercapainya sasaran RPJMD.

Fungsinya dalam Risiko Strategis: Menjelaskan apa risikonya, bagaimana risikonya terjadi, dan dampaknya terhadap sasaran.
Menjadi dasar untuk menyusun langkah mitigasi/pengendalian risiko.

Contoh:
Perlambatan ekonomi nasional yang menyebabkan bertambahnya pengangguran

Jika ada lebih dari 1 uraian risiko, maka ditulis juga sel dibawahnya, dengan contoh:
Perlambatan ekonomi nasional yang menyebabkan bertambahnya pengangguran
Rendahnya keterampilan tenaga kerja lokal sehingga sulit bersaing`,

  'TAHUN DINILAI RISIKO': `Definisi: Tahun identifikasi/penilaian risiko ini dilakukan, format 4 digit (mis. 2026) — BUKAN tahun risikonya diperkirakan terjadi, melainkan tahun proses penilaian/identifikasi risiko ini dikerjakan oleh UPR.

Fungsi: Menjadi komponen ke-2 pada struktur Kode Risiko sesuai Perdep PPKD No.4/2019 (Lampiran 6) — dipakai untuk membedakan penilaian tahun berjalan dari penilaian tahun-tahun sebelumnya, dan jadi dasar filter data per tahun di seluruh Form Cetak (2a-7).

Cara mengisi: default otomatis mengikuti Tahun Aktif Pemda (bisa dilihat di badge "Tahun Aktif" pada menu terkait) — boleh diganti manual bila sedang mengisi data untuk tahun penilaian lain (mis. menyusun ulang data tahun lampau).

Contoh: 2026 → 2 digit terakhir ("26") dipakai pada Kode Risiko, mis. RSO.26.00.05.01.`,

  'JENIS RISIKO': `Definisi: Klasifikasi risiko berdasarkan bidang/urusan pemerintahan yang paling relevan dengan sumber/dampak risiko tersebut, mengikuti 41 kode urusan pemerintahan wajib & pilihan baku.

Fungsi: Menjadi komponen ke-3 pada struktur Kode Risiko (2 digit, mis. "37" = Keuangan dan Pendapatan) — dipakai untuk mengelompokkan & merekap risiko lintas-OPD berdasarkan bidang urusan yang sama, bukan berdasarkan OPD penilainya.

Cara mengisi: klik tombol daftar di samping field untuk memilih dari 41 kode urusan pemerintahan yang tersedia (format "kode - nama urusan").

Contoh: "02 - Kesehatan" untuk risiko terkait pelayanan kesehatan masyarakat, "37 - Keuangan dan Pendapatan" untuk risiko terkait pengelolaan APBD.`,

  'ENTITAS PD YANG MENILAI': `Definisi: Perangkat Daerah/entitas yang melakukan penilaian atas risiko ini — BUKAN selalu sama dengan Pemilik Risiko atau Penanggung Jawab Pengendalian, melainkan siapa yang secara administratif mencatat & menilai risiko tsb.

Fungsi: Menjadi komponen ke-4 pada struktur Kode Risiko (2 digit urutan entitas, mis. "30" = Inspektorat) — memastikan kode risiko tetap unik meski dua OPD berbeda menilai risiko dengan Tahun+Jenis Risiko yang sama.

Cara mengisi: klik tombol daftar di samping field untuk memilih dari daftar instansi/OPD yang tersedia.

Contoh: Risiko strategis Pemda tentang stunting dinilai oleh Bappeda (fasilitator FGD) → Entitas PD yang Menilai = "Bappeda", walau Pemilik Risikonya tetap Bupati.`,

  'NOMOR URUT RISIKO': `Definisi: Nomor urut risiko (2 digit, "01", "02", dst) sebagai komponen TERAKHIR pada Kode Risiko — dihitung ulang otomatis, di-reset per kombinasi unik Tahun + Jenis Risiko + Entitas PD yang Menilai.

Fungsi: Memastikan setiap risiko dalam satu kombinasi Tahun+Jenis+Entitas punya kode yang unik dan berurutan, sesuai format Kode Risiko Perdep PPKD No.4/2019 (Lampiran 6).

Cara mengisi: TIDAK PERLU diisi manual — dihitung & ditampilkan otomatis oleh sistem berdasarkan urutan baris yang sudah tersimpan, sama seperti Skala Risiko yang juga dihitung ulang, bukan disimpan sebagai pilihan bebas.`,

  'PEMILIK RISIKO': `Definisi: Unit Pemilik Risiko (UPR) — unit organisasi yang bertanggung jawab melakukan pengelolaan risiko di lingkup kerjanya (Perdep Bab II.B.4), BERBEDA dari "Penanggung Jawab" yang sifatnya tunggal/strategis (selalu Kepala Daerah).

UPR berjenjang sesuai level organisasi (Perdep Lampiran 2 — Struktur Pengelolaan Risiko):
- UPR Tingkat Pemerintah Daerah => Ketua: Kepala Daerah; Koordinator: Kepala Bappeda; Anggota: seluruh Kepala OPD (termasuk Sekda)
- UPR Tingkat Eselon 1 (khusus provinsi) => Ketua: Sekretaris Daerah Provinsi; Koordinator: Kepala Biro Perencanaan Setda
- UPR Tingkat Eselon 2 => Ketua: Sekretaris Daerah (kabupaten/kota) / Kepala OPD lain
- UPR Tingkat Eselon 3/4 => Kepala Bidang, Kasubbag/Kasi

PENTING utk baris TINGKAT RISIKO="Risiko Strategis Pemda": Pemilik Risiko HARUS SELALU Bupati/Wali Kota/Gubernur (Ketua UPR Tingkat Pemda) — Kepala OPD (Inspektur, Direktur RSUD, Kepala Dinas, dst) hanya "Anggota" di jenjang ini, BUKAN Pemilik Risiko formal, meski mereka sumber/domain teknis risikonya. Jangan isi Kepala OPD di kolom ini kalau TINGKAT RISIKO-nya Strategis Pemda.

Fungsi: melaksanakan penilaian risiko, melaporkan peristiwa risiko, menyusun hasil penilaian risiko, serta monitoring pengendalian di unit kerjanya masing-masing — sifatnya operasional, bukan sekadar kebijakan.

Contoh (level Pemda): Risiko gagal mencapai target kemiskinan => Pemilik Risiko: Bupati (Ketua UPR Tingkat Pemda) — WAJIB Bupati krn TINGKAT RISIKO-nya Strategis Pemda, bukan Kepala Dinas Sosial meski risiko ini domain teknisnya di sana.
Contoh (level OPD): Risiko keterlambatan proyek fisik => Pemilik Risiko: Kepala Dinas PUPR (UPR Tingkat Eselon 2).`,

  'URAIAN PENYEBAB RISIKO': `Definisi: Faktor langsung atau kondisi yang memunculkan risiko, diklasifikasikan memakai kerangka 7M + 1E (pengembangan dari 5M/fishbone klasik) — boleh pilih lebih dari 1 kategori sekaligus kalau risikonya disebabkan gabungan beberapa faktor.

Kategori 7M (faktor internal — dalam kendali/pengaruh OPD):
- Men (Manusia/SDM): kompetensi, jumlah, atau perilaku SDM — mis. kurangnya jumlah petugas, SDM belum terlatih.
- Machine (Mesin/Peralatan/Sistem): peralatan, mesin, atau sistem/aplikasi — mis. server sering down, aplikasi belum terintegrasi.
- Method (Metode/Prosedur/Kebijakan): prosedur, SOP, atau kebijakan yang belum ada/belum memadai — mis. belum ada SOP baku.
- Material (Bahan/Data/Dokumen): ketersediaan/kualitas bahan, data, atau dokumen — mis. data tidak akurat, dokumen sumber tidak lengkap.
- Money (Anggaran/Pembiayaan): ketersediaan/kecukupan anggaran — mis. anggaran terbatas, pencairan anggaran terlambat.
- Management (Tata Kelola/Pengawasan): kelemahan pengawasan, koordinasi lintas unit, atau kepemimpinan — mis. belum ada mekanisme monitoring berkala, pengawasan berjenjang lemah.
- Measurement (Pengukuran/Indikator): kesalahan atau ketiadaan indikator/standar pengukuran kinerja — mis. indikator kinerja tidak terukur jelas, tidak ada baseline data.

Kategori 1E (faktor eksternal — di luar kendali OPD):
- Environment (Lingkungan): kondisi alam, cuaca, geografis, atau lingkungan sekitar yang berada di luar kendali OPD — mis. curah hujan ekstrem, bencana alam, kondisi geografis terpencil.

Catatan: kategori Environment di sini murni MENJELASKAN kondisi faktualnya (apa lingkungannya). Penilaian apakah faktor itu bisa dikendalikan OPD tetap diisi lengkap lewat field "Sumber Sebab Risiko" (Internal/Eksternal) dan "C / UC" (Controllable/Uncontrollable) di bawah — ketiganya saling melengkapi, bukan menggantikan satu sama lain.

Cara mengisi: centang kategori yang relevan (boleh lebih dari satu), lalu tulis uraian penyebabnya di kotak masing-masing kategori.

Contoh:
Money (Anggaran penanggulangan kemiskinan terbatas)
Material (Data kemiskinan tidak akurat)
Environment (Curah hujan ekstrem di luar prediksi normal menyebabkan debit air melampaui kapasitas desain tanggul)`,

  'SUMBER SEBAB RISIKO': `Definisi: Asal penyebab risiko — Internal, Eksternal, atau keduanya sekaligus (kalau kedua kotak dicentang, otomatis tergabung jadi "Internal dan Eksternal").

Cara mengisi: cukup centang Internal dan/atau Eksternal sesuai asal penyebabnya — tanpa uraian tambahan, cukup pilih kategorinya.

Contoh: Eksternal / Internal / Internal dan Eksternal`,

  'C / UC': `Definisi: Klasifikasi apakah risiko dapat dikendalikan (Controllable/C) atau tidak dapat dikendalikan (Uncontrollable/UC) oleh Perangkat Daerah.

Cara mengisi: cukup pilih C atau UC lewat tombol — tanpa uraian tambahan, cukup pilih kategorinya.`,

  'URAIAN DAMPAK RISIKO': `Definisi: Deskripsi konsekuensi/efek bila risiko terjadi.

Contoh:
Target penurunan kemiskinan tidak tercapai, menurunkan kepercayaan publik, menambah beban APBD.

Jika ada lebih dari 1 dampak risiko, maka ditulis juga sel dibawahnya, dengan contoh:
Target penurunan kemiskinan tidak tercapai
Menurunkan kepercayaan publik
Menambah beban APBD`,

  'PIHAK YANG TERKENA DAMPAK RISIKO': `Definisi: Stakeholder yang akan terdampak langsung atau tidak langsung jika risiko terjadi.

Contoh:
Masyarakat miskin => tidak mendapat manfaat program, Dunia usaha => daya beli masyarakat turun, Pemerintah Daerah => reputasi menurun

Jika ada lebih dari 1 pihak yang terkena dampak risiko, maka ditulis juga sel dibawahnya, dengan contoh:
Masyarakat
Dunia usaha
Pemerintah Daerah`,

  'URAIAN PENGENDALIAN YANG SUDAH ADA': `Definisi: Langkah-langkah mitigasi yang sudah dijalankan sebelum identifikasi risiko dilakukan.

Contoh:
Program bansos, pelatihan keterampilan kerja, pemberdayaan UMKM.

Jika ada lebih dari 1 mitigasi yang sudah dijalankan sebelum identifikasi risiko dilakukan, maka ditulis juga sel dibawahnya, dengan contoh:
Program bansos
Pelatihan keterampilan kerja
Pemberdayaan UMKM`,

  'KATEGORI EXISTING CONTROL': `Definisi: Penilaian efektivitas pengendalian yang SUDAH ADA (existing control) — kini 4 tingkat: Tidak Efektif (TE), Kurang Efektif (KE), Cukup Efektif (CE), Efektif (E).

Fungsi: Menentukan seberapa besar Skala Kemungkinan RESIDUAL (sisa risiko) turun dari Skala Kemungkinan INHEREN (risiko awal tanpa kontrol), lewat faktor reduksi (konvensi internal aplikasi ini, bukan angka baku dari Perdep PPKD/COSO — regulasi tidak menetapkan besaran faktor kuantitatif per kategori efektivitas):
- Tidak Efektif (TE) → faktor 1.0 (K residual = K inheren, kontrol dianggap tidak berfungsi).
- Kurang Efektif (KE) → faktor 0.8 (K turun sedikit).
- Cukup Efektif (CE) → faktor 0.6 (K turun sedang).
- Efektif (E) → faktor 0.4 (K turun banyak).
Skala Kemungkinan Residual = round(K inheren × faktor). Karena itu, bila kategori ini diisi, Skala Dampak & Kemungkinan INHEREN WAJIB diisi lebih dulu sebagai basis. Bila DIKOSONGKAN (risiko baru murni tanpa kontrol apa pun), Inheren otomatis disamakan dengan Residual dan Anda langsung menyusun RTP.

Cara mengisi: pilih kategori, uraian penjelasan opsional. Skala Kemungkinan Residual tetap bisa Anda ubah manual bila tidak setuju hasil hitung otomatis.`,

  'KATEGORI PROYEKSI RTP': `Definisi: Proyeksi efektivitas gabungan (existing control + RTP yang direncanakan) SETELAH RTP benar-benar dijalankan — dipakai menghitung Skala TARGET (kondisi yang diharapkan tercapai).

Faktor reduksi sama seperti Kategori Existing Control (TE 1.0 / KE 0.8 / CE 0.6 / E 0.4) — konvensi internal aplikasi, bukan angka baku regulasi. Faktor ini dikalikan ke KEDUA sumbu (Kemungkinan & Dampak) jika Rencana Tindak Pengendalian bersifat Avoid (kegiatan sumber risiko dihentikan), hanya ke Skala Kemungkinan Inheren jika bersifat Abate (kontrol preventif — mencegah kejadian), atau hanya ke Skala Dampak Inheren jika bersifat Mitigate/Share-Transfer (kontrol mitigatif/pengalihan — mengurangi konsekuensi). Kalau RTP bersifat Accept (atau tidak menyebut kategori respon risiko sama sekali), tidak ada sumbu yang ditekan — Skala Target = Skala Residual/Inheren tanpa reduksi. Pengelompokan ini terinspirasi kerangka COSO ERM (risk response categories), bukan kutipan langsung pasal Perdep. Skala Target inilah yang dicatat sebagai "sasaran" penurunan risiko, bukan hasil aktual.

Cara mengisi: pilih tingkat efektivitas yang Anda YAKIN bisa dicapai kalau RTP dilaksanakan sesuai rencana. Bisa di-override manual.`,

  'CELAH PENGENDALIAN': `Definisi: Kelemahan atau kekurangan dalam pengendalian yang ada saat ini.

Contoh:
Bansos belum tepat sasaran, Data kemiskinan belum terintegrasi, Koordinasi antar-OPD masih lemah

Jika ada lebih dari 1 kelemahan pengendalian yang sudah ada, maka ditulis juga sel dibawahnya, dengan contoh:
Bansos belum tepat sasaran
Data kemiskinan belum terintegrasi
Koordinasi antar-OPD masih lemah`,

  'RENCANA TINDAK PENGENDALIAN': `Definisi: Aksi tambahan yang direncanakan untuk menutup celah pengendalian risiko.

Setiap RTP diklasifikasikan ke salah satu atau kombinasi dari 5 jenis respon risiko berikut:

1. Avoid (Menghindari) — Mengurangi kemungkinan: YA | Mengurangi dampak: YA
Tidak memulai/melanjutkan kegiatan sumber risiko → secara konsep kemungkinan dan dampak idealnya sama-sama hilang total (risiko tidak lagi relevan). Di aplikasi ini, kedua sumbu tetap dihitung lewat faktor reduksi Kategori Proyeksi RTP yang sama seperti kategori lain (maksimal turun ke faktor Efektif = 0.4×, TIDAK otomatis menjadi nol) — pilih kategori efektivitas "Efektif (E)" jika RTP Avoid Anda benar-benar menghentikan sumber risiko secara tuntas.

2. Abate (Mengubah/Mengurangi Kemungkinan) — Mengurangi kemungkinan: YA | Mengurangi dampak: TIDAK
Fokus murni ke frekuensi/kemungkinan terjadinya risiko — istilah lain: pencegahan (prevention).

3. Mitigate (Mengubah/Mengurangi Konsekuensi) — Mengurangi kemungkinan: TIDAK | Mengurangi dampak: YA
Fokus murni ke besarnya dampak jika risiko terjadi — istilah lain: penanggulangan.

4. Share/Transfer (Membagi/Mentransfer) — Mengurangi kemungkinan: TIDAK (probabilitas tetap sama) | Mengurangi dampak: YA (dibagi ke pihak lain)
Tidak mengubah probabilitas terjadinya risiko, tapi mengurangi beban dampak yang ditanggung sendiri — dampak "dipindahkan" sebagian/seluruhnya ke pihak lain (asuransi, kontrak, kemitraan).

5. Accept/Retain (Menerima) — Mengurangi kemungkinan: TIDAK | Mengurangi dampak: TIDAK
Tidak ada pengurangan apa pun — risiko (sisa) diterima apa adanya.

Catatan pedoman: "Abate dan Mitigate terkadang disebut dalam satu istilah, yaitu mengurangi risiko (reduce)." Keduanya bisa dikombinasikan pada satu RTP jika kegiatan pengendalian yang dirancang menyasar frekuensi maupun dampak sekaligus (secara parsial) — beda dari Avoid yang menghilangkan keduanya secara total.

Ringkasan memilih:
- RTP yang murni menyasar frekuensi/kemungkinan → Abate
- RTP yang murni menyasar besarnya dampak → Mitigate
- RTP yang menghilangkan keduanya secara total (hentikan sumber risiko) → Avoid
- RTP yang memindahkan beban dampak ke pihak eksternal tanpa mengubah kemungkinan → Share/Transfer
- Tidak ada tindakan tambahan, risiko residual diterima → Accept

Boleh pilih lebih dari 1 kategori sekaligus jika satu RTP dirancang mencakup lebih dari satu jenis respon (mis. kombinasi Abate + Mitigate).

Contoh:
Abate (Integrasi database kemiskinan berbasis NIK — mengurangi kemungkinan salah sasaran); Mitigate (Kolaborasi dengan dunia usaha untuk penciptaan lapangan kerja — mengurangi dampak kemiskinan jika target belum tercapai)`,

  'UNIT/OPD PENANGGUNG JAWAB PENGENDALIAN': `Definisi: Unit/OPD yang bertugas melaksanakan Rencana Tindak Pengendalian (RTP) di atas — istilah Perdep Form 6/7: "Penanggung Jawab Pengendalian yang Dibutuhkan".

PENTING — ini BUKAN "Pemilik Risiko" (field di atas). Pemilik Risiko (UPR) adalah unit yang bertanggung jawab atas risiko secara keseluruhan; field ini levelnya lebih teknis — spesifik per satu kontrol/RTP tertentu, bisa OPD yang berbeda dari Pemilik Risiko (mis. risiko dimiliki Dinas A, tapi RTP-nya dilaksanakan Dinas B).

Contoh:
Dinas Sosial => validasi data kemiskinan, Dinas Tenaga Kerja => program pelatihan kerja, Bappeda => integrasi lintas-OPD

Jika ada lebih dari 1 OPD yang bertugas melaksanakan RTP, maka ditulis juga sel dibawahnya, dengan contoh:
Dinas Sosial
Dinas Tenaga Kerja
Bappeda`,

  'PENANGGUNG JAWAB PENGENDALIAN': `Definisi: JABATAN/pejabat spesifik yang berkompeten, berwenang, dan terkait dalam membangun pengendalian tsb — istilah Perdep Bab III: "...terdiri dari pihak-pihak yang berkompeten, berwenang, dan terkait dalam membangun pengendalian, yaitu Kepala Bidang."

PENTING — ini BUKAN nama OPD (itu field "Unit/OPD Penanggung Jawab Pengendalian" di atas), tapi JABATAN orangnya. Perdep tidak mengatur jenjang baku antara level risiko dan jabatan Penanggung Jawab Pengendalian — ditetapkan sesuai siapa yang paling kompeten & berwenang membangun kontrol untuk risiko tsb (bisa Kepala Bidang, Kasubbag, Kepala OPD, dst, tergantung konteks kontrolnya).

KHUSUS Risiko Strategis Pemda: instrumen pengendaliannya (Perkada/Keputusan Kepala Daerah/SE Kepala Daerah) hanya bisa diterbitkan Kepala Daerah, jadi Penanggung Jawab Pengendalian di sini Bupati/Wali Kota SECARA DEFAULT — sah walau Pemilik Risiko-nya juga Bupati (Ketua UPR Tingkat Pemda), karena kewenangan menerbitkan kontrol level Pemda memang tunggal di Kepala Daerah.

Pengecualian: kalau ADA pendelegasian eksplisit dari Bupati ke OPD/koordinator teknis tertentu (mis. lewat Perkada struktur pengelolaan risiko atau SK penugasan khusus), field ini BOLEH diisi jabatan yang didelegasikan tsb — bukan berarti "kalau lebih relevan secara substansi boleh diisi Kepala OPD". Kalau kontrol suatu risiko ternyata cukup ditangani lintas-OPD tanpa perlu payung hukum Bupati sama sekali, itu sinyal TINGKAT RISIKO-nya salah klasifikasi (seharusnya Risiko Strategis OPD, bukan dipaksakan tetap Strategis Pemda dgn PJP Kepala OPD).

Catatan Sekda: Sekda punya 2 peran tetap yang terpisah dari field ini — "Koordinator Penyelenggaraan Pengelolaan Risiko Pemda" (melekat di semua konteks risiko) dan "Pemilik Risiko" (Ketua UPR Tingkat Eselon 1/2, khusus risiko OPD Setda sendiri). Perdep tidak menyebut Sekda sbg Penanggung Jawab Pengendalian secara eksplisit; namun peran Koordinator Penyelenggaraan bisa jadi dasar pendelegasian PJP ke Sekda untuk risiko Strategis Pemda yang sifatnya koordinasi lintas-OPD (bukan kebijakan/keputusan definitif).

Contoh:
Bupati (risiko Strategis Pemda, default), Sekretaris Daerah selaku Koordinator Penyelenggaraan (risiko Strategis Pemda, didelegasikan krn sifatnya koordinasi teknis), Kepala Bagian Hukum Sekretariat Daerah (risiko Strategis OPD Setda sendiri)`,

  'TRIWULAN': `Definisi: Triwulan target selesainya rencana tindak pengendalian risiko, agar risiko bisa diminimalkan.

Cara mengisi: pilih salah satu dari 4 pilihan (Triwulan I s.d. IV), lengkap dengan bulan yang tercakup di dalamnya.

Diisi bersama TAHUN TARGET PENYELESAIAN di samping — mis. Triwulan II 2026 berarti target selesai antara April-Juni 2026.`,

  'TAHUN TARGET PENYELESAIAN': `Definisi: Tahun target selesainya rencana tindak pengendalian risiko, dipasangkan dengan TRIWULAN di samping.

Cara mengisi: ketik angka tahun (mis. 2026).`,

  'SKALA DAMPAK': `Definisi: Nilai (1-5) yang menggambarkan seberapa besar konsekuensi/kerugian jika risiko ini benar-benar terjadi — salah satu dari dua komponen penyusun Skala Risiko (bersama Skala Kemungkinan).

Fungsi: Dikalikan dengan Skala Kemungkinan lewat Matriks Analisis Risiko 5×5 untuk menghasilkan Skala Risiko (1-25), yang menentukan kategori Sangat Rendah s.d. Sangat Tinggi dan menjadi dasar Daftar Risiko Prioritas (Form 5).

Cara mengisi: klik tombol referensi di samping field untuk melihat tabel Kriteria Dampak (deskripsi tiap level 1-5, bisa disesuaikan Admin/Super Admin lewat Settings > Keterangan Pendukung), lalu pilih level yang paling sesuai dengan Uraian Dampak Risiko yang sudah ditulis.

Contoh: Risiko "target penurunan stunting tidak tercapai" berdampak pada indikator kesehatan daerah secara luas → dinilai Dampak level 4 (Tinggi), bukan level 1 (dampak sangat kecil/lokal).`,

  'SKALA KEMUNGKINAN': `Definisi: Nilai (1-5) yang menggambarkan seberapa besar peluang/frekuensi risiko ini akan terjadi — komponen kedua penyusun Skala Risiko (bersama Skala Dampak).

Fungsi: Dikalikan dengan Skala Dampak lewat Matriks Analisis Risiko 5×5 untuk menghasilkan Skala Risiko (1-25) — menentukan apakah risiko ini masuk kategori prioritas (Tinggi/Sangat Tinggi) yang wajib disusun RTP-nya di Form 7.

Cara mengisi: klik tombol referensi di samping field untuk melihat tabel Kriteria Kemungkinan (deskripsi tiap level 1-5, bisa disesuaikan Admin/Super Admin lewat Settings > Keterangan Pendukung), lalu pilih level berdasarkan seberapa sering kondisi/kejadian serupa pernah terjadi atau diperkirakan akan terjadi.

Contoh: Risiko "keterlambatan pencairan dana akibat perubahan regulasi pusat" jarang terjadi tapi pernah berulang beberapa tahun terakhir → dinilai Kemungkinan level 3 (Kadang Terjadi), bukan level 1 (Sangat Jarang).`,

  'SKALA DAMPAK INHEREN': `Definisi: Skala Dampak & Kemungkinan SEBELUM mempertimbangkan pengendalian yang sudah ada (existing control) — berbeda dari Skala Dampak/Kemungkinan di atas yang SELALU dinilai SETELAH mempertimbangkan pengendalian (itulah Sisa Risiko/Skala Residual). Perdep PPKD No.4/2019 Pasal 1 angka 10 mendefinisikan "Sisa Risiko" sebagai risiko setelah pengendalian — secara implisit membedakannya dari risiko inheren.

Fungsi: Kalau diisi, menjadi dasar widget Dashboard "Risiko Inheren vs Sisa Risiko" — membandingkan seberapa besar pengendalian yang ada berhasil menurunkan level risiko (Skala Risiko Inheren yang tinggi tapi Skala Risiko residual jadi rendah = pengendalian efektif).

Cara mengisi: OPSIONAL — bayangkan seandainya "Uraian Pengendalian yang Sudah Ada" TIDAK PERNAH ada, seberapa besar Dampak & Kemungkinan risiko ini? Boleh dikosongkan kalau Anda tidak ingin mengisi perbandingan inheren-residual untuk baris ini (Skala Risiko yang wajib tetap dihitung dari Skala Dampak/Kemungkinan residual di atas).

Contoh: Risiko "keterlambatan verifikasi data PMKS" — TANPA pengendalian sama sekali, Dampak dinilai 4 (Tinggi) & Kemungkinan 4 (Sering Terjadi) → Skala Risiko Inheren 19. SETELAH ada SOP verifikasi berkala (existing control), Skala Risiko residual (di atas) turun jadi Dampak 3/Kemungkinan 2 = 10 — menunjukkan pengendalian yang ada cukup efektif.`,
};
